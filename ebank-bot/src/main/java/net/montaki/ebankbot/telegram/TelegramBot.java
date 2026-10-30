package net.montaki.ebankbot.telegram;

import jakarta.annotation.PostConstruct;
import net.montaki.ebankbot.agents.EbankAIAgent;
import org.springframework.stereotype.Component;

@Component
public class TelegramBot extends TelegramLongPollingBot {

    @Value("${telegram.token}")
    private String telegramBotToken;
    private EbankAIAgent aiAgent;

    public TelegramBot(EbankAIAgent aiAgent) {
        this.aiAgent = aiAgent;
    }

    @PostConstruct
    public void registerTelegramBot() {
        try {
            TelegramBotsApi api = new TelegramBotsApi(DefaultBotSession.class);
            api.registerBot(this);
        } catch (TelegramApiException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onUpdateReceived(Update telegraRequest) {
        try {
            if(!telegraRequest.hasMessage()) return;
            String messageText = telegraRequest.getMessage().getText();
            Long chatId = telegraRequest.getMessage().getChatId();
            List<PhotoSize> photos = telegraRequest.getMessage().getPhoto();
            List<Media> mediaList = new ArrayList<>();
            String caption =null;
            if (photos != null){
                caption = telegraRequest.getMessage().getCaption();
                if (caption == null) caption="What do see in this image";
                for (PhotoSize ps : photos) {
                    String fileId = ps.getFileId();
                    GetFile getFile = new GetFile();
                    getFile.setFileId(fileId);
                    File file = execute(getFile);
                    String filePath = file.getFilePath();
                    String textUrl = "https://api.telegram.org/file/bot"
                            + getBotToken() + "/" + filePath;
                    URL fileUrl = new URL(textUrl);
                    mediaList.add(Media.builder()
                            .id(fileId)
                            .mimeType(MimeTypeUtils.IMAGE_PNG)
                            .data(new UrlResource(fileUrl))
                            .build());
                }
            }
            String query = messageText != null?messageText:caption;
            UserMessage userMessage = UserMessage.builder()
                    .text(query)
                    .media(mediaList)
                    .build();
            sendTypingQuestion(chatId);
            String answer = aiAgent.chat(new Prompt(userMessage));
            sendTextMessage(chatId, answer);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }
    @Override
    public String getBotUsername() { return "ENSETAIBot"; }

    @Override
    public String getBotToken() { return telegramBotToken; }

    private void sendTextMessage(long chatId, String text) throws TelegramApiException{
        SendMessage sendMessage = new SendMessage(String.valueOf(chatId), text);
        execute(sendMessage);
    }

    private void sendTypingQuestion(long chatId) throws TelegramApiException {
        SendChatAction sendChatAction = new SendChatAction();
        sendChatAction.setChatId(String.valueOf(chatId));
        sendChatAction.setAction(ActionType.TYPING);
        execute(sendChatAction);
    }

}