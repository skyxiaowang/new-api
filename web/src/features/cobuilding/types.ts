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

/** 共建计划申请类型 */
export const CO_BUILDING_TYPE = {
  X_POST: 1,
  SPONSORSHIP: 2,
} as const

/** 赞助申请希望获得的支持类型 */
export const CO_BUILDING_SUPPORT = {
  BALANCE: 1,
  FULL: 2,
  DISCOUNT: 3,
} as const

/** 审核状态 */
export const CO_BUILDING_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
} as const

export type CoBuildingType = 1 | 2
export type CoBuildingStatus = 0 | 1 | 2

/** 共建计划记录（对应后端 model.CoBuilding） */
export type CoBuildingRecord = {
  id: number
  user_id: number
  username: string
  type: CoBuildingType
  status: CoBuildingStatus
  post_url: string | null
  project_name: string
  contact: string
  website: string
  github: string
  support_type: number
  scale: string
  description: string
  agree_promo: boolean
  reward_quota: number
  review_note: string
  reviewer_id: number
  reviewer_name: string
  reviewed_at: number
  created_at: number
  updated_at: number
}

export type CoBuildingPage = {
  page: number
  page_size: number
  total: number
  items: CoBuildingRecord[] | null
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type CoBuildingListParams = {
  p?: number
  page_size?: number
  keyword?: string
  status?: number
  type?: number
}

export type SubmitCoBuildingPayload = {
  type: CoBuildingType
  post_url?: string
  project_name?: string
  contact?: string
  website?: string
  github?: string
  support_type?: number
  scale?: string
  description?: string
  agree_promo?: boolean
}

export type ReviewCoBuildingPayload = {
  id: number
  approve: boolean
  amount?: number
  note?: string
}
