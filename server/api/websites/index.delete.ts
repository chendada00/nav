import type { Response, WebsiteEdit, WebsiteList } from '~/lib/type'
import { serverSupabaseClient } from '#supabase/server'
import { RESPONSE_STATUS_CODE } from '~/lib/enum'

export default defineEventHandler(async (event): Promise<Response<WebsiteList[]>> => {
  const client = await serverSupabaseClient<WebsiteList>(event)
  // 得到请求体
  const { id }: WebsiteEdit = await readBody(event)

  if (!id) {
    return {
      code: RESPONSE_STATUS_CODE.FAIL,
      msg: 'id不能为空!'
    }
  }

  // 删除数据
  const { error } = await client.from('ds_websites').delete().eq('id', id)

  // 判断请求结果
  if (error) {
    throw createError({
      statusCode: RESPONSE_STATUS_CODE.FAIL,
      statusMessage: error.message
    })
  }

  // 请求成功
  return {
    code: RESPONSE_STATUS_CODE.SUCCESS,
    msg: '请求成功'
  }
})
