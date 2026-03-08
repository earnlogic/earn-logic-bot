const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Render-এর জন্য সার্ভার (২৪ ঘণ্টা চালু রাখতে)
http.createServer((req, res) => {
  res.write('Earn Logic Bot is Online!');
  res.end();
}).listen(process.env.PORT || 3000);

// তোমার টোকেন এখানে বসাও
const token = '8664803411:AAE3wYaWMwnjuHHSLwXWp2VWBNWoSP3wSSE'; 
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `👋 স্বাগতম Earn Logic অফিশিয়াল বটে!\n\n🌐 ওয়েবসাইট: https://earn-logic.github.io\n\nনিচের বাটনগুলো ব্যবহার করুন:`, {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🌐 ভিজিট ওয়েবসাইট', url: 'https://earn-logic.github.io' }],
                [{ text: '👤 প্রোফাইল', callback_data: 'profile' }, { text: '💰 ব্যালেন্স', callback_data: 'balance' }]
            ]
        }
    });
});

bot.on('callback_query', (query) => {
    if(query.data === 'balance') {
        bot.sendMessage(query.message.chat.id, "ব্যালেন্স চেক করার সিস্টেমটি ফায়ারবেসের সাথে কানেক্ট করা হচ্ছে।");
    }
});
