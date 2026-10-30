package net.montaki.ebankbot.agents;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.stereotype.Service;

@Service
public class EbankAIAgent {
    private ChatClient chatClient;

    public EbankAIAgent(ChatClient.Builder chatClient, ChatMemory chatMemory, ToolCallbackProvider tools) {
        this.chatClient = chatClient
                .defaultSystem("""
                        Vous un assistant qui se charge de repondre aux question
                        de L'utilisateur à propos des client et des comptes bancaires, en fonction du contexte fourni.
                        Si aucun contexte n'est fourni, repond avec JE NE SAIS PAS
                        """)
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .defaultAdvisors(a -> a.param(ChatMemory.CONVERSATION_ID, "default"))
                .defaultToolCallbacks(tools)
                .build();
    }

    public String chat(Prompt prompt) {
        return chatClient.prompt(prompt).call().content();
    }

}
