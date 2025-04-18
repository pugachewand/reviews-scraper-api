import { logger } from "@bogeychan/elysia-logger"
import { cors } from "@elysiajs/cors"
import { swagger } from "@elysiajs/swagger"
import { Elysia } from "elysia"
import { rateLimit } from "elysia-rate-limit"
import { Routes } from "./routes"

const app = new Elysia()
  .listen(3000)
  .use(rateLimit({
    duration: 60_000,
    max: 20,
    errorResponse: "⛔️ Too many requests. Try again later.",
  }))
  .use(logger({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }))
  .use(cors())
  .use(swagger({
    path: "/promethea/documentations",
    documentation: {
      info: {
        title: "Promethea backend documentation",
        version: "1.0p",
      },
      tags: [
        { name: "Scraping adapters", description: "Endpoints for parsing reviews and returning raw HTML blocks with reviews from external sources." },
      ],
    },
  }))
  .use(Routes)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
