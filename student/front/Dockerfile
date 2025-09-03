# Стадия сборки
FROM node:18-alpine AS builder
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY package-lock.json* ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код (исключаем node_modules через .dockerignore)
COPY . .

# Собираем приложение с отключенным ESLint
RUN NEXT_DISABLE_ESLINT=1 npm run build

# Стадия запуска
FROM node:18-alpine AS runner
WORKDIR /app

# Устанавливаем зависимости только для production
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Копируем собранное приложение - каждая команда COPY отдельно
COPY --from=builder /app/.next ./.next/
COPY --from=builder /app/public ./public/
COPY --from=builder /app/package.json ./


# Создаем non-root пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /app/.next/
RUN chown -R nextjs:nodejs /app/public/

# Переключаемся на non-root пользователя
USER nextjs

# Открываем порт
EXPOSE 3000

# Переменные окружения для Next.js (исправленный формат)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Переменная для backend API (будет переопределена в docker-compose)
ENV NEXT_PUBLIC_API_URL="http://localhost:8000/api"

# Запускаем приложение
CMD ["npm", "start"]