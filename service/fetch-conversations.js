// Endpoint que lista a conversation
const twilio = require("twilio");
module.exports = (app) => {
  app.post("/fetch-conversations", async (req, res) => {
    console.log("Mensagem recebida:");
    console.log(req.body);

    const { conversationSid , accountSid, authToken } = req.body;

    // Validação se o conversationSid foi enviado
    if (!conversationSid || !accountSid || !authToken) {
      return res.status(400).json({ error: "Os campos conversationSid, accountSid e authToken são obrigatórios" });
    }
    
    try {
      const conversations = await fetchConversation(conversationSid, accountSid, authToken);
      // Retorna a conversation como JSON
      res.status(200).json(conversations);
    } catch (error) {
      console.error("Erro ao buscar conversation:", error);
      res.status(500).json({ error: "Erro ao buscar conversation" });
    }
  });
};

async function fetchConversation(conversationSid, accountSid, authToken) {
     const client = twilio(accountSid, authToken);
  try {
    const conversation = await client.conversations.v1
      .conversations(conversationSid)
      .fetch();

    console.log("Fetched conversation:", conversation);
    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
}