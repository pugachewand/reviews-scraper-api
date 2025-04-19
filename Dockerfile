FROM mcr.microsoft.com/playwright:v1.42.1-jammy

WORKDIR /app

RUN curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

COPY package.json bun.lock ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "src/index.ts"]