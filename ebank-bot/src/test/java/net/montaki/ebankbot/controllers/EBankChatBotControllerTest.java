package net.montaki.ebankbot.controllers;

import net.montaki.ebankbot.agents.EbankAIAgent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EBankChatBotControllerTest {
    private EbankAIAgent agent;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        agent = mock(EbankAIAgent.class);
        mvc = MockMvcBuilders.standaloneSetup(new EBankChatBotController(agent)).build();
    }

    @Test
    void returnsPlainTextForClassicChat() throws Exception {
        when(agent.chat(any(Prompt.class))).thenReturn("**Deux comptes**");
        mvc.perform(get("/chat").param("query", "Liste des comptes"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string("**Deux comptes**"));
    }

    @Test
    void streamsRawTextWithoutJsonOrSseFraming() throws Exception {
        when(agent.chatStream(any(Prompt.class))).thenReturn(Flux.just("Les ", "comptes ", "bancaires"));
        MvcResult result = mvc.perform(get("/chatStream").param("query", "Liste des comptes"))
                .andExpect(request().asyncStarted())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andReturn();
        mvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string("Les comptes bancaires"));
    }

    @Test
    void preservesUnicodeInClassicChat() throws Exception {
        String answer = "Épargne — الحساب 💶";
        when(agent.chat(any(Prompt.class))).thenReturn(answer);
        mvc.perform(get("/chat").param("query", "Comptes épargne"))
                .andExpect(status().isOk())
                .andExpect(content().encoding(StandardCharsets.UTF_8))
                .andExpect(content().bytes(answer.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void flushesUnicodeChunksBeforeTheStreamCompletes() throws Exception {
        Sinks.Many<String> chunks = Sinks.many().unicast().onBackpressureBuffer();
        when(agent.chatStream(any(Prompt.class))).thenReturn(chunks.asFlux());
        MvcResult result = mvc.perform(get("/chatStream").param("query", "Comptes épargne"))
                .andExpect(request().asyncStarted())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andReturn();

        String firstChunk = "Épargne — الحساب 💶";
        chunks.emitNext(firstChunk, Sinks.EmitFailureHandler.FAIL_FAST);
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() ->
                assertEquals(firstChunk, result.getResponse().getContentAsString(StandardCharsets.UTF_8)));
        assertTrue(result.getRequest().isAsyncStarted());

        chunks.emitNext("\nSolde : 3400", Sinks.EmitFailureHandler.FAIL_FAST);
        chunks.emitComplete(Sinks.EmitFailureHandler.FAIL_FAST);
        mvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(content().encoding(StandardCharsets.UTF_8))
                .andExpect(content().bytes((firstChunk + "\nSolde : 3400").getBytes(StandardCharsets.UTF_8)));
    }
}
