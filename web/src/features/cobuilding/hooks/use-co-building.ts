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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  getAllCoBuildings,
  getMyCoBuildings,
  reviewCoBuilding,
  submitCoBuilding,
} from '../api'
import { SUCCESS_MESSAGES } from '../constants'
import type { SubmitCoBuildingPayload } from '../types'

export type CoBuildingListQuery = {
  scope: 'self' | 'all'
  page: number
  pageSize: number
  keyword?: string
  status?: number
  type?: number
  enabled?: boolean
}

/** 共建计划记录列表（scope=self 本人 / scope=all 管理员全量） */
export function useCoBuildingList(query: CoBuildingListQuery) {
  const scope = query.scope
  const page = query.page
  const pageSize = query.pageSize
  const keyword = query.keyword
  const status = query.status
  const type = query.type

  return useQuery({
    queryKey: [
      'cobuilding',
      'list',
      { scope, page, pageSize, keyword, status, type },
    ],
    enabled: query.enabled !== false,
    queryFn: async () => {
      if (scope === 'all') {
        return getAllCoBuildings({
          p: page,
          page_size: pageSize,
          keyword,
          status,
          type,
        })
      }
      return getMyCoBuildings({ p: page, page_size: pageSize })
    },
  })
}

/** 提交共建计划申请 */
export function useSubmitCoBuilding() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (payload: SubmitCoBuildingPayload) =>
      submitCoBuilding(payload),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t(SUCCESS_MESSAGES.SUBMITTED))
        void queryClient.invalidateQueries({ queryKey: ['cobuilding'] })
      }
    },
  })
}

/** 管理员审核 */
export function useReviewCoBuilding() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: reviewCoBuilding,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(t(SUCCESS_MESSAGES.REVIEWED))
        void queryClient.invalidateQueries({ queryKey: ['cobuilding'] })
      }
    },
  })
}
