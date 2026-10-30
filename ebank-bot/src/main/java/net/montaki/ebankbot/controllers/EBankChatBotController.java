package net.montaki.ebankbot.controllers;

import net.montaki.ebankbot.agents.EbankAIAgent;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EBankChatBotController {
    private ChatClient chatClient;

    private EbankAIAgent ebankAIAgent;

    public EBankChatBotController(EbankAIAgent ebankAIAgent) {
        this.ebankAIAgent = ebankAIAgent;
    }


    @GetMapping(value = "/chat",produces = MediaType.TEXT_PLAIN_VALUE)
    public String chat(@RequestParam(name = "query", defaultValue = "Bonjour") String query) {
        return ebankAIAgent.chat(new Prompt(query));
    }
}