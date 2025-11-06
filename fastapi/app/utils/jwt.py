from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


SECRET_KEY = "YOUR_SUPER_SECRET_KEY"  
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
auth_scheme = HTTPBearer(scheme_name="Custom MaxId Token Auth")

def create_access_token(max_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Генерирует JWT токен."""
    
    to_encode = {
        "sub": max_id
    }
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Декодирует и проверяет JWT токен, автоматически проверяя exp."""
    try:
        print("🔍 decode_access_token called")
        print("Raw token repr:", repr(token))
        print("SECRET_KEY repr:", repr(SECRET_KEY))
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        print("✅ Payload decoded successfully:", payload)
        return payload

    except JWTError as e:
        # показываем точную ошибку во время разработки
        print("❌ JWTError:", type(e).__name__, str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Недействительный токен: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> str:
    token = credentials.credentials 
    payload = decode_access_token(token)
    
    max_id = payload.get("sub")
    
    if max_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен (отсутствует sub/max_id)",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return max_id