from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.config.database import get_db
from app.services.rating_service import RatingService
from app.models.pydantic_models.pydantic_models import RatingUpdateRequest
from app.utils.jwt import get_current_user_id, require_role


class RatingController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/rating", tags=["rating"])
        self._register_routes()

    def _register_routes(self):
        self.router.add_api_route(
            "/student/{zach_number}",
            self.get_student_rating,
            methods=["GET"],
            response_model=Dict[str, Any]
        )

        self.router.add_api_route(
            "/vedomost/{group_name}&{subject_name}",
            self.get_group_rating_vedomost,
            methods=["GET"],
            response_model=Dict[str, Any]
        )

        # Изменили POST на PUT для обновления оценок
        self.router.add_api_route(
            "/mark",
            self.update_student_mark,
            methods=["PUT"],
            response_model=Dict[str, Any]
        )

    # -----------------------------
    # JWT-защищённые эндпоинты
    # -----------------------------

    async def get_student_rating(
        self,
        zach_number: str,
        db: Session = Depends(get_db),
        current_user_id: str = Depends(get_current_user_id)
    ) -> Dict[str, Any]:
        """Получить все рейтинги студента (включая практику и курсовую)"""
        try:
            rating_service = RatingService(db)
            ratings = rating_service.get_student_ratings(zach_number)

            if not ratings:
                raise HTTPException(
                    status_code=404,
                    detail=f"Рейтинги для студента с зачёткой {zach_number} не найдены"
                )

            return {
                "requested_by": current_user_id,
                "ratings": ratings
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

    async def get_group_rating_vedomost(
        self,
        group_name: str,
        subject_name: str,
        db: Session = Depends(get_db),
        user=Depends(require_role("teacher"))
    ) -> Dict[str, Any]:
        current_user_id = user["max_id"]
        """Получить ведомость рейтинга группы по предмету"""
        try:
            rating_service = RatingService(db)
            rating_data = rating_service.get_group_rating(group_name, subject_name)

            if not rating_data.get("ratings"):
                raise HTTPException(
                    status_code=404,
                    detail=f"Рейтинг для группы {group_name} по предмету {subject_name} не найден"
                )

            rating_data["requested_by"] = current_user_id
            return rating_data

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

    async def update_student_mark(
        self,
        request: RatingUpdateRequest,
        db: Session = Depends(get_db),
        user=Depends(require_role("teacher"))
    ) -> Dict[str, Any]:
        current_user_id = user["max_id"]
        """Обновить оценку студента (учитывая практику и курсовую работу)"""
        try:
            rating_service = RatingService(db)

            # Простая логика: если subject_name содержит "Практика" или "Курсовая", выставляем оценку напрямую
            if "Практика" in request.subject_name or "Курсовая" in request.subject_name:
                # Например, сразу выставляем Хорошо или Отлично
                mark_value = request.mark
            else:
                mark_value = request.mark  # обычная дисциплина

            success = rating_service.update_student_mark(
                zach_number=request.zach_number,
                subject_name=request.subject_name,
                control_point=request.control_point,
                mark=mark_value
            )

            if not success:
                raise HTTPException(
                    status_code=404,
                    detail="Не удалось обновить оценку. Проверьте номер зачётки и название предмета"
                )

            return {
                "message": "Оценка успешно обновлена",
                "updated_by": current_user_id,
                "zach_number": request.zach_number,
                "subject_name": request.subject_name,
                "control_point": request.control_point,
                "mark": mark_value
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")


# Экспорт роутера для подключения в main.py
rating_controller = RatingController()
rating_router = rating_controller.router
