const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// Firebase Admin Setup
const serviceAccount = {
  "projectId": "earn-logic",
  "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAmohP0wxtlgVc\nXI+cOantlzWxgFOtVeHXX/zm+O4mS8kJ/bWrzUu97/s0C1ONkEJeD4TlHceT93oU\n/Xzqm/A+1IoS3LmCL4W/NQLJLVuphArFthdywfIgu6g+rqlir5scP/cLRh3fqorq\n0WGka9tHXcBUfOLF6f0dLwmnIZa3z4bXPgNBDLaa9pV2Oq/2Ewb8eeNcD14Istgl\nfDet3Pk4BvS0b+558KroBcfEV6q6mzx5cEHyMpuSeQXFv6goxxtugHeiTUsE25co\njS9+V0R66snB/HlSJpq6nhg1JsbINiGY6vnls7K15gzhEAQJMuS2zmVW5EeRQJoo\n9DeYrWDVAgMBAAECggEAOe9h+Gz6DI63bxhypGIeENdOseVxhi7Sv8fiWZHghQl/\n4C7+cj7PPUOOMxIDII6XwBZ3+blS+tnS0bSMWj/s7OFe5Rya+qOT3jeyblRkAaIz\n4VQMSps3W4xHKA++6O38wOsmwy/ktY5lugugjOZar+VuAJwOVM01M42eIDV00jYn\na3/4XX5FfdQbq9e7+VK3lYIBANUT2RZbn3D0yg2bkBktQ0wP0suyBQnLysmuC3Xy\n55pGeTpO3stoEsLq6Rr39JT2RPd+BA7QPGDIHHXvfPZqd2aGObqWitQ4n6++4hb1\noCqdoBWG42HZkQ7eyYA6mGv/+HcYSo7g/gNdPeCDQwKBgQDkfJ2sLB/vwOTlJjco\n/YiMEJZwxy0STN+8JBEjCvWhTFwTAf+6moAI0Qy0LCklNkjvT47bZ8g9ejXtKypW\nb9FoN+CGxBU5woRLNYG4Fdx6GYxDjdf+uX203dvf0+s/e+jBriS6hlI/hFLItgVJ\nzsH0oWcXZ/pGYMvNvM3eMaDuCwKBgQDXy8Zlv/tGnrpo3t4mOxDcWkgR1NHSGryg\nu1g8IhpnKdq+USLjhgzozVaNWa/VAk40wXUfQP0ltvD0aNwi41qtuDnzWWunlbAB\nw6VEPXMpc83cX/UcWNKoTZw8mfoGrhvI5PxqOvjtAp8GmkLz1FhGr3mYvV10HRXb\nZzrezgmYnwKBgFA5nRcN6yzAet4mm+mNk7syO9BfbujlCw3BUC8Qswwuhom6AvOf\nOeNem2pLsyq4s8UrFwrclsdXOMYMiPIOkuVX8UMAaD9+l/rcT662JlLM054ImNV8\nhbHS0Ff3zbrdo+0VWxoO/aQFrxeAKb0vlpRxc4QZYxwA8q5LY7FnlYzfAoGBAK2M\n2gOM8eZq05px2xG+ISJGjX2hvhmOnTNbWGwMNVXQqHa1RCzd61Xzhm9puOrDzufI\nyowXNUB2r7Sw/JImbRAXgKvAt77wuLvCgBCwpwSoeOCKX9Orb8ghmsx2PUnQDtJz\nrrk0smvS1th1ifEVTuWSTGXVreorVh+9FvCHndobAoGAUM1xyMekIJL+jwzU2fN9\nmBJI9lIGcV6vzvdFhWQwtaPEtE5cax4Hfiq8jSOmovbKadjnmv07eJ7xBo6INhkF\nD+9xO6KHRTlOY9vXbahIDHe04ovV+StcuJAp63EHYSlFLN29vfobUyuZ+pJ8nBjv\nXOVVZNgG7wm8NhViEBqsvOw=\n-----END PRIVATE KEY-----\n",
  "clientEmail": "firebase-adminsdk-fbsvc@earn-logic.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://earn-logic-default-rtdb.firebaseio.com/"
});

const db = admin.database();

// Telegram Bot Token
const token = '7891784914:AAHw53S8Xp6H571f5W6-qM0i0G6fR0G6fA';
const bot = new TelegramBot(token, {polling: true});

// বাটন মেনু
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🌐 ভিজিট ওয়েবসাইট', url: 'https://earn-logic.github.io' }],
      [{ text: '👤 প্রোফাইল', callback_data: 'profile' }, { text: '💰 ব্যালেন্স', callback_data: 'balance' }],
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

  if (query.data === 'balance') {
    // ডাটাবেস থেকে ইউজারের ব্যালেন্স দেখা
    db.ref('users/' + userId + '/balance').once('value').then((snapshot) => {
      const balance = snapshot.val() || 0;
      bot.sendMessage(chatId, `💰 আপনার বর্তমান ব্যালেন্স: ${balance} পয়েন্ট।\n\n(ওয়েবসাইটে কাজ করলে এখানে পয়েন্ট যোগ হবে)`);
    }).catch(err => {
      bot.sendMessage(chatId, "⚠️ ব্যালেন্স লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    });
  }
  
  if (query.data === 'profile') {
    bot.sendMessage(chatId, `👤 নাম: ${query.from.first_name}\n🆔 আইডি: ${userId}`);
  }
});
