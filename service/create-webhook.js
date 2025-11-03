// Endpoint que cria um webhook
const twilio = require("twilio");

module.exports = (app) => {
  app.post("/create-webhook", async (req, res) => {
    console.log("Mensagem recebida:");
    console.log(req.body);

    const { accountSid, authToken, flowSid, conversationSid, configurationUrl } = req.body;

    // Validação dos campos obrigatórios
    if (!conversationSid || !accountSid || !authToken) {
      return res.status(400).json({ 
        error: "Os campos conversationSid, accountSid e authToken são obrigatórios" 
      });
    }

    // Validação: deve ter flowSid OU configurationUrl, mas não ambos
    if (!flowSid && !configurationUrl) {
      return res.status(400).json({ 
        error: "Deve ser fornecido flowSid (para Studio) ou configurationUrl (para webhook)" 
      });
    }

    if (flowSid && configurationUrl) {
      return res.status(400).json({ 
        error: "Forneça apenas flowSid OU configurationUrl, não ambos" 
      });
    }

    try {
      let webhookData;

      if (flowSid) {
        // Criar webhook para Twilio Studio
        webhookData = await createStudioWebhook(accountSid, authToken, conversationSid, flowSid);
      } else {
        // Criar webhook para URL customizada
        webhookData = await createUrlWebhook(accountSid, authToken, conversationSid, configurationUrl);
      }

      res.status(200).json({
        success: true,
        message: "Webhook criado com sucesso",
        webhook: webhookData
      });

    } catch (error) {
      console.error("Erro ao criar webhook:", error);
      res.status(500).json({ 
        error: "Erro ao criar webhook",
        details: error.message 
      });
    }
  });
};

async function createStudioWebhook(accountSid, authToken, conversationSid, flowSid) {
  const client = twilio(accountSid, authToken);
  
  try {
    const webhook = await client.conversations.v1
      .conversations(conversationSid)
      .webhooks.create({
        "configuration.flowSid": flowSid,
        "configuration.replayAfter": 0,
        "configuration.filters": ["onMessageAdded"],
        target: "studio",
      });

    console.log("Webhook Studio criado:", webhook);
    
    return {
      type: "studio",
      sid: webhook.sid,
      flowSid: flowSid,
      target: webhook.target,
      filters: webhook.configuration.filters
    };

  } catch (error) {
    console.error("Erro ao criar webhook Studio:", error);
    throw new Error(`Falha ao criar webhook Studio: ${error.message}`);
  }
}

async function createUrlWebhook(accountSid, authToken, conversationSid, configurationUrl) {
  const client = twilio(accountSid, authToken);
  
  try {
    const webhook = await client.conversations.v1
      .conversations(conversationSid)
      .webhooks.create({
        "configuration.method": "POST",
        "configuration.filters": ["onMessageAdded"],
        "configuration.url": configurationUrl,
        target: "webhook",
      });

    console.log("Webhook URL criado:", webhook);
    
    return {
      type: "webhook",
      sid: webhook.sid,
      url: configurationUrl,
      target: webhook.target,
      method: webhook.configuration.method,
      filters: webhook.configuration.filters
    };

  } catch (error) {
    console.error("Erro ao criar webhook URL:", error);
    throw new Error(`Falha ao criar webhook URL: ${error.message}`);
  }
}