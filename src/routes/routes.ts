import { Elysia, t } from "elysia"
import { parseYandexHandler } from "~/handlers"

export const Routes = new Elysia()
  .get("/scrape/yandex", async ({ query }) => {
    return await parseYandexHandler({ url: query.url })
  }, {
    query: t.Object({
      url: t.String(),
    }),
  })
