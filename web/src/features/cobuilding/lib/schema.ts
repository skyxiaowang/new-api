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
import { z } from 'zod'

import {
  CO_BUILDING_MAX_REWARD,
  CO_BUILDING_MIN_REWARD,
} from '../constants'

/** X 动态链接：必填，仅接受 x.com / twitter.com（含 www.）的 http(s) 链接 */
export const isValidXPostUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value.trim())
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    let host = parsed.hostname.toLowerCase()
    if (host.startsWith('www.')) host = host.slice(4)
    return host === 'x.com' || host === 'twitter.com'
  } catch {
    return false
  }
}

const httpUrlField = (fieldName: string) =>
  z
    .string()
    .trim()
    .max(512, { message: 'Link is too long' })
    .refine((v) => v === '' || v.startsWith('http://') || v.startsWith('https://'), {
      message: 'Link must start with http(s)://',
    })
    .transform((v) => v)
    // 字段名仅用于报错定位，由 FormMessage 展示
    .describe(fieldName)

/** X 发帖活动表单 */
export const xPostFormSchema = z.object({
  post_url: z
    .string()
    .trim()
    .min(1, { message: 'Please enter the X post link' })
    .max(255, { message: 'Link is too long' })
    .refine(isValidXPostUrl, {
      message: 'Please enter a valid X post link (x.com or twitter.com)',
    }),
})

export type XPostFormValues = z.infer<typeof xPostFormSchema>

/** 申请赞助表单 */
export const sponsorshipFormSchema = z.object({
  project_name: z
    .string()
    .trim()
    .min(1, { message: 'Please enter the website or project name' })
    .max(128, { message: 'Name is too long' }),
  contact: z
    .string()
    .trim()
    .min(1, { message: 'Please enter your contact information' })
    .max(255, { message: 'Contact is too long' }),
  website: httpUrlField('website'),
  github: httpUrlField('github'),
  support_type: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  scale: z.string().trim().max(128, { message: 'Scale is too long' }),
  description: z
    .string()
    .trim()
    .min(1, { message: 'Please introduce your project' })
    .max(2000, { message: 'Description is too long' }),
  agree_promo: z.boolean(),
})

export type SponsorshipFormValues = z.infer<typeof sponsorshipFormSchema>

/** 管理员审核表单：approve=true 时 amount 必填且在范围内；approve=false 时 note 必填 */
export const reviewFormSchema = z
  .object({
    approve: z.boolean(),
    amount: z.coerce
      .number()
      .default(0)
      .refine((v) => Number.isFinite(v), { message: 'Invalid amount' }),
    note: z.string().trim().max(1024, { message: 'Note is too long' }),
  })
  .superRefine((data, ctx) => {
    if (data.approve) {
      if (
        data.amount < CO_BUILDING_MIN_REWARD ||
        data.amount > CO_BUILDING_MAX_REWARD ||
        Math.round(data.amount * 100) !== data.amount * 100
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['amount'],
          message: 'Reward must be between $1 and $1000, up to 2 decimals',
        })
      }
    } else if (data.note === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['note'],
        message: 'Rejection reason is required',
      })
    }
  })

export type ReviewFormValues = z.infer<typeof reviewFormSchema>
