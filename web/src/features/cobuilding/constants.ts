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
import {
  CO_BUILDING_STATUS,
  CO_BUILDING_SUPPORT,
  CO_BUILDING_TYPE,
  type CoBuildingStatus,
} from './types'

/** 奖励金额范围（美元） */
export const CO_BUILDING_MIN_REWARD = 1
export const CO_BUILDING_MAX_REWARD = 1000

/** 官网链接（活动规则中要求贴文包含） */
export const CO_BUILDING_SITE_URL = 'https://ai.modelset.top'

export type StatusConfig = {
  value: CoBuildingStatus
  labelKey: string
  /** StatusBadge 颜色 */
  variant: 'warning' | 'success' | 'danger'
}

/** 审核状态展示配置（labelKey 即 i18n 键） */
export const CO_BUILDING_STATUS_CONFIG: Record<
  number,
  StatusConfig
> = {
  [CO_BUILDING_STATUS.PENDING]: {
    value: CO_BUILDING_STATUS.PENDING,
    labelKey: 'Pending review',
    variant: 'warning',
  },
  [CO_BUILDING_STATUS.APPROVED]: {
    value: CO_BUILDING_STATUS.APPROVED,
    labelKey: 'Approved',
    variant: 'success',
  },
  [CO_BUILDING_STATUS.REJECTED]: {
    value: CO_BUILDING_STATUS.REJECTED,
    labelKey: 'Rejected',
    variant: 'danger',
  },
}

export const CO_BUILDING_STATUS_OPTIONS: StatusConfig[] =
  Object.values(CO_BUILDING_STATUS_CONFIG)

/** 支持类型展示配置 */
export const CO_BUILDING_SUPPORT_CONFIG: Record<
  number,
  { labelKey: string; descKey: string }
> = {
  [CO_BUILDING_SUPPORT.BALANCE]: {
    labelKey: 'Balance support',
    descKey: '$1–$1000 account balance',
  },
  [CO_BUILDING_SUPPORT.FULL]: {
    labelKey: 'Full sponsorship',
    descKey: 'Fully cover the tokens your project needs',
  },
  [CO_BUILDING_SUPPORT.DISCOUNT]: {
    labelKey: 'Exclusive discount',
    descKey: 'Long-term or staged discount',
  },
}

/** 申请类型展示配置 */
export const CO_BUILDING_TYPE_CONFIG: Record<number, { labelKey: string }> = {
  [CO_BUILDING_TYPE.X_POST]: { labelKey: 'X Post Activity' },
  [CO_BUILDING_TYPE.SPONSORSHIP]: { labelKey: 'Sponsorship Application' },
}

export const CO_BUILDING_TYPE_OPTIONS = [
  { value: CO_BUILDING_TYPE.X_POST, labelKey: 'X Post Activity' },
  { value: CO_BUILDING_TYPE.SPONSORSHIP, labelKey: 'Sponsorship Application' },
]

/** 成功/错误消息（仅存 i18n 键，展示时必须经过 t()） */
export const SUCCESS_MESSAGES = {
  SUBMITTED: 'Submitted successfully, please wait for review',
  REVIEWED: 'Review submitted',
} as const

export const ERROR_MESSAGES = {
  UNEXPECTED: 'Something went wrong!',
} as const
