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
import { ClipboardCheck, Heart, Megaphone } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export type CoBuildingTab = 'x-post' | 'sponsorship' | 'review'

type EntryCardProps = {
  tab: CoBuildingTab
  active: boolean
  disabled?: boolean
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  onSelect: (tab: CoBuildingTab) => void
}

function EntryCard(props: EntryCardProps) {
  const Icon = props.icon
  return (
    <button
      type='button'
      disabled={props.disabled}
      aria-pressed={props.active}
      onClick={() => props.onSelect(props.tab)}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-colors outline-none select-none',
        'focus-visible:ring-ring/40 focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60',
        props.active
          ? 'border-primary bg-primary/5'
          : 'hover:bg-muted/60 border-border bg-muted/40'
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          props.active
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-muted-foreground border-border border'
        )}
      >
        <Icon className='size-5' aria-hidden='true' />
      </span>
      <span className='flex min-w-0 flex-col gap-0.5'>
        <span className='text-foreground truncate text-sm font-semibold'>
          {props.title}
        </span>
        <span className='text-muted-foreground truncate text-xs'>
          {props.description}
        </span>
      </span>
    </button>
  )
}

type EntryCardsProps = {
  tab: CoBuildingTab
  isAdmin: boolean
  onSelect: (tab: CoBuildingTab) => void
}

/** 顶部的入口卡片（X 发帖活动 / 申请赞助 / 管理员审核管理） */
export function EntryCards(props: EntryCardsProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'grid gap-3',
        props.isAdmin ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'
      )}
    >
      <EntryCard
        tab='x-post'
        active={props.tab === 'x-post'}
        icon={Megaphone}
        title={t('X Post Activity')}
        description={t('Share your real experience and earn balance rewards')}
        onSelect={props.onSelect}
      />
      <EntryCard
        tab='sponsorship'
        active={props.tab === 'sponsorship'}
        icon={Heart}
        title={t('Apply for Sponsorship')}
        description={t(
          'Apply for balance, full sponsorship, or exclusive discounts'
        )}
        onSelect={props.onSelect}
      />
      {props.isAdmin && (
        <EntryCard
          tab='review'
          active={props.tab === 'review'}
          icon={ClipboardCheck}
          title={t('Review Management')}
          description={t('Review all user submissions and grant rewards')}
          onSelect={props.onSelect}
        />
      )}
    </div>
  )
}
