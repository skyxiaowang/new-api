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
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

const { createInstance } = await import('i18next')
const { I18nextProvider, initReactI18next } = await import('react-i18next')
const { QueryClient, QueryClientProvider } =
  await import('@tanstack/react-query')
const { api } = await import('@/lib/api')
const { SponsorshipForm } = await import('../components/sponsorship-form')

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: {} } },
})

type ApiMethod = (url: string, data?: unknown) => Promise<{ data: unknown }>
type MockableApi = {
  post: ApiMethod
}
type SubmittedPost = {
  url: string
  data: unknown
}

const apiClient = api as unknown as MockableApi
const originalPost = apiClient.post
const submittedPosts: SubmittedPost[] = []

function renderForm(): void {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <SponsorshipForm />
      </I18nextProvider>
    </QueryClientProvider>
  )
}

function supportCard(label: RegExp): HTMLButtonElement {
  return screen.getByRole('button', { name: label })
}

function fillRequiredFields(): void {
  fireEvent.input(screen.getByLabelText('Website or project name'), {
    target: { value: 'my-site' },
  })
  fireEvent.input(screen.getByLabelText('Contact information'), {
    target: { value: 'a@b.com' },
  })
  fireEvent.input(screen.getByLabelText('Project introduction'), {
    target: { value: 'a cool project' },
  })
}

function submitForm(): void {
  fireEvent.click(
    screen.getByRole('button', { name: 'Submit sponsorship application' })
  )
}

afterEach(() => {
  apiClient.post = originalPost
  submittedPosts.length = 0
})

describe('sponsorship form support type cards', () => {
  test('marks the default balance card as selected before any interaction', () => {
    renderForm()

    expect(supportCard(/Balance support/)).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(supportCard(/Full sponsorship/)).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(supportCard(/Exclusive discount/)).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('selects the clicked card and deselects the previous one', () => {
    renderForm()

    fireEvent.click(supportCard(/Exclusive discount/))

    expect(supportCard(/Exclusive discount/)).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(supportCard(/Balance support/)).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  test('submits the clicked support type as a number without schema error', async () => {
    apiClient.post = async (url, data) => {
      submittedPosts.push({ url, data })
      return { data: { success: true, message: '', data: null } }
    }
    renderForm()
    fillRequiredFields()

    fireEvent.click(supportCard(/Exclusive discount/))
    submitForm()

    await waitFor(() => expect(submittedPosts.length).toBe(1))
    expect(submittedPosts[0]?.url).toBe('/api/user/cobuilding')
    const payload = submittedPosts[0]?.data as { support_type?: unknown }
    expect(payload.support_type).toBe(3)
    expect(typeof payload.support_type).toBe('number')
    expect(screen.queryByText('Invalid input')).toBeNull()
  })
})
