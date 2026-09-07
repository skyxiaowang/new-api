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
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import type { CoBuildingRecord } from '../types'

const { createInstance } = await import('i18next')
const { I18nextProvider, initReactI18next } = await import('react-i18next')
const { QueryClient, QueryClientProvider } =
  await import('@tanstack/react-query')
const { api } = await import('@/lib/api')
const { ROLE } = await import('@/lib/roles')
const { useAuthStore } = await import('@/stores/auth-store')
const { toast } = await import('sonner')
const { CoBuilding } = await import('..')
const { CO_BUILDING_STATUS, CO_BUILDING_SUPPORT, CO_BUILDING_TYPE } =
  await import('../types')

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: {} } },
})

type ApiMethod = (url: string, config?: unknown) => Promise<{ data: unknown }>
type MockableApi = {
  get: ApiMethod
  post: ApiMethod
}
type ListResponse = {
  success: boolean
  message: string
  data: {
    page: number
    page_size: number
    total: number
    items: CoBuildingRecord[]
  }
}

const apiClient = api as unknown as MockableApi
const originalGet = apiClient.get
const originalPost = apiClient.post

function pendingRecord(): CoBuildingRecord {
  return {
    id: 7,
    user_id: 2,
    username: 'alice',
    type: CO_BUILDING_TYPE.SPONSORSHIP,
    status: CO_BUILDING_STATUS.PENDING,
    post_url: null,
    project_name: 'ModelSet Fansite',
    contact: 'alice@example.com',
    website: 'https://fansite.example.com',
    github: 'https://github.com/alice/fansite',
    support_type: CO_BUILDING_SUPPORT.BALANCE,
    scale: '10,000 visits per month',
    description: 'A fan site',
    agree_promo: true,
    reward_quota: 0,
    review_note: '',
    reviewer_id: 0,
    reviewer_name: '',
    reviewed_at: 0,
    created_at: 1757000000,
    updated_at: 1757000000,
  }
}

function mockListEndpoint(): void {
  apiClient.get = async (_url) => {
    const items = [pendingRecord()]
    return {
      data: {
        success: true,
        message: '',
        data: { page: 1, page_size: 10, total: items.length, items },
      } satisfies ListResponse,
    }
  }
}

function mockReviewEndpoint(): void {
  apiClient.post = async () => ({
    data: { success: true, message: '', data: null },
  })
}

function setCurrentUser(role: number | null): void {
  useAuthStore.setState((state) => ({
    auth: {
      ...state.auth,
      user: role === null ? null : { id: 1, username: 'admin', role },
    },
  }))
}

function renderPage(initialTab: 'x-post' | 'sponsorship' | 'review'): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <CoBuilding initialTab={initialTab} />
      </I18nextProvider>
    </QueryClientProvider>
  )
}

afterEach(() => {
  apiClient.get = originalGet
  apiClient.post = originalPost
  vi.restoreAllMocks()
  setCurrentUser(null)
})

describe('co-building review flow', () => {
  test('opens the review dialog when an admin clicks Review on a pending submission', async () => {
    mockListEndpoint()
    setCurrentUser(ROLE.ADMIN)
    renderPage('review')

    const reviewButton = await screen.findByRole('button', { name: 'Review' })
    fireEvent.click(reviewButton)

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('Review submission')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Sponsorship Application · alice')
    ).toBeInTheDocument()
  })

  test('shows every submitted sponsorship field in the review dialog so admins can judge with full data', async () => {
    mockListEndpoint()
    setCurrentUser(ROLE.ADMIN)
    renderPage('review')

    fireEvent.click(await screen.findByRole('button', { name: 'Review' }))

    const dialog = await screen.findByRole('dialog')
    // 用户提交的每个字段都需在弹窗中可见
    expect(within(dialog).getByText('ModelSet Fansite')).toBeInTheDocument()
    expect(within(dialog).getByText('alice@example.com')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('link', { name: 'https://fansite.example.com' })
    ).toHaveAttribute('href', 'https://fansite.example.com')
    expect(
      within(dialog).getByRole('link', {
        name: 'https://github.com/alice/fansite',
      })
    ).toHaveAttribute('href', 'https://github.com/alice/fansite')
    expect(within(dialog).getByText('Balance support')).toBeInTheDocument()
    expect(
      within(dialog).getByText('10,000 visits per month')
    ).toBeInTheDocument()
    expect(within(dialog).getByText('A fan site')).toBeInTheDocument()
    expect(within(dialog).getByText('Yes')).toBeInTheDocument()
  })

  test('toasts the approval result after confirming an approved submission', async () => {
    mockListEndpoint()
    mockReviewEndpoint()
    setCurrentUser(ROLE.ADMIN)
    renderPage('review')
    const toastSpy = vi.spyOn(toast, 'success')

    fireEvent.click(await screen.findByRole('button', { name: 'Review' }))
    const dialog = await screen.findByRole('dialog')

    // 默认选中通过，填写奖励金额后确认
    fireEvent.input(
      within(dialog).getByLabelText('Reward amount (USD)'),
      { target: { value: '5' } }
    )
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith('Approved and reward granted')
    )
  })

  test('toasts the rejection result after confirming a rejected submission', async () => {
    mockListEndpoint()
    mockReviewEndpoint()
    setCurrentUser(ROLE.ADMIN)
    renderPage('review')
    const toastSpy = vi.spyOn(toast, 'success')

    fireEvent.click(await screen.findByRole('button', { name: 'Review' }))
    const dialog = await screen.findByRole('dialog')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reject' }))
    fireEvent.input(within(dialog).getByLabelText('Rejection reason'), {
      target: { value: 'not enough detail' },
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith('Submission rejected')
    )
  })

  test('closes the review dialog when Cancel is clicked', async () => {
    mockListEndpoint()
    setCurrentUser(ROLE.ADMIN)
    renderPage('review')

    fireEvent.click(await screen.findByRole('button', { name: 'Review' }))
    await screen.findByRole('dialog')

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  test('does not show a Review action on the self submissions list for non-admin users', async () => {
    mockListEndpoint()
    setCurrentUser(ROLE.USER)
    renderPage('x-post')

    await waitFor(() =>
      expect(screen.getByText(/ModelSet Fansite/)).toBeInTheDocument()
    )
    expect(screen.getByText('Pending review')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Review' })).toBeNull()
  })

  test('defaults the admin list to pending status and shows option labels instead of raw values', async () => {
    const requestedUrls: string[] = []
    apiClient.get = async (url) => {
      requestedUrls.push(String(url))
      const items = [pendingRecord()]
      return {
        data: {
          success: true,
          message: '',
          data: { page: 1, page_size: 10, total: items.length, items },
        } satisfies ListResponse,
      }
    }
    setCurrentUser(ROLE.ADMIN)
    renderPage('review')

    // 列表请求默认带 status=0（待审核）
    await waitFor(() =>
      expect(requestedUrls.some((url) => url.includes('status=0'))).toBe(true)
    )

    // 筛选框显示选中项文案而不是原始值（0 / all）
    const statusTrigger = screen.getByRole('combobox', { name: 'Status' })
    expect(statusTrigger.textContent).toContain('Pending review')
    const typeTrigger = screen.getByRole('combobox', { name: 'Type' })
    expect(typeTrigger.textContent).toContain('All types')
  })

  test('re-applies the pending default when switching to Review Management after another tab', async () => {
    const requestedUrls: string[] = []
    apiClient.get = async (url) => {
      requestedUrls.push(String(url))
      const items = [pendingRecord()]
      return {
        data: {
          success: true,
          message: '',
          data: { page: 1, page_size: 10, total: items.length, items },
        } satisfies ListResponse,
      }
    }
    setCurrentUser(ROLE.ADMIN)
    renderPage('x-post')

    // 先停留在我（self 模式）的申请列表，再切换到审核管理
    await screen.findByText(/ModelSet Fansite/)
    fireEvent.click(screen.getByRole('button', { name: /Review Management/ }))

    // 切换后的列表请求默认带 status=0（待审核）
    await waitFor(() =>
      expect(requestedUrls.some((url) => url.includes('status=0'))).toBe(true)
    )
    const statusTrigger = await screen.findByRole('combobox', {
      name: 'Status',
    })
    expect(statusTrigger.textContent).toContain('Pending review')
  })
})
