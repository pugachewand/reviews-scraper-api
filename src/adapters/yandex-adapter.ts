import type { Page } from "puppeteer"
import puppeteer from "puppeteer"

async function autoScroll(page: Page, containerSelector: string): Promise<void> {
  await page.evaluate((selector) => {
    return new Promise<void>((resolve) => {
      const scrollElement = document.querySelector(selector)
      if (!scrollElement)
        return resolve()

      let prevHeight = 0
      let attempts = 0

      const interval = setInterval(() => {
        scrollElement.scrollBy(0, scrollElement.scrollHeight)
        const newHeight = scrollElement.scrollHeight

        if (newHeight === prevHeight) {
          attempts++
        }
        else {
          attempts = 0
          prevHeight = newHeight
        }

        if (attempts >= 30) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }, containerSelector)
}

export async function parseYandexReviews(url: string): Promise<
  Array<{
    author: string | null
    published: string | null
    review: string | null
    rating: number
    url: string | null
  }>
> {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox"],
    protocolTimeout: 180_000,
  })

  const page = await browser.newPage()
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 120_000,
  })

  await autoScroll(page, ".scroll__container")

  const reviewHandles = await page.$$(".business-review-view")
  const reviews: Array<{
    author: string | null
    published: string | null
    review: string | null
    rating: number
    url: string | null
  }> = []

  for (const handle of reviewHandles) {
    const author = await handle
      .$eval(".business-review-view__author-name", el => (el as HTMLElement).textContent)
      .catch(() => null)

    const published = await handle
      .$eval("[itemprop=\"datePublished\"]", el => (el as HTMLMetaElement).getAttribute("content"))
      .catch(() => null)

    const review = await handle
      .$eval("[itemprop=\"reviewBody\"]", el => (el as HTMLElement).textContent)
      .catch(() => null)

    const ratingHtml = await handle
      .$eval("div.business-rating-badge-view__stars._spacing_normal", el => el.innerHTML)
      .catch(() => "")

    const rating = (ratingHtml.match(/business-rating-badge-view__star _full/g) || []).length

    const shareBtn = await handle.$(".business-review-view__share-control")
    let reviewUrl: string | null = null

    if (shareBtn) {
      try {
        await shareBtn.click()
        await page.waitForSelector("input.input__control", { timeout: 2000 })
        reviewUrl = await page.$eval("input.input__control", el => (el as HTMLInputElement).value)

        const closeBtn = await page.$("[aria-label=\"Закрыть\"]")
        if (closeBtn)
          await closeBtn.click()
        await new Promise(r => setTimeout(r, 200))
      }
      catch {}
    }

    reviews.push({ author, published, review, rating, url: reviewUrl })
  }

  await browser.close()
  return reviews
}

export async function getYandexHtml(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox"],
    protocolTimeout: 180_000,
  })

  const page = await browser.newPage()
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 120_000,
  })

  await autoScroll(page, ".scroll__container")

  const container = await page.$(".business-reviews-card-view__reviews-container")
  const html = container ? await page.evaluate(el => el.innerHTML, container) : ""

  await browser.close()
  return html
}
