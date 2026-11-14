package net.montaki.ebankbot.controllers;

import jakarta.servlet.http.HttpServletResponse;
import net.montaki.ebankbot.agents.EbankAIAgent;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
public class EBankChatBotController {
    private EbankAIAgent ebankAIAgent;

    public EBankChatBotController(EbankAIAgent ebankAIAgent) {
        this.ebankAIAgent = ebankAIAgent;
    }

    @GetMapping(value = "/chat", produces = MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8")
    public String chat(@RequestParam(name = "query", defaultValue = "Bonjour") String query) {
        return ebankAIAgent.chat(new Prompt(query));
    }

    @GetMapping(value = "/chatStream", produces = MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8")
    public Flux<String> chatStream(@RequestParam(name = "query", defaultValue = "Bonjour") String query,
                                   HttpServletResponse response) {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Cache-Control", "no-store");
        return ebankAIAgent.chatStream(new Prompt(query));
    }
}
