import asyncio
import logging

from maxapi import Bot, Dispatcher

# Кнопки
from maxapi.types import (
    ChatButton, 
    LinkButton, 
    CallbackButton, 
    RequestGeoLocationButton, 
    MessageButton, 
    ButtonsPayload, 
    RequestContactButton, 
    OpenAppButton, 
)

from maxapi.types import (
    MessageCreated, 
    MessageCallback, 
    MessageChatCreated,
    CommandStart, 
    Command
)

from maxapi.utils.inline_keyboard import InlineKeyboardBuilder

logging.basicConfig(level=logging.INFO)

bot = Bot('f9LHodD0cOKX0laXbpokfElt-s9PkTRQIQYMCVxhYWPJa2pUgyuqLO-gto5v3SpWTXYN7-Eo7-6rZU4iXf7U')
dp = Dispatcher()


@dp.message_created(CommandStart())
async def echo(event: MessageCreated):
    await event.message.answer(
        (
            'Привет! Мои команды:\n\n'
            '/login - Выбор тестового пользователя\n'
        )
    )
    
    
@dp.message_created(Command('login'))
async def login(event: MessageCreated):
    # Создаём клавиатуру с двумя OpenAppButton
    buttons = [
        [
            OpenAppButton(
                text="Открыть как преподаватель",
                web_app="custom_max_id=2",
                contact_id=event.bot.me.user_id  
            ),
            LinkButton(
                text="Открыть как студент",
                url="https://max.ru/t173_hakaton_bot/?custom_max_id=2"
            ),
        ]
    ]

    buttons_payload = ButtonsPayload(buttons=buttons).pack()

    await event.message.answer(
        text="Выбери тестового пользователя:",
        attachments=[buttons_payload]
    )
    

async def main():
    await dp.start_polling(bot)


if __name__ == '__main__':
    asyncio.run(main())
