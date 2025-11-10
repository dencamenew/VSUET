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

def create_access_token(max_id: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Генерирует JWT токен с ролями.
    role: 'student' или 'teacher'
    """
    to_encode = {
        "sub": max_id,
        "role": role
    }
    
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Декодирует и проверяет JWT токен.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Недействительный токен: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)) -> Dict[str, str]:
    token = credentials.credentials
    payload = decode_access_token(token)
    
    max_id = payload.get("sub")
    role = payload.get("role")
    
    if not max_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен (отсутствует sub или role)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"max_id": max_id, "role": role}


def require_role(required_role: str):
    def role_checker(user: Dict[str, str] = Depends(get_current_user)):
        if user["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ запрещен. Требуется роль: {required_role}"
            )
        return user
    return role_checker



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