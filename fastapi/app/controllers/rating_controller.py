from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.config.database import get_db
from app.services.rating_service import RatingService
from app.models.pydantic_models.pydantic_models import RatingUpdateRequest
from app.utils.jwt import get_current_user_id  # <-- добавили импорт JWT-декодера


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
        
        self.router.add_api_route(
            "/mark",
            self.update_student_mark,
            methods=["POST"],
            response_model=Dict[str, Any]
        )
    
    # -----------------------------
    # JWT ЗАЩИЩЁННЫЕ ЭНДПОИНТЫ 👇
    # -----------------------------

    async def get_student_rating(
        self,
        zach_number: str,
        db: Session = Depends(get_db),
        current_user_id: str = Depends(get_current_user_id)  # <-- токен обязателен
    ) -> Dict[str, Any]:
        """Получить рейтинг студента по номеру зачётки (требуется токен)."""
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
        current_user_id: str = Depends(get_current_user_id)
    ) -> Dict[str, Any]:
        """Получить ведомость рейтинга группы по предмету (JWT обязательный)."""
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
        current_user_id: str = Depends(get_current_user_id)
    ) -> Dict[str, Any]:
        """Обновить оценку студента по контрольной точке (только для авторизованных)."""
        try:
            rating_service = RatingService(db)
            
            if not (0 <= request.mark <= 100):
                raise HTTPException(
                    status_code=400,
                    detail="Оценка должна быть в диапазоне от 0 до 100"
                )
            
            success = rating_service.update_student_mark(
                request.zach_number,
                request.subject_name,
                request.control_point,
                request.mark
            )
            
            if not success:
                raise HTTPException(
                    status_code=404,
                    detail="Не удалось обновить оценку. Проверьте номер зачётки и название предмета"
                )
            
            return {
                "message": "Оценка успешно обновлена",
                "updated_by": current_user_id,  # кто сделал обновление
                "zach_number": request.zach_number,
                "subject_name": request.subject_name,
                "control_point": request.control_point,
                "mark": request.mark
            }
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")


# Экспорт роутера
rating_controller = RatingController()
rating_router = rating_controller.router
