// Endpoint que recebe webhooks da Twilio
const express = require("express");

module.exports = (app) => {
  // Middleware para parsear URL-encoded data (formato que a Twilio envia)
  app.use('/webhook-listener', express.urlencoded({ extended: true }));

  app.post("/webhook-listener", (req, res) => {
    console.log("=== WEBHOOK RECEBIDO DA TWILIO ===");
    console.log("Timestamp:", new Date().toISOString());
    
    // Log dos dados recebidos
    console.log("Headers:", req.headers);
    console.log("Body completo:", req.body);
    
    // Extraindo os principais campos do payload
    const {
      EventType,
      ConversationSid,
      MessageSid,
      AccountSid,
      Author,
      Body,
      Source,
      ParticipantSid,
      MessagingServiceSid,
      ChatServiceSid,
      WebhookSid,
      DateCreated,
      Index,
      RetryCount,
      WebhookType,
      Attributes
    } = req.body;

    // Log estruturado da mensagem
    console.log("=== DADOS DA MENSAGEM ===");
    console.log("Tipo do Evento:", EventType);
    console.log("Conversation SID:", ConversationSid);
    console.log("Message SID:", MessageSid);
    console.log("Account SID:", AccountSid);
    console.log("Autor:", decodeURIComponent(Author || ''));
    console.log("Mensagem:", decodeURIComponent(Body || ''));
    console.log("Fonte:", Source);
    console.log("Data/Hora:", DateCreated);
    console.log("Índice:", Index);
    console.log("Tentativas:", RetryCount);
    
    // Log dos SIDs importantes
    console.log("=== SIDs IMPORTANTES ===");
    console.log("Participant SID:", ParticipantSid);
    console.log("Messaging Service SID:", MessagingServiceSid);
    console.log("Chat Service SID:", ChatServiceSid);
    console.log("Webhook SID:", WebhookSid);
    
    // Log dos atributos (se houver)
    if (Attributes) {
      try {
        const parsedAttributes = JSON.parse(decodeURIComponent(Attributes));
        console.log("Atributos:", parsedAttributes);
      } catch (error) {
        console.log("Atributos (raw):", Attributes);
      }
    }

    console.log("=== FIM DO WEBHOOK ===\n");

    // Resposta para a Twilio (deve ser rápida)
    res.status(200).json({
      success: true,
      message: "Webhook recebido com sucesso",
      timestamp: new Date().toISOString(),
      eventType: EventType,
      messageProcessed: true
    });
  });

  // Rota GET para testar se o endpoint está ativo
  app.get("/webhook-listener", (req, res) => {
    res.status(200).json({
      status: "active",
      message: "Webhook listener está ativo",
      timestamp: new Date().toISOString(),
      endpoint: "/webhook-listener",
      method: "POST"
    });
  });
};