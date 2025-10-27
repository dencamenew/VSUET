# Миграция с Spring Boot на FastAPI

## Обзор

Этот проект представляет собой полную переписку Spring Boot backend на FastAPI с использованием Pydantic для сериализации данных.

## Основные изменения

### 1. Архитектура
- **Spring Boot** → **FastAPI**
- **Spring Data JPA** → **SQLAlchemy ORM**
- **Jackson** → **Pydantic**
- **Spring Security** → **Passlib + JWT (планируется)**

### 2. Структура проекта
```
fastapi/
├── app/
│   ├── config/          # Конфигурация (аналог application.properties)
│   ├── controllers/     # REST контроллеры (аналог @RestController)
│   ├── dto/            # DTO и исключения
│   ├── models/         # Pydantic модели + SQLAlchemy модели
│   ├── repositories/   # Репозитории (аналог JpaRepository)
│   └── services/       # Бизнес-логика (аналог @Service)
├── main.py            # Главный файл приложения
├── run.py             # Скрипт запуска
└── requirements.txt   # Зависимости
```

### 3. Модели данных

#### Java Entity → Python SQLAlchemy + Pydantic
```java
// Java (Spring Boot)
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Enumerated(EnumType.STRING)
    private Role role;
}
```

```python
# Python (FastAPI)
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    role = Column(SQLEnum(Role), nullable=False)

# Pydantic модель для API
class UserResponse(BaseModel):
    id: int
    username: str
    role: Role
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 4. Контроллеры

#### Java Spring Boot
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // логика
    }
}
```

#### Python FastAPI
```python
@auth_router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    # логика
```

### 5. Сервисы

#### Java Spring Boot
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    
    public LoginResponse login(LoginRequest request) {
        // логика
    }
}
```

#### Python FastAPI
```python
class AuthService:
    def __init__(self, db: Session):
        self.user_repository = UserRepository(db)
    
    def login(self, request: LoginRequest) -> LoginResponse:
        # логика
```

### 6. Репозитории

#### Java Spring Boot
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
```

#### Python FastAPI
```python
class UserRepository(BaseRepository[User]):
    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()
    
    def exists_by_username(self, username: str) -> bool:
        return self.exists(username=username)
```

## Преимущества FastAPI

1. **Автоматическая документация** - Swagger UI из коробки
2. **Валидация данных** - Pydantic автоматически валидирует входные данные
3. **Type hints** - Полная поддержка типизации Python
4. **Производительность** - Один из самых быстрых Python фреймворков
5. **Простота** - Меньше boilerplate кода по сравнению с Spring Boot

## API Endpoints

Все endpoints сохранены с теми же путями и функциональностью:

- `POST /api/auth/login` - Аутентификация
- `POST /api/admin/faculty` - Создание факультета
- `POST /api/admin/users/*` - Управление пользователями
- `POST /api/admin/timetable/*` - Управление расписаниями
- `POST /api/admin/attendance/*` - Управление посещаемостью
- `POST /api/admin/rating/*` - Управление рейтингом
- `GET /api/search/*` - Поиск
- `GET /api/info/*` - Получение информации
- `GET /api/dean/*` - Управление деканатом

## Запуск

```bash
# Установка зависимостей
pip install -r requirements.txt

# Инициализация БД
python init_db.py

# Запуск приложения
python run.py
```

## Docker

```bash
# Запуск с Docker Compose
docker-compose up -d

# Или сборка образа
docker build -t vsuet-fastapi .
docker run -p 8080:8080 vsuet-fastapi
```

## Заключение

Миграция выполнена успешно с сохранением всей функциональности оригинального Spring Boot приложения. FastAPI версия предоставляет те же API endpoints с улучшенной производительностью и автоматической документацией.
