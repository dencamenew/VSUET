import pkg from '@maxhub/max-bot-api';
const { Bot, Keyboard } = pkg;

const bot = new Bot("f9LHodD0cOKX0laXbpokfElt-s9PkTRQIQYMCVxhYWPJa2pUgyuqLO-gto5v3SpWTXYN7-Eo7-6rZU4iXf7U");

// Настройка команд
bot.api.setMyCommands([
  {
    name: 'start',
    description: 'Начать работу с ботом',
  },
]);

// Обработчик команды /start
bot.command('start', async (ctx) => {
  const userId = ctx.message.sender.user_id;
  
  // Создаем inline-клавиатуру с кнопкой-ссылкой
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.link(
        '🚀 Открыть приложение',
        `http://localhost:3000?userId=${userId}`
      )
    ]
  ]);
  
  await ctx.reply(
    `Привет, ${ctx.message.sender.name}! 👋\n\nДобро пожаловать в бот!\nНажми на кнопку ниже, чтобы открыть приложение:`,
    { attachments: [keyboard] }
  );
});

// Обработчик для всех текстовых сообщений
bot.on('message_created', async (ctx) => {
  const text = ctx.message.body?.text;
  
  // Игнорируем команды
  if (!text || text.startsWith('/')) {
    return;
  }
  
  const userId = ctx.message.sender.user_id;
  
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.link(
        '🚀 Открыть приложение',
        `http://localhost:3000?userId=${userId}`
      )
    ]
  ]);
  
  await ctx.reply(
    `Привет! 👋\n\nИспользуй команду /start или нажми кнопку ниже:`,
    { attachments: [keyboard] }
  );
});

bot.start();
console.log('🤖 Бот запущен и готов к работе!');
