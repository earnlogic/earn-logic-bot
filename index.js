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
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://earn-logic-default-rtdb.firebaseio.com/"
  });
}

const db = admin.database();
const token = '8664803411:AAEcv_b4VoS5pBNeAJ5hqmVdtjg006E_qkg';
const bot = new TelegramBot(token, {polling: true});

// বাটন মেনু
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🌐 ওয়েবসাইট', url: 'https://earn-logic.github.io' }],
      [{ text: '👤 প্রোফাইল', callback_data: 'profile' }, { text: '💰 ব্যালেন্স', callback_data: 'balance' }],
      [{ text: '👥 রেফার', callback_data: 'refer' }, { text: '💸 উইথড্র', callback_data: 'withdraw' }]
    ]
  }
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 স্বাগতম Earn Logic বটে!", mainMenu);
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  bot.answerCallbackQuery(query.id);
  
  if (query.data === 'balance') {
    db.ref('users/' + userId + '/balance').once('value').then((snapshot) => {
      const balance = snapshot.val() || 0;
      bot.sendMessage(chatId, `💰 আপনার বর্তমান ব্যালেন্স: ${balance} পয়েন্ট।`);
    });
  }

  if (query.data === 'profile') {
    bot.sendMessage(chatId, `👤 নাম: ${query.from.first_name}\n🆔 আইডি: ${userId}`);
  }

  if (query.data === 'refer') {
    bot.sendMessage(chatId, `👥 রেফার লিঙ্ক:\nhttps://t.me/earnlogic_official_bot?start=${userId}`);
  }

  if (query.data === 'withdraw') {
    bot.sendMessage(chatId, "💸 উইথড্র বর্তমানে ওয়েবসাইট থেকে করতে হবে।");
  }
});
