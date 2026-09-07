/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { api } from '@/lib/api'

import type {
  ApiResponse,
  CoBuildingListParams,
  CoBuildingPage,
  CoBuildingRecord,
  ReviewCoBuildingPayload,
  SubmitCoBuildingPayload,
} from './types'

/** 获取当前用户的共建计划记录（分页） */
export async function getMyCoBuildings(
  params: CoBuildingListParams = {}
): Promise<ApiResponse<CoBuildingPage>> {
  const queryParams = new URLSearchParams()
  if (params.p != null) queryParams.set('p', String(params.p))
  if (params.page_size != null) {
    queryParams.set('page_size', String(params.page_size))
  }
  const res = await api.get(`/api/user/cobuilding/self?${queryParams.toString()}`)
  return res.data
}

/** 管理员获取全平台共建计划记录（分页 + 筛选） */
export async function getAllCoBuildings(
  params: CoBuildingListParams = {}
): Promise<ApiResponse<CoBuildingPage>> {
  const queryParams = new URLSearchParams()
  if (params.p != null) queryParams.set('p', String(params.p))
  if (params.page_size != null) {
    queryParams.set('page_size', String(params.page_size))
  }
  if (params.keyword) queryParams.set('keyword', params.keyword)
  if (params.status != null && params.status >= 0) {
    queryParams.set('status', String(params.status))
  }
  if (params.type != null && params.type > 0) {
    queryParams.set('type', String(params.type))
  }
  const res = await api.get(`/api/user/cobuilding?${queryParams.toString()}`)
  return res.data
}

/** 提交共建计划申请（Turnstile 启用时经 query 携带 token，后端 TurnstileCheck 读取） */
export async function submitCoBuilding(
  payload: SubmitCoBuildingPayload,
  turnstileToken?: string
): Promise<ApiResponse<CoBuildingRecord>> {
  const url = turnstileToken
    ? `/api/user/cobuilding?turnstile=${encodeURIComponent(turnstileToken)}`
    : '/api/user/cobuilding'
  const res = await api.post(url, payload)
  return res.data
}

/** 管理员审核共建计划记录 */
export async function reviewCoBuilding(
  payload: ReviewCoBuildingPayload
): Promise<ApiResponse<null>> {
  const res = await api.post('/api/user/cobuilding/review', payload)
  return res.data
}
