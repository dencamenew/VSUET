import pkg from '@maxhub/max-bot-api';
const { Bot, Keyboard } = pkg;

const bot = new Bot("f9LHodD0cOKX0laXbpokfElt-s9PkTRQIQYMCVxhYWPJa2pUgyuqLO-gto5v3SpWTXYN7-Eo7-6rZU4iXf7U");

const MINI_APP_URL = "https://vsuet-xcmz.vercel.app";

bot.api.setMyCommands([
  {
    name: 'start',
    description: 'Начать работу с ботом',
  },
]);

bot.command('start', async (ctx) => {
  const userId = ctx.message.sender.user_id;
  
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.link(
        '👨‍🏫 Войти как преподаватель',
        `${MINI_APP_URL}?custom_max_id=${userId}&role=teacher`
      )
    ],
    [
      Keyboard.button.link(
        '🎓 Войти как студент',
        `${MINI_APP_URL}?custom_max_id=${userId}&role=student`
      )
    ]
  ]);
  
  await ctx.reply(
    `Привет, ${ctx.message.sender.name}! 👋\n\nВыберите роль для входа в приложение:`,
    { attachments: [keyboard] }
  );
});

bot.on('message_created', async (ctx) => {
  const text = ctx.message.body?.text;
  
  if (!text || text.startsWith('/')) {
    return;
  }
  
  const userId = ctx.message.sender.user_id;
  
  const keyboard = Keyboard.inlineKeyboard([
    [
      Keyboard.button.link(
        '👨‍🏫 Войти как преподаватель',
        `${MINI_APP_URL}?custom_max_id=${userId}&role=teacher`
      )
    ],
    [
      Keyboard.button.link(
        '🎓 Войти как студент',
        `${MINI_APP_URL}?custom_max_id=${userId}&role=student`
      )
    ]
  ]);
  
  await ctx.reply(
    `Привет! 👋\n\nИспользуй команду /start или выбери роль:`,
    { attachments: [keyboard] }
  );
});

bot.start();
console.log('Бот запущен и готов к работе!');
