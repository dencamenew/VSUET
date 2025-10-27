from .auth_controller import auth_router
from .attendance_controller import attendance_router
from .rating_controller import rating_router
from .search_controller import search_router
from .info_controller import info_router

__all__ = [
    "auth_router",
    "admin_router",
    "attendance_router",
    "rating_router",
    "search_router",
    "info_router",
    "dean_info_router",
]



