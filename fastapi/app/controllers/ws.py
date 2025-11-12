from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from redis.asyncio import Redis
import asyncio
import traceback
from app.config.database import get_redis  # функция Depends, возвращающая Redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from redis.asyncio import Redis
import asyncio
import traceback
from app.config.database import get_redis

ws_router = APIRouter(prefix="/ws/api", tags=["ws"])


@ws_router.websocket("/session/{session_id}")
async def session_ws(websocket: WebSocket, session_id: str, redis: Redis = Depends(get_redis)):
    await websocket.accept()
    session_key = f"session:{session_id}"
    pubsub = None
    channel = None

    try:
        # Проверка активного клиента Redis
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

        # 🔥 Отправляем текущий токен сразу при подключении
        current_token = await redis.hget(session_key, "current_token")
        if current_token:
            try:
                await websocket.send_json({"token": current_token})
                print(f"[DEBUG] Отправлен текущий токен клиенту: {current_token}")
            except Exception as e:
                print(f"[WARN] Не удалось отправить токен при подключении: {e}")
                await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
                return

        # Основной цикл прослушивания новых токенов
        while True:
            try:
                # Проверяем статус активности
                active = await redis.hget(session_key, "active_status")
                if not active or int(active) == 0:
                    try:
                        await websocket.send_json({"error": "Сессия закрыта"})
                    except Exception:
                        pass
                    await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
                    break

                # Проверяем новые сообщения
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and "data" in message:
                    try:
                        await websocket.send_json({"token": message["data"]})
                        print(f"[DEBUG] Отправлен новый токен: {message['data']}")
                    except Exception as e:
                        print(f"[WARN] WebSocket закрыт при отправке токена: {e}")
                        break

                await asyncio.sleep(0.1)

            except WebSocketDisconnect:
                print(f"[INFO] Клиент отключился: {session_id}")
                break

            except asyncio.CancelledError:
                print(f"[INFO] Цикл WebSocket отменён для {session_id}")
                break

            except Exception as e:
                print(f"[ERROR] Ошибка в основном цикле WebSocket: {e}")
                traceback.print_exc()
                break

    except WebSocketDisconnect:
        print(f"[INFO] Клиент отключился (вне цикла): {session_id}")

    except Exception as e:
        print(f"[ERROR] Общая ошибка WebSocket: {e}")
        traceback.print_exc()
        try:
            await websocket.send_json({"error": f"Внутренняя ошибка сервера: {str(e)}"})
        except Exception:
            pass
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except Exception:
            pass

    finally:
        # Безопасная отписка от Redis-канала
        if pubsub and channel:
            try:
                await pubsub.unsubscribe(channel)
                print(f"[DEBUG] Отписан от канала {channel}")
                await pubsub.close()
            except Exception as e:
                print(f"[ERROR] Ошибка при отписке от канала {channel}: {e}")

        # Безопасное закрытие WebSocket
        try:
            await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
        except Exception as e:
            print(f"[ERROR] Ошибка при закрытии WebSocket: {e}")
