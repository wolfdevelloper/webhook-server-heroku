// Endpoint que lista os webhooks
const twilio = require("twilio");
module.exports = (app) => {
  app.post("/list-webhook", async (req, res) => {
    console.log("Mensagem recebida:");
    console.log(req.body);

    const { conversationSid, accountSid, authToken } = req.body;

    // Validação se o conversationSid foi enviado
    if (!conversationSid || !accountSid || !authToken) {
      return res.status(400).json({ error: "Os campos conversationSid, accountSid e authToken são obrigatórios" });
    }
    
    try {
      const webhooksData = await listWebhooks(conversationSid, accountSid, authToken);
      // Retorna os webhooks como JSON
      res.status(200).json(webhooksData);
    } catch (error) {
      console.error("Erro ao buscar webhooks:", error);
      res.status(500).json({ error: "Erro ao buscar webhooks" });
    }
  });
};

async function listWebhooks(conversationSid, accountSid, authToken) {
    const client = twilio(accountSid, authToken);
  try {
    const webhooks = await client.conversations.v1
      .conversations(conversationSid)
      .webhooks.list();

    console.log("List of webhooks:", webhooks);

    const studioWebhookSid = webhooks.find(
      (webhook) => webhook.target === "studio"
    )?.sid;

    // Retorna os dados estruturados
    return {
      totalWebhooks: webhooks.length,
      webhooks: webhooks,
      studioWebhook: {
        found: !!studioWebhookSid,
        sid: studioWebhookSid || null
      }
    };

  } catch (error) {
    console.error("Error listing webhooks:", error);
    throw error; // Re-lança o erro para ser capturado no endpoint
  }
}