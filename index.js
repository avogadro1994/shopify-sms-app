const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const SMS_API_TOKEN = '117|IdUv6YT7RoFbMZc662Yqj1BDzjAsDsFgbEEjm2AQdefdb0ab ';  // ← tu changeras ça après
const SMS_SENDER_ID = 'KFM SMS';    // ← pareil ici

app.use(bodyParser.json());

app.post('/webhook/order-paid', async (req, res) => {
  const order = req.body;

  try {
    const nom = order.customer?.first_name || 'Client';
    const numero = order.customer?.phone || order.billing_address?.phone;
    if (!numero) return res.status(400).send('Pas de numéro trouvé.');

    const produits = order.line_items.map(p => `${p.quantity} x ${p.name}`).join(', ');
    const total = order.total_price;
    const numeroCommande = order.name;

    const message = `Merci ${nom}, votre commande ${numeroCommande} est confirmée. Produits : ${produits}. Total : ${total} ${order.currency}`;

    await axios.post('https://app.smspro.africa/api/http/sms/send', {
      api_token: SMS_API_TOKEN,
      sender_id: SMS_SENDER_ID,
      recipient: numero,
      type: 'plain',
      message: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    res.send('SMS envoyé');
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).send('Erreur SMS');
  }
});

app.get('/', (req, res) => {
  res.send('Application Shopify SMS active ✅');
});

app.listen(PORT, () => {
  console.log('✅ Application démarrée sur le port 3000');
});
