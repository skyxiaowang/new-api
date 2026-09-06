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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SectionPageLayout } from '@/components/layout'
import { useIsAdmin } from '@/hooks/use-admin'

import { EntryCards, type CoBuildingTab } from './components/entry-cards'
import { ReviewDialog } from './components/review-dialog'
import { RulesCard } from './components/rules-card'
import { SponsorshipForm } from './components/sponsorship-form'
import { SubmissionsList } from './components/submissions-list'
import { XPostForm } from './components/x-post-form'
import { CO_BUILDING_SITE_URL } from './constants'
import type { CoBuildingRecord } from './types'

type CoBuildingProps = {
  initialTab?: CoBuildingTab
}

/** 共建计划页面：入口卡片 + 表单/规则 + 申请记录（管理员附加审核管理） */
export function CoBuilding(props: CoBuildingProps) {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const [tab, setTab] = useState<CoBuildingTab>(props.initialTab ?? 'x-post')
  const [reviewRecord, setReviewRecord] = useState<CoBuildingRecord | null>(
    null
  )
  const [reviewOpen, setReviewOpen] = useState(false)

  const xPostRules = [
    t('Share your real experience with ModelSet, and keep the post public'),
    t(
      'Each post can be submitted only once; duplicate or irrelevant content will not be rewarded again'
    ),
    t(
      'Balance rewards range from $1 to $1000; the final amount is decided by manual review'
    ),
    t('Your post must include the site link {{url}}', {
      url: CO_BUILDING_SITE_URL,
    }),
  ]

  const sponsorshipRules = [
    t(
      'We prioritize projects with a clear product direction, real user value, or a sustainable operation plan'
    ),
    t(
      'Support can be $1–$1000 in balance, a full sponsorship covering the tokens your project needs, or an exclusive discount'
    ),
    t(
      'After receiving sponsorship, you need to display our promotional link as agreed when your site goes live'
    ),
  ]

  const handleSelectTab = (next: CoBuildingTab) => {
    setTab(next)
  }

  const handleReview = (record: CoBuildingRecord) => {
    setReviewRecord(record)
    setReviewOpen(true)
  }

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Co-building Plan')}</SectionPageLayout.Title>
      <SectionPageLayout.Content>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5'>
          <EntryCards tab={tab} isAdmin={isAdmin} onSelect={handleSelectTab} />

          {tab === 'x-post' && (
            <div className='grid gap-4 sm:gap-5 lg:grid-cols-3 lg:items-start'>
              <div className='lg:col-span-2'>
                <XPostForm />
              </div>
              <RulesCard title={t('Activity Rules')} rules={xPostRules} />
            </div>
          )}

          {tab === 'sponsorship' && (
            <div className='grid gap-4 sm:gap-5 lg:grid-cols-3 lg:items-start'>
              <div className='lg:col-span-2'>
                <SponsorshipForm />
              </div>
              <RulesCard title={t('Sponsorship Terms')} rules={sponsorshipRules} />
            </div>
          )}

          {tab === 'review' && isAdmin ? (
            <SubmissionsList mode='all' onReview={handleReview} />
          ) : (
            <SubmissionsList mode='self' />
          )}
        </div>
      </SectionPageLayout.Content>

      <ReviewDialog
        record={reviewRecord}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />
    </SectionPageLayout>
  )
}
