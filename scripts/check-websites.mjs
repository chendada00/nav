import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

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

async function supabaseGet(path, label = path) {
  const response = await fetch(supabaseUrl(path), {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(
      `Supabase GET failed (${label}): HTTP ${response.status}; ${body.slice(0, 1000)}`,
    )
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
      `Supabase upsert failed: HTTP ${response.status}; ${body.slice(0, 1000)}`,
    )
  }
}

function isPrivateIPv4(address) {
  const parts = address.split('.').map(Number)

  if (
    parts.length !== 4
    || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return true
  }

  const [a, b] = parts

  return (
    a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 198 && (b === 18 || b === 19))
    || a >= 224
  )
}

function isPrivateIPv6(address) {
  const value = address.toLowerCase()

  // IPv4-mapped IPv6 地址，例如 ::ffff:127.0.0.1
  const mapped = value.match(/::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/)
  if (mapped) return isPrivateIPv4(mapped[1])

  return (
    value === '::'
    || value === '::1'
    || value.startsWith('fc')
    || value.startsWith('fd')
    || /^fe[89ab]/.test(value)
    || value.startsWith('ff')
  )
}

function isPrivateAddress(address) {
  const version = isIP(address)

  if (version === 4) return isPrivateIPv4(address)
  if (version === 6) return isPrivateIPv6(address)

  return true
}

async function validateWebsiteUrl(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new Error('invalid_url')
  }

  let parsed

  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error('invalid_url')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('unsupported_protocol')
  }

  if (parsed.username || parsed.password) {
    throw new Error('invalid_url')
  }

  const hostname = parsed.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')

  if (
    hostname === 'localhost'
    || hostname.endsWith('.localhost')
    || hostname.endsWith('.local')
    || hostname.endsWith('.internal')
  ) {
    throw new Error('private_address')
  }

  // 如果 URL 直接使用 IP，立即校验。
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) {
      throw new Error('private_address')
    }

    return parsed
  }

  // 检查 DNS 返回的所有地址，避免域名直接指向常见内网地址。
  let addresses

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    })
  } catch {
    throw new Error('dns_error')
  }

  if (!addresses.length) {
    throw new Error('dns_error')
  }

  if (addresses.some(record => isPrivateAddress(record.address))) {
    throw new Error('private_address')
  }

  return parsed
}

function getFailureCode(error) {
  if (error?.message === 'invalid_url') return 'invalid_url'
  if (error?.message === 'unsupported_protocol') return 'unsupported_protocol'
  if (error?.message === 'private_address') return 'private_address'
  if (error?.message === 'dns_error') return 'dns_error'

  const code = error?.cause?.code ?? error?.code

  if (
    error?.name === 'TimeoutError'
    || error?.name === 'AbortError'
    || code === 'ETIMEDOUT'
  ) {
    return 'timeout'
  }

  if (
    code === 'ENOTFOUND'
    || code === 'EAI_AGAIN'
    || code === 'ENODATA'
  ) {
    return 'dns_error'
  }

  if (
    code === 'CERT_HAS_EXPIRED'
    || code === 'DEPTH_ZERO_SELF_SIGNED_CERT'
    || code === 'ERR_TLS_CERT_ALTNAME_INVALID'
    || code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
  ) {
    return 'tls_error'
  }

  return 'connection_error'
}

async function checkWebsite(website, previousHealth) {
  const checkedAt = new Date().toISOString()
  const startedAt = performance.now()

  const previousFailures = Math.max(
    0,
    Number(previousHealth?.consecutive_failures) || 0,
  )

  let status = previousHealth?.status ?? 'unknown'
  let httpStatus = null
  let responseTimeMs = null
  let errorCode = null
  let consecutiveFailures = previousFailures

  try {
    const url = await validateWebsiteUrl(website.url)

    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Nav-Website-Availability-Checker/1.0',
        Range: 'bytes=0-0',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    httpStatus = response.status

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
        : 'unknown'
      errorCode = `http_${response.status}`
    }
  } catch (error) {
    consecutiveFailures += 1
    status = consecutiveFailures >= DOWN_AFTER_FAILURES
      ? 'down'
      : 'unknown'
    errorCode = getFailureCode(error)
  } finally {
    responseTimeMs = Math.round(performance.now() - startedAt)
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
  const websites = await supabaseGet(
    'ds_websites?select=id,url&url=not.is.null',
    'read ds_websites',
  )

  if (!Array.isArray(websites)) {
    throw new Error('Unexpected website list response from Supabase')
  }

  const previousRows = await supabaseGet(
    'ds_website_health?select=website_id,status,consecutive_failures',
    'read ds_website_health',
  )

  if (!Array.isArray(previousRows)) {
    throw new Error('Unexpected health list response from Supabase')
  }

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