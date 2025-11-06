from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import jwt
from app.models.enums import Role 


SECRET_KEY = "YOUR_SUPER_SECRET_KEY"  # !!! СМЕНИТЕ ЭТОТ КЛЮЧ !!!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Срок действия токена: 1 день

def create_access_token(user_id: int, username: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Генерирует JWT токен."""
    
    # 1. Формирование полезной нагрузки (payload)
    to_encode = {
        "sub": str(user_id), 
        "username": username,
        "role": role
    }
    
    # 2. Установка срока действия
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # 3. Кодирование токена
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt