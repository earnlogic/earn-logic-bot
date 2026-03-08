const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// Firebase Admin Setup (Render-এর Environment Variables থেকে তথ্য নেবে)
const serviceAccount = {
  "projectId": "earn-logic",
  "privateKey": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "clientEmail": process.env.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://earn-logic-default-rtdb.firebaseio.com/"
});

const db = admin.database();
const token = '7891784914:AAHw53S8Xp6H571f5W6-qM0i0G6fR0G6fA';
const bot = new TelegramBot(token, {polling: true});

// মূল মেনু বাটন (সবগুলো অপশন সহ)
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🌐 ভিজিট ওয়েবসাইট', url: 'https://earn-logic.github.io' }],
      [{ text: '👤 প্রোফাইল', callback_data: 'profile' }, { text: '💰 ব্যালেন্স', callback_data: 'balance' }],
      [{ text: '👥 রেফার', callback_data: 'refer' }, { text: '💸 উইথড্র', callback_data: 'withdraw' }],
      [{ text: '🟦 Start Earning', url: 'https://earn-logic.github.io' }]
    ]
  }
};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 স্বাগতম Earn Logic অফিশিয়াল বটে!\n\nনিচের বাটনগুলো ব্যবহার করুন:", mainMenu);
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const userName = query.from.first_name;

  if (query.data === 'balance') {
    db.ref('users/' + userId + '/balance').once('value').then((snapshot) => {
      const balance = snapshot.val() || 0;
      bot.sendMessage(chatId, `💰 আপনার বর্তমান ব্যালেন্স: ${balance} পয়েন্ট।`);
    });
  }

  if (query.data === 'profile') {
    db.ref('users/' + userId).once('value').then((snapshot) => {
      const userData = snapshot.val() || {};
      const balance = userData.balance || 0;
      const totalRefer = userData.totalRefer || 0;
      
      const profileMsg = `👤 **ইউজার প্রোফাইল**\n\n` +
                         `🆔 আইডি: ${userId}\n` +
                         `📛 নাম: ${userName}\n` +
                         `💰 ব্যালেন্স: ${balance} পয়েন্ট\n` +
                         `👥 মোট রেফার: ${totalRefer} জন`;
      bot.sendMessage(chatId, profileMsg, { parse_mode: 'Markdown' });
    });
  }

  if (query.data === 'refer') {
    const referLink = `https://t.me/earnlogic_official_bot?start=${userId}`;
    bot.sendMessage(chatId, `👥 **আপনার রেফারাল সিস্টেম**\n\nআপনার বন্ধুদের ইনভাইট করুন এবং প্রতি রেফারে পয়েন্ট জিতে নিন!\n\n🔗 আপনার রেফার লিঙ্ক:\n${referLink}`, { parse_mode: 'Markdown' });
  }

  if (query.data === 'withdraw') {
    bot.sendMessage(chatId, "💸 **উইথড্র সিস্টেম**\n\nউইথড্র করার জন্য আপনার কমপক্ষে ১০০০ পয়েন্ট প্রয়োজন।\n\n(বর্তমানে উইথড্র রিকোয়েস্ট ওয়েবসাইট থেকে প্রসেস করা হচ্ছে।)", { parse_mode: 'Markdown' });
  }
});
