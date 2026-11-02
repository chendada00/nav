import { serverSupabaseClient } from '#supabase/server'
import { RESPONSE_STATUS_CODE } from '~/lib/enum'
import type {
  Response,
  PageResponse,
  CategoryList,
  WebsiteList,
  WebsiteHealth,
} from '~/lib/type'

export default defineEventHandler(
  async (event): Promise<Response<PageResponse<CategoryList>>> => {
    const client = await serverSupabaseClient(event)

    const { data, error } = await client
      .from('ds_categorys')
      .select(`
        id,
        name,
        icon,
        sort,
        created_at,
        ds_websites (
          id,
          name,
          url,
          logo,
          color,
          vpn,
          tags,
          desc,
          pinned,
          recommend,
          sort,
          created_at
        )
      `)
      .order('sort', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: '获取首页导航数据失败',
        message: error.message,
      })
    }

    // 检测结果只读一次，再通过 website_id 与网站 UUID 合并。
    const { data: healthRows, error: healthError } = await client
      .from('ds_website_health')
      .select(`
        website_id,
        status,
        checked_at,
        http_status,
        response_time_ms,
        error_code,
        consecutive_failures
      `)

    if (healthError) {
      throw createError({
        statusCode: 500,
        statusMessage: '获取网站检测结果失败',
        message: healthError.message,
      })
    }

    const healthByWebsiteId = new Map<string, WebsiteHealth>(
      (healthRows ?? []).map((row) => [
        row.website_id,
        {
          status: row.status,
          checked_at: row.checked_at,
          http_status: row.http_status,
          response_time_ms: row.response_time_ms,
          error_code: row.error_code,
          consecutive_failures: row.consecutive_failures,
        },
      ]),
    )

    const categories = (data ?? []) as unknown as CategoryList[]

    categories.forEach((category) => {
      const websites = (category.ds_websites ?? []) as WebsiteList[]

      websites.forEach((website) => {
        website.health = healthByWebsiteId.get(website.id) ?? null
      })

      websites.sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1
        if (b.sort !== a.sort) return (b.sort ?? 0) - (a.sort ?? 0)
        if (a.recommend !== b.recommend) return b.recommend ? 1 : -1
        return new Date(b.created_at).getTime()
          - new Date(a.created_at).getTime()
      })
    })

    return {
      code: RESPONSE_STATUS_CODE.SUCCESS,
      msg: '请求成功',
      data: {
        list: categories,
        total: categories.length,
      },
    }
  },
)