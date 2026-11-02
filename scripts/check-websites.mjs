const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '')
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable',
  )
}

const REQUEST_TIMEOUT_MS = 8_000
const CONCURRENCY = 8
const DOWN_AFTER_FAILURES = 2

const headers = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

function supabaseUrl(path) {
  return `${SUPABASE_URL}/rest/v1/${path}`
}

async function supabaseGet(path) {
  const response = await fetch(supabaseUrl(path), {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Supabase GET failed: HTTP ${response.status}`)
  }

  return response.json()
}

async function supabaseUpsert(rows) {
  if (rows.length === 0) return

  const response = await fetch(
    supabaseUrl('ds_website_health?on_conflict=website_id'),
    {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  )

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `Supabase upsert failed: HTTP ${response.status} ${body.slice(0, 500)}`,
    )
  }
}

function validateWebsiteUrl(rawUrl) {
  let parsed

  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('invalid_url')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('unsupported_protocol')
  }

  const hostname = parsed.hostname.toLowerCase()

  // 拒绝本机、内网常见地址和本地域名，避免误测内部服务。
  if (
    hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname.endsWith('.local')
    || hostname === '::1'
    || hostname === '[::1]'
    || /^127\./.test(hostname)
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^169\.254\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    throw new Error('private_or_local_address')
  }

  return parsed
}

async function checkWebsite(website, previousHealth) {
  const checkedAt = new Date().toISOString()
  const previousFailures = previousHealth?.consecutive_failures ?? 0

  let status = previousHealth?.status ?? 'unknown'
  let httpStatus = null
  let responseTimeMs = null
  let errorCode = null
  let consecutiveFailures = previousFailures

  try {
    const url = validateWebsiteUrl(website.url)
    const startedAt = performance.now()

    // 不自动跟随跳转，避免跳转到未验证的内部地址。
    // 3xx 仍视为网站有响应；4xx 也代表服务器可达。
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Nav-Website-Availability-Checker/1.0',
        Range: 'bytes=0-0',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    responseTimeMs = Math.round(performance.now() - startedAt)
    httpStatus = response.status

    // 不需要读取网页正文；尽早释放响应体。
    if (response.body) {
      await response.body.cancel().catch(() => {})
    }

    if (response.status >= 200 && response.status < 500) {
      status = 'up'
      consecutiveFailures = 0
      errorCode = null
    } else {
      consecutiveFailures += 1
      status = consecutiveFailures >= DOWN_AFTER_FAILURES
        ? 'down'
        : (previousHealth?.status === 'up' ? 'up' : 'unknown')
      errorCode = `http_${response.status}`
    }
  } catch (error) {
    consecutiveFailures += 1
    status = consecutiveFailures >= DOWN_AFTER_FAILURES
      ? 'down'
      : (previousHealth?.status === 'up' ? 'up' : 'unknown')

    errorCode = error?.name === 'TimeoutError'
      || error?.name === 'AbortError'
      ? 'timeout'
      : String(error?.message ?? 'request_failed').slice(0, 120)
  }

  return {
    website_id: website.id,
    status,
    checked_at: checkedAt,
    http_status: httpStatus,
    response_time_ms: responseTimeMs,
    error_code: errorCode,
    consecutive_failures: consecutiveFailures,
    updated_at: checkedAt,
  }
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function runWorker() {
    while (true) {
      const index = nextIndex++
      if (index >= items.length) return

      results[index] = await worker(items[index])
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, items.length) },
      () => runWorker(),
    ),
  )

  return results
}

async function main() {
  // 读取现有网站列表；只检测有 URL 的网站。
  const websites = await supabaseGet(
    'ds_websites?select=id,url&url=not.is.null',
  )

  if (!Array.isArray(websites)) {
    throw new Error('Unexpected website list response from Supabase')
  }

  // 读取上一轮状态，用于连续失败计数。
  const previousRows = await supabaseGet(
    'ds_website_health?select=website_id,status,consecutive_failures',
  )

  const previousById = new Map(
    previousRows.map(row => [row.website_id, row]),
  )

  console.log(`Checking ${websites.length} websites...`)

  const results = await runWithConcurrency(
    websites,
    website => checkWebsite(
      website,
      previousById.get(website.id),
    ),
    CONCURRENCY,
  )

  // 一次批量写入，避免每个网站单独请求 Supabase。
  await supabaseUpsert(results)

  const counts = results.reduce((summary, row) => {
    summary[row.status] = (summary[row.status] ?? 0) + 1
    return summary
  }, {})

  console.log('Check completed:', counts)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})