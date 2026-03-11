const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const express = require('express');

// Render Port Fix (Keep the server alive)
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Earn Logic Bot is Live!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

// Firebase Setup using Environment Variables
const serviceAccount = {
  "projectId": process.env.FIREBASE_PROJECT_ID,
  "privateKey": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  "clientEmail": process.env.FIREBASE_CLIENT_EMAIL
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Switching to Firestore (Crucial for your data)
const db = admin.firestore(); 

// Bot Token from Environment Variable
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// Main Menu Buttons
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🌐 Website', url: 'https://earn-logic.github.io' }],
      [{ text: '👤 Profile', callback_data: 'profile' }, { text: '💰 Balance', callback_data: 'balance' }],
      [{ text: '👥 Refer', callback_data: 'refer' }, { text: '💸 Withdraw', callback_data: 'withdraw' }]
    ]
  }
};

// Welcome Message
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 Welcome to Earn Logic Bot!", mainMenu);
});

// Button Actions
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  // Stop loading animation on button
  bot.answerCallbackQuery(query.id).catch(() => {});
  
  // 💰 Balance Logic (Fetching from Firestore)
  if (query.data === 'balance') {
    db.collection('users').doc(String(userId)).get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const coins = userData.coins || 0;
          bot.sendMessage(chatId, `💰 Your Current Balance: ${coins} Points.`);
        } else {
          bot.sendMessage(chatId, "💰 Your Current Balance: 0 Points.\n\n⚠️ Note: Please make sure your Telegram ID is linked on our website.");
        }
      })
      .catch((error) => {
        console.error("Firestore Error:", error);
        bot.sendMessage(chatId, "⚠️ Database Connection Error! Please try again later.");
      });
  }

  // 👤 Profile Logic
  if (query.data === 'profile') {
    bot.sendMessage(chatId, `👤 Name: ${query.from.first_name}\n🆔 Telegram ID: ${userId}`);
  }

  // 👥 Refer Logic
  if (query.data === 'refer') {
    bot.sendMessage(chatId, `👥 Invite your friends and earn points!\n\nYour Referral Link:\nhttps://t.me/earnlogic_official_bot?start=${userId}`);
  }

  // 💸 Withdraw Logic
  if (query.data === 'withdraw') {
    bot.sendMessage(chatId, "💸 Withdrawals must be requested through our official website.");
  }
});
