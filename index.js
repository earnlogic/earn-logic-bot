const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// Firebase Setup (এটি সরাসরি Render-এর Environment থেকে তথ্য নেবে)
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

// বাটন মেনু (যেখানে রেফার ও উইথড্র যোগ করা হয়েছে)
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
  bot.sendMessage(msg.chat.id, "👋 স্বাগতম Earn Logic অফিশিয়াল বটে!", mainMenu);
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === 'balance') {
    db.ref('users/' + userId + '/balance').once('value').then((snapshot) => {
      const balance = snapshot.val() || 0;
      bot.sendMessage(chatId, `💰 আপনার বর্তমান ব্যালেন্স: ${balance} পয়েন্ট।`);
    });
  }

  if (query.data === 'profile') {
    bot.sendMessage(chatId, `👤 নাম: ${query.from.first_name}\n🆔 আইডি: ${userId}\n💰 ব্যালেন্স চেক করতে পাশের বাটনে ক্লিক করুন।`);
  }

  if (query.data === 'refer') {
    bot.sendMessage(chatId, `👥 আপনার রেফার লিঙ্ক:\nhttps://t.me/earnlogic_official_bot?start=${userId}`);
  }

  if (query.data === 'withdraw') {
    bot.sendMessage(chatId, "💸 উইথড্র করার জন্য বর্তমানে ওয়েবসাইট ব্যবহার করুন।");
  }
});
