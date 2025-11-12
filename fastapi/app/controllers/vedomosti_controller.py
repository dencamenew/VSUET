# app/controllers/vedomosti_controller.py
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.services.vedomosti_service import VedomostiService
from app.utils.jwt import require_role
from fastapi.responses import Response

logger = logging.getLogger(__name__)

class VedomostiController:
    def __init__(self):
        self.router = APIRouter(prefix="/api/vedomosti", tags=["vedomosti"])
        self._register_routes()

    def _register_routes(self):
        self.router.add_api_route(
            "/attendance/{group_name}/{subject_type}/{subject_name}",
            self.get_attendance_report,
            methods=["GET"],
            response_class=Response
        )

        self.router.add_api_route(
            "/rating/{group_name}/{subject_name}",
            self.get_rating_report,
            methods=["GET"],
            response_class=Response
        )

        self.router.add_api_route(
            "/average/{group_name}",
            self.get_average_rating_report,
            methods=["GET"],
            response_class=Response
        )

    async def get_attendance_report(
        self,
        group_name: str,
        subject_type: str,
        subject_name: str,
        db: Session = Depends(get_db),
        user=Depends(require_role("teacher"))
    ) -> Response:
        """Получить ведомость посещаемости группы по предмету"""
        current_user_id = user["max_id"]
        logger.info(f"Запрос ведомости посещаемости от пользователя {current_user_id} для группы {group_name}")
        
        try:
            vedomosti_service = VedomostiService(db)
            return await vedomosti_service.generate_attendance_report(
                teacher_max_id=current_user_id,
                group_name=group_name, 
                subject_type=subject_type, 
                subject_name=subject_name
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Неожиданная ошибка в контроллере посещаемости: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Внутренняя ошибка сервера: {str(e)}"
            )

    async def get_rating_report(
        self,
        group_name: str,
        subject_name: str,
        db: Session = Depends(get_db),
        user=Depends(require_role("teacher"))
    ) -> Response:
        """Получить ведомость рейтинга группы по предмету"""
        current_user_id = user["max_id"]
        logger.info(f"Запрос ведомости рейтинга от пользователя {current_user_id} для группы {group_name}, предмет {subject_name}")
        
        try:
            vedomosti_service = VedomostiService(db)
            return await vedomosti_service.generate_rating_report(
                group_name=group_name, 
                subject_name=subject_name
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Неожиданная ошибка в контроллере рейтинга: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Внутренняя ошибка сервера: {str(e)}"
            )

    async def get_average_rating_report(
        self,
        group_name: str,
        db: Session = Depends(get_db),
        user=Depends(require_role("teacher"))
    ) -> Response:
        """Получить ведомость среднего балла группы"""
        current_user_id = user["max_id"]
        logger.info(f"Запрос ведомости среднего балла от пользователя {current_user_id} для группы {group_name}")
        
        try:
            vedomosti_service = VedomostiService(db)
            return await vedomosti_service.generate_average_rating_report(group_name)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Неожиданная ошибка в контроллере среднего балла: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Внутренняя ошибка сервера: {str(e)}"
            )


# Экспорт роутера для подключения в main.py
vedomosti_controller = VedomostiController()
vedomosti_router = vedomosti_controller.router