from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from app.config.database import redis_client
import asyncio
import json

ws_router = APIRouter(prefix="/ws", tags=["ws"])

@ws_router.websocket("/session/{session_id}")
async def session_ws(websocket: WebSocket, session_id: str):
    await websocket.accept()

    if redis_client is None:
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        return

    session_key = f"session:{session_id}"

    # Проверяем, активна ли сессия при подключении
    active = await redis_client.hget(session_key, "active_status")
    if not active or int(active) == 0:
        await websocket.send_json({"error": "Сессия неактивна"})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Подписка на канал обновления токена
    pubsub = redis_client.pubsub()
    channel = f"token_updates:{session_key}"
    await pubsub.subscribe(channel)

    try:
        while True:
            # Проверяем статус сессии каждые 1 сек
            active = await redis_client.hget(session_key, "active_status")
            if not active or int(active) == 0:
                await websocket.send_json({"error": "Сессия закрыта"})
                await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)
                break

            # Получаем новые токены
            message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and "data" in message:
                # Отправка токена на фронт
                try:
                    await websocket.send_json({"token": message["data"]})
                except:
                    break  # если клиент отключился

            await asyncio.sleep(0.1)

    except WebSocketDisconnect:
        pass
    finally:
        await pubsub.unsubscribe(channel)
        await websocket.close()
