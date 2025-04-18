
FROM oven/bun:1.0.15 as base

WORKDIR /app

# Установим puppeteer и bun-зависимости
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Установка всех нужных либ для Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends

COPY . .

EXPOSE 3000

CMD ["bun", "src/index.ts"]