import { Bot } from '@maxhub/max-bot-api';
const bot = new Bot("f9LHodD0cOKX0laXbpokfElt-s9PkTRQIQYMCVxhYWPJa2pUgyuqLO-gto5v3SpWTXYN7-Eo7-6rZU4iXf7U");

bot.api.setMyCommands([
  {
    name: 'hello',
    description: 'Поприветствовать бота',
  },
]);

bot.command('hello', (ctx) => {
  const user = ctx.user; // Получаем данные пользователя из нового события

  if (!user) {
    // Если пользователя не получилось определить, просто поздороваемся 
    return ctx.reply('Привет! ✨');
  }

  // Если пользователя определён, поздороваемся адресно
  return ctx.reply(`Привет, ${ctx.message.sender.user_id}! ✨`);
});
bot.start();
