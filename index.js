const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const express = require('express');

// Render Port Fix (Express Server)
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Earn Logic Bot is Live!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

// Firebase Setup
const serviceAccount = {
  "projectId": process.env.FIREBASE_PROJECT_ID,
  "privateKey": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "clientEmail": process.env.FIREBASE_CLIENT_EMAIL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // Firestore uses projectId from serviceAccount, so databaseURL is optional for Firestore
  });
}

// Switching to Firestore
const db = admin.firestore(); 

const token = '8664803411:AAEcv_b4VoS*****************006E_qkg';
const bot = new TelegramBot(token, {polling: true});

// Main Menu Button (English)
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🌐 Website', url: 'https://earn-logic.github.io' }],
      [{ text: '👤 Profile', callback_data: 'profile' }, { text: '💰 Balance', callback_data: 'balance' }],
      [{ text: '👥 Refer', callback_data: 'refer' }, { text: '💸 Withdraw', callback_data: 'withdraw' }]
    ]
  }
};

// Start Command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 Welcome to Earn Logic Bot!", mainMenu);
});

// Callback Query Logic
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  bot.answerCallbackQuery(query.id);
  
  // Balance Logic (Firestore)
  if (query.data === 'balance') {
    db.collection('users').doc(String(userId)).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const coins = userData.coins || 0;
          bot.sendMessage(chatId, `💰 Your Current Balance: ${coins} Points.`);
        } else {
          bot.sendMessage(chatId, "💰 Your Current Balance: 0 Points.\n(Please link your Telegram ID on our website)");
        }
      })
      .catch((error) => {
        console.error("Firestore Error:", error);
        bot.sendMessage(chatId, "⚠️ Error loading balance.");
      });
  }

  // Profile Logic
  if (query.data === 'profile') {
    bot.sendMessage(chatId, `👤 Name: ${query.from.first_name}\n🆔 ID: ${userId}`);
  }

  // Refer Logic
  if (query.data === 'refer') {
    bot.sendMessage(chatId, `👥 Referral Link:\nhttps://t.me/earnlogic_official_bot?start=${userId}`);
  }

  // Withdraw Logic
  if (query.data === 'withdraw') {
    bot.sendMessage(chatId, "💸 Withdrawals must be processed through our website.");
  }
});
