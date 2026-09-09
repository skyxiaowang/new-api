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
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

// 控制当前登录角色：普通用户 role=1，管理员 role=10（ROLE.ADMIN）
const authState = vi.hoisted(() => ({ role: 1 }))
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ auth: { user: { role: authState.role } } }),
}))

const { createInstance } = await import('i18next')
const { I18nextProvider, initReactI18next } = await import('react-i18next')
const { api } = await import('@/lib/api')
const { BillingHistoryDialog } = await import(
  '../components/dialogs/billing-history-dialog'
)

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: {} } },
})

type ApiMethod = (url: string) => Promise<{ data: unknown }>
type MockableApi = { get: ApiMethod }
const apiClient = api as unknown as MockableApi
const originalGet = apiClient.get
const requestedUrls: string[] = []

function renderDialog(): void {
  render(
    <I18nextProvider i18n={i18n}>
      <BillingHistoryDialog open onOpenChange={() => {}} />
    </I18nextProvider>
  )
}

afterEach(() => {
  apiClient.get = originalGet
  requestedUrls.length = 0
})

describe('billing history 30-day scope notice', () => {
  test('shows the 30-day scope notice to regular users and queries the self endpoint', async () => {
    authState.role = 1
    apiClient.get = async (url: string) => {
      requestedUrls.push(url)
      return {
        data: {
          success: true,
          message: '',
          data: {
            items: [
              {
                id: 1,
                trade_no: 'MS2026090912345',
                create_time: 1789000000,
                status: 'success',
                payment_method: 'alipay',
                amount: 100000,
                money: 20,
                user_id: 2,
              },
            ],
            total: 1,
          },
        },
      }
    }

    renderDialog()

    // 提示可见，且与订单记录共存
    expect(
      screen.getByText('Only shows orders from the last 30 days')
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('MS2026090912345')).toBeInTheDocument()
    )
    // 普通用户走 self 接口
    await waitFor(() => expect(requestedUrls.length).toBeGreaterThan(0))
    expect(requestedUrls[0]).toContain('/api/user/topup/self')
  })

  test('hides the notice from admins and queries the platform-wide endpoint', async () => {
    authState.role = 10
    apiClient.get = async (url: string) => {
      requestedUrls.push(url)
      return {
        data: { success: true, message: '', data: { items: [], total: 0 } },
      }
    }

    renderDialog()

    expect(
      screen.queryByText('Only shows orders from the last 30 days')
    ).toBeNull()
    await waitFor(() => expect(requestedUrls.length).toBeGreaterThan(0))
    expect(requestedUrls[0]).toContain('/api/user/topup?')
  })
})
