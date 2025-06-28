import { JellyfinService } from 'src/services/JellyfinService'

export async function fetchDetailsBatch(items, batchSize = 5, delayMs = 300) {
  const detailsMap = {}

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const results = await Promise.allSettled(
      batch.map((item) => JellyfinService.getItemById(item.Id)),
    )

    results.forEach((result, idx) => {
      const id = batch[idx].Id
      if (result.status === 'fulfilled') {
        detailsMap[id] = result.value
      } else {
        console.warn(
          `❌ Failed to fetch details for item ${id}:`,
          result.reason?.response?.status,
          result.reason,
        )
        detailsMap[id] = null
      }
    })

    if (i + batchSize < items.length) {
      await new Promise((res) => setTimeout(res, delayMs))
    }
  }

  return detailsMap
}
