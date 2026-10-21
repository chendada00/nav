import { serverSupabaseClient } from '#supabase/server'
import { RESPONSE_STATUS_CODE } from '~/lib/enum'
import type { Response, PageResponse, CategoryList, WebsiteList } from '~/lib/type'

/**
 * Lightweight payload for the public home page.
 * The admin endpoints keep their complete fields and exact-count pagination.
 */
export default defineEventHandler(async (event): Promise<Response<PageResponse<CategoryList>>> => {
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
      message: error.message
    })
  }

  const categories = (data ?? []) as unknown as CategoryList[]
  categories.forEach((category) => {
    const websites = (category.ds_websites ?? []) as WebsiteList[]
    websites.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1
      if (b.sort !== a.sort) return (b.sort ?? 0) - (a.sort ?? 0)
      if (a.recommend !== b.recommend) return b.recommend ? 1 : -1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  })

  return {
    code: RESPONSE_STATUS_CODE.SUCCESS,
    msg: '请求成功',
    data: {
      list: categories,
      total: categories.length
    }
  }
})
