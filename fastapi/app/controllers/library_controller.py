from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from app.services.library_service import library_service 
from app.utils.jwt import require_role # Предполагаем, что этот модуль существует

library_router = APIRouter(prefix="/api/library", tags=["library"])


@library_router.get(
    "/books",
    summary="Получить список всех книг (метаданных) из GridFS",
)
async def get_all_books(user=Depends(require_role("student"))):
    """
    Возвращает список всех документов, загруженных в GridFS,
    включая их метаданные (название, автор, тема).
    """
    try:
        books = await library_service.get_all_books_metadata()
        return books
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при получении списка книг: {e}"
        )


@library_router.get(
    "/download/{filename}",
    summary="Скачать файл (книгу) по его имени",
    response_class=StreamingResponse
)
async def download_book(
    filename: str,
    user=Depends(require_role("student"))
):
    """
    Возвращает файл, хранящийся в GridFS, для скачивания.
    Использует потоковую передачу данных.
    """
    file_response = await library_service.download_file_by_filename(filename)

    if file_response is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Файл '{filename}' не найден в библиотеке."
        )

    return file_response