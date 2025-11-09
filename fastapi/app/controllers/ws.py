from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from redis.asyncio import Redis
import asyncio
import traceback

from app.utils.jwt import require_role
from app.config.database import get_redis  # функция Depends, возвращающая Redis

ws_router = APIRouter(prefix="/ws/api", tags=["ws"])

@ws_router.websocket("/session/{session_id}")
async def session_ws(websocket: WebSocket, session_id: str, redis: Redis = Depends(get_redis)):
    await websocket.accept()
    session_key = f"session:{session_id}"
    pubsub = None
    channel = None

    try:
        # Проверка jwt в ws реализуется иначе чем в http протоколе:
        token = websocket.headers.get("Authorization")
        if token is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        
        try:
            user = require_role("teacher")(token.split(" ")[1])
        except Exception as e:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        
        # Проверка активного Redis клиента
        if redis is None:
            await websocket.send_json({"error": "Redis не инициализирован"})
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
            return

        # Проверяем активность сессии
        try:
            active = await redis.hget(session_key, "active_status")
            print(f"[DEBUG] active_status for {session_key}: {active}")
        except Exception as e:
            await websocket.send_json({"error": f"Ошибка при чтении Redis: {str(e)}"})
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
            return

        if not active or int(active) == 0:
            await websocket.send_json({"error": "Сессия неактивна"})
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Подписка на канал обновления токена
        pubsub = redis.pubsub()
        channel = f"token_updates:{session_key}"
        await pubsub.subscribe(channel)
        print(f"[DEBUG] Подписан на канал {channel}")

        while True:
            try:
                # Проверка статуса сессии
                active = await redis.hget(session_key, "active_status")
                if not active or int(active) == 0:
                    await websocket.send_json({"error": "Сессия закрыта"})
                    await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
                    break

                # Получаем новые токены
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and "data" in message:
                    try:
                        await websocket.send_json({"token": message["data"]})
                    except Exception as e:
                        print(f"[ERROR] Не удалось отправить данные клиенту: {e}")
                        break

                await asyncio.sleep(0.1)

            except Exception as inner_e:
                print(f"[ERROR] Ошибка в основном цикле WebSocket: {inner_e}")
                traceback.print_exc()
                await asyncio.sleep(1)

    except WebSocketDisconnect:
        print(f"[INFO] Клиент отключился: {session_id}")

    except Exception as e:
        print(f"[ERROR] Общая ошибка WebSocket: {e}")
        traceback.print_exc()
        try:
            await websocket.send_json({"error": f"Внутренняя ошибка сервера: {str(e)}"})
        except Exception:
            pass
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)

    finally:
        if pubsub and channel:
            try:
                await pubsub.unsubscribe(channel)
                print(f"[DEBUG] Отписан от канала {channel}")
            except Exception as e:
                print(f"[ERROR] Ошибка при отписке от канала: {e}")

        try:
            await websocket.close()
        except Exception as e:
            print(f"[ERROR] Ошибка при закрытии WebSocket: {e}")
