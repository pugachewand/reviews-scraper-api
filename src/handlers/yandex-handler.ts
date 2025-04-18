import { getYandexHtml } from "~/adapters"

export async function parseYandexHandler(body: { url: string }) {
  if (!body?.url) {
    throw new Error("Missing URL")
  }

  try {
    const html = await getYandexHtml(body.url)
    return { html }
  }
  catch (error: any) {
    console.error("Parsing error:", error?.message || error)
    throw new Error(`Failed to parse reviews: ${error?.message || "Unknown error"}`)
  }
}
