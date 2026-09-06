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
import { describe, expect, test } from 'vitest'

import {
  isValidXPostUrl,
  reviewFormSchema,
  sponsorshipFormSchema,
  xPostFormSchema,
} from '../lib/schema'

describe('isValidXPostUrl', () => {
  test('accepts x.com and twitter.com posts with or without www', () => {
    expect(isValidXPostUrl('https://x.com/foo/status/123')).toBe(true)
    expect(isValidXPostUrl('https://www.twitter.com/foo/status/123')).toBe(true)
    expect(isValidXPostUrl('http://x.com/foo/status/123')).toBe(true)
  })

  test('rejects other hosts and malformed urls', () => {
    expect(isValidXPostUrl('https://example.com/x/status/1')).toBe(false)
    expect(isValidXPostUrl('https://evil.com/x.com/status/1')).toBe(false)
    expect(isValidXPostUrl('not a url')).toBe(false)
    expect(isValidXPostUrl('x.com/foo/status/1')).toBe(false)
    expect(isValidXPostUrl('ftp://x.com/status/1')).toBe(false)
  })
})

describe('xPostFormSchema', () => {
  test('accepts a valid x.com post link', () => {
    const result = xPostFormSchema.safeParse({
      post_url: 'https://x.com/foo/status/123',
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty and off-platform links with field error', () => {
    for (const post_url of ['', 'https://example.com/post/1']) {
      const result = xPostFormSchema.safeParse({ post_url })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path[0]).toBe('post_url')
      }
    }
  })
})

describe('sponsorshipFormSchema', () => {
  const valid = {
    project_name: 'my-site',
    contact: 'a@b.com',
    website: 'https://example.com',
    github: '',
    support_type: 1,
    scale: '',
    description: 'a cool project',
    agree_promo: false,
  }

  test('accepts a complete application', () => {
    const result = sponsorshipFormSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  test('requires project name, contact and description', () => {
    for (const key of ['project_name', 'contact', 'description'] as const) {
      const result = sponsorshipFormSchema.safeParse({
        ...valid,
        [key]: '  ',
      })
      expect(result.success).toBe(false)
    }
  })

  test('rejects website links without http(s) prefix', () => {
    const result = sponsorshipFormSchema.safeParse({
      ...valid,
      website: 'example.com',
    })
    expect(result.success).toBe(false)
  })

  test('rejects unsupported support types', () => {
    for (const support_type of [0, 4]) {
      const result = sponsorshipFormSchema.safeParse({
        ...valid,
        support_type,
      })
      expect(result.success).toBe(false)
    }
  })
})

describe('reviewFormSchema', () => {
  test('approve requires amount within $1–$1000 with up to 2 decimals', () => {
    for (const amount of [1, 50, 1000, 12.34]) {
      const result = reviewFormSchema.safeParse({
        approve: true,
        amount,
        note: '',
      })
      expect(result.success).toBe(true)
    }
  })

  test('approve rejects out-of-range or over-precise amounts', () => {
    for (const amount of [0, 0.99, 1000.01, 1.234, -5]) {
      const result = reviewFormSchema.safeParse({
        approve: true,
        amount,
        note: '',
      })
      expect(result.success).toBe(false)
    }
  })

  test('reject requires a non-empty reason', () => {
    const missing = reviewFormSchema.safeParse({
      approve: false,
      amount: 0,
      note: '   ',
    })
    expect(missing.success).toBe(false)

    const provided = reviewFormSchema.safeParse({
      approve: false,
      amount: 0,
      note: 'content does not match the rules',
    })
    expect(provided.success).toBe(true)
  })
})
