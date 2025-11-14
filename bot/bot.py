import asyncio
import logging
import aiohttp

from maxapi import Bot, Dispatcher, F
from maxapi.types import MessageCreated, Command
from maxapi.types import BotCommand

logging.basicConfig(level=logging.INFO)

bot = Bot('f9LHodD0cOKX0laXbpokfElt-s9PkTRQIQYMCVxhYWPJa2pUgyuqLO-gto5v3SpWTXYN7-Eo7-6rZU4iXf7U')
dp = Dispatcher()

# Состояния для аутентификации
user_states = {}
user_data = {}

# API endpoints
CHECK_URL = "https://fast-api-maxminiapp.loca.lt/api/auth/check"
AUTH_URL = "https://fast-api-maxminiapp.loca.lt/api/auth/login_user"
REGISTER_URL = "https://fast-api-maxminiapp.loca.lt/api/auth/register"


# ---------------------- /start ----------------------

@dp.message_created(Command("start"))
async def start(event: MessageCreated):
    await event.message.answer(
        "👋 Добро пожаловать на цифровую образовательную платформу!\n\n"
        "🔐 Чтобы войти в аккаунт — используйте команду /auth\n"
        "🚪 Чтобы выйти — /logout\n\n"
    )


# ---------------------- /auth ----------------------

@dp.message_created(Command("auth"))
async def start_auth(event: MessageCreated):
    user_id = event.from_user.user_id

    try:
        async with aiohttp.ClientSession() as session:
            # Проверяем есть ли max_id в базе
            async with session.post(
                CHECK_URL,
                headers={"accept": "application/json", "Content-Type": "application/json"},
                json={"max_id": str(user_id)}
            ) as response:

                if response.status == 200:
                    data = await response.json()
                    user = data["user"]
                    if user:
                        await event.message.answer(
                            f"⚠️ Вы уже авторизованы.\n\n"
                            f"👤 {user.get('last_name')} {user.get('first_name')}\n"
                            f"Роль: {user.get('role')}\n\n"
                            "Чтобы выйти — используйте команду /logout"
                        )
                        return

    except Exception as e:
        logging.error(f"Ошибка /check: {e}")
        await event.message.answer("⚠️ Ошибка сервера при проверке пользователя.")
        return

    # Пользователь не найден → начинаем аутентификацию
    user_states[user_id] = "waiting_for_lastname"
    user_data[user_id] = {}
    await event.message.answer("Введите вашу фамилию:")


# ---------------------- /logout ----------------------

@dp.message_created(Command("logout"))
async def logout(event: MessageCreated):
    user_id = event.from_user.user_id

    try:
        async with aiohttp.ClientSession() as session:
            # Получаем пользователя из базы по max_id
            async with session.post(
                CHECK_URL,
                headers={"accept": "application/json", "Content-Type": "application/json"},
                json={"max_id": str(user_id)}
            ) as response:

                if response.status != 200:
                    await event.message.answer("⚠️ Вы не авторизованы или нет данных для выхода.")
                    return

                data = await response.json()
                user = data["user"]
                if not user:
                    await event.message.answer("⚠️ Пользователь не найден в базе.")
                    return

                logout_payload = {
                    "first_name": user["first_name"],
                    "last_name": user["last_name"],
                    "password": user["password"],
                    "max_id": "-"
                }

                async with session.put(
                    REGISTER_URL,
                    headers={"accept": "application/json", "Content-Type": "application/json"},
                    json=logout_payload
                ) as put_response:

                    if put_response.status == 200:
                        await event.message.answer("🚪 Вы успешно вышли из аккаунта.")
                    else:
                        await event.message.answer(f"⚠️ Не удалось выполнить выход. Код: {put_response.status}")

    except Exception as e:
        logging.error(f"Ошибка logout: {e}")
        await event.message.answer(f"⚠️ Ошибка сервера при выходе. {e}")


# ------------------ Шаги аутентификации ------------------

@dp.message_created(F.message.body.text)
async def handle_auth(event: MessageCreated):
    user_id = event.from_user.user_id
    text = event.message.body.text.strip()

    if user_id not in user_states:
        return

    state = user_states[user_id]

    if state == "waiting_for_lastname":
        user_data[user_id]["last_name"] = text
        user_states[user_id] = "waiting_for_firstname"
        await event.message.answer("Введите имя:")
        return

    if state == "waiting_for_firstname":
        user_data[user_id]["first_name"] = text
        user_states[user_id] = "waiting_for_password"
        await event.message.answer("Введите пароль:")
        return

    if state == "waiting_for_password":
        user_data[user_id]["password"] = text
        auth_payload = {
            "first_name": user_data[user_id]["first_name"],
            "last_name": user_data[user_id]["last_name"],
            "password": user_data[user_id]["password"]
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    AUTH_URL,
                    headers={"accept": "application/json", "Content-Type": "application/json"},
                    json=auth_payload
                ) as response:

                    if response.status != 200:
                        await event.message.answer("❌ Неверные данные. Попробуйте /auth снова.")
                        user_states.pop(user_id, None)
                        user_data.pop(user_id, None)
                        return

                    data = await response.json()
                    role = data.get("role")

                    await event.message.answer(
                        f"✅ Вы успешно вошли в аккаунт!\n"
                        f"🚀 Перейдите в приложение"
                    )

                    # Сохраняем max_id в базе
                    register_payload = {
                        "first_name": auth_payload["first_name"],
                        "last_name": auth_payload["last_name"],
                        "password": auth_payload["password"],
                        "max_id": str(user_id)
                    }

                    async with session.put(
                        REGISTER_URL,
                        headers={"accept": "application/json", "Content-Type": "application/json"},
                        json=register_payload
                    ) as reg_response:

                        if reg_response.status == 200:
                            await event.message.answer("🎉 MAX_ID успешно сохранён!")
                        else:
                            await event.message.answer("⚠️ Ошибка при сохранении MAX_ID.")

        except Exception as e:
            logging.error(f"Ошибка аутентификации: {e}")
            await event.message.answer("⚠️ Ошибка сервера. Попробуйте позже.")

        user_states.pop(user_id, None)
        return


# ------------------ MAIN ------------------


async def main():
    await bot.set_my_commands(
        BotCommand(name="start", description="Информация о боте"),
        BotCommand(name="auth", description="Войти в аккаунт"),
        BotCommand(name="logout", description="Выйти из аккаунта"),
    )

    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
