from motor.motor_asyncio import AsyncIOMotorClient
# ИСПРАВЛЕНИЕ: Класс для асинхронного GridFS находится в пакете motor
from motor.motor_asyncio import AsyncIOMotorGridFSBucket 
from typing import List, Dict, Any
from fastapi.responses import StreamingResponse
from app.config.settings import settings


class LibraryService:
    """Сервис для работы с библиотекой, хранящейся в MongoDB GridFS."""

    def __init__(self):
        # Подключение к MongoDB с использованием настроек
        mongo_url = f"mongodb://{settings.mongodb_host}:{settings.mongodb_port}"
        self.client = AsyncIOMotorClient(mongo_url)
        # Получаем базу данных 'library', как указано в init_gridfs.js
        self.db = self.client.library 
        # Инициализируем GridFS Bucket 'fs'
        # Используем AsyncIOMotorGridFSBucket для современного GridFS API
        self.fs = AsyncIOMotorGridFSBucket(self.db, bucket_name='fs') 

    async def get_all_books_metadata(self) -> List[Dict[str, Any]]:
        """Возвращает список всех файлов (книг) и их метаданных из GridFS."""
        metadata_list = []
        # Итерируемся по коллекции fs.files для получения метаданных
        async for file_doc in self.db.fs.files.find({}):
            metadata_list.append({
                "file_id": str(file_doc["_id"]),
                "filename": file_doc["filename"],
                "uploadDate": file_doc["uploadDate"],
                "length": file_doc["length"], # Размер файла в байтах
                "title": file_doc.get("metadata", {}).get("title"),
                "author": file_doc.get("metadata", {}).get("author"),
                "topic": file_doc.get("metadata", {}).get("topic"),
            })
        return metadata_list

    async def download_file_by_filename(self, filename: str) -> StreamingResponse | None:
        """Скачивает файл из GridFS по имени."""
        try:
            grid_out = await self.fs.open_download_stream_by_name(filename)

            async def file_iterator():
                """Асинхронный итератор по чанкам."""
                while True:
                    chunk = await grid_out.readchunk()
                    if not chunk:
                        break
                    yield chunk

            return StreamingResponse(
                content=file_iterator(),
                media_type="application/octet-stream",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Length": str(grid_out.length),
                },
            )

        except Exception as e:
            if "file not found" in str(e).lower():
                return None
            raise


# Инициализация клиента как синглтона
library_service = LibraryService()