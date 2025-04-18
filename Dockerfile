FROM oven/bun:1.0.15

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

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
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_CACHE_DIR=/usr/local/share/.cache/puppeteer
RUN bunx puppeteer install

COPY . .

EXPOSE 3000

CMD ["bun", "src/index.ts"]
