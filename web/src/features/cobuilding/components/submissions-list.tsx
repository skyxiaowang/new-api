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
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  RefreshCw,
  Search,
} from 'lucide-react'
import i18next from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/use-debounce'
import dayjs from '@/lib/dayjs'
import { formatQuota } from '@/lib/format'
import {
  CO_BUILDING_STATUS_CONFIG,
  CO_BUILDING_STATUS_OPTIONS,
  CO_BUILDING_SUPPORT_CONFIG,
  CO_BUILDING_TYPE_CONFIG,
  CO_BUILDING_TYPE_OPTIONS,
} from '../constants'
import { useCoBuildingList } from '../hooks/use-co-building'
import {
  CO_BUILDING_STATUS,
  CO_BUILDING_TYPE,
  type CoBuildingRecord,
} from '../types'

const PAGE_SIZE = 10
const ALL_FILTER = 'all'

type SubmissionsListProps = {
  /** self=用户本人记录；all=管理员全量记录 */
  mode: 'self' | 'all'
  /** 管理员点击「审核」时回调 */
  onReview?: (record: CoBuildingRecord) => void
}

function formatTime(ts: number): string {
  if (!ts) return '-'
  return dayjs.unix(ts).format('YYYY-MM-DD HH:mm')
}

function contentSummary(record: CoBuildingRecord): string {
  if (record.type === CO_BUILDING_TYPE.X_POST && record.post_url) {
    return record.post_url
  }
  // 非组件上下文使用 i18next 的 t（不会随语言切换自动更新，仅用于摘要）
  const support = CO_BUILDING_SUPPORT_CONFIG[record.support_type]
  const supportLabel = support ? ` · ${i18next.t(support.labelKey)}` : ''
  return `${record.project_name}${supportLabel}`
}

/** 申请记录卡片：底部通栏，用户视角看自己的，管理员视角看全部并审核 */
export function SubmissionsList(props: SubmissionsListProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const isAdminMode = props.mode === 'all'

  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  // 管理员进入审核管理默认只看待审核记录，减少翻找
  const [statusFilter, setStatusFilter] = useState<string>(
    isAdminMode ? String(CO_BUILDING_STATUS.PENDING) : ALL_FILTER
  )
  const [typeFilter, setTypeFilter] = useState<string>(ALL_FILTER)
  const debouncedKeyword = useDebounce(keyword)

  const status =
    statusFilter === ALL_FILTER ? -1 : Number.parseInt(statusFilter, 10)
  const type =
    typeFilter === ALL_FILTER ? 0 : Number.parseInt(typeFilter, 10)

  const { data, isLoading, isFetching } = useCoBuildingList({
    scope: props.mode,
    page,
    pageSize: PAGE_SIZE,
    keyword: isAdminMode ? debouncedKeyword : undefined,
    status: isAdminMode ? status : undefined,
    type: isAdminMode ? type : undefined,
  })

  const records = data?.success ? (data.data?.items ?? []) : []
  const total = data?.success ? (data.data?.total ?? 0) : 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['cobuilding'] })
  }

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    setPage(1)
  }
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }
  const handleTypeChange = (value: string) => {
    setTypeFilter(value)
    setPage(1)
  }

  return (
    <Card className='gap-4'>
      <CardHeader className='flex-row items-center justify-between gap-3'>
        <div className='flex flex-col gap-0.5'>
          <span className='text-primary text-xs font-medium tracking-widest uppercase'>
            {isAdminMode ? t('ALL SUBMISSIONS') : t('YOUR SUBMISSIONS')}
          </span>
          <h2 className='text-base font-semibold'>{t('Submission records')}</h2>
        </div>
        <Button
          variant='outline'
          size='icon'
          aria-label={t('Refresh')}
          disabled={isFetching}
          onClick={refresh}
        >
          <RefreshCw
            className={isFetching ? 'animate-spin' : undefined}
            aria-hidden='true'
          />
        </Button>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        {isAdminMode && (
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <div className='relative flex-1 sm:max-w-64'>
              <Search
                className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2'
                aria-hidden='true'
              />
              <Input
                className='pl-8'
                placeholder={t('Search user / project / contact')}
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
              />
            </div>
            <Select
              items={[
                { value: ALL_FILTER, label: t('All statuses') },
                ...CO_BUILDING_STATUS_OPTIONS.map((option) => ({
                  value: String(option.value),
                  label: t(option.labelKey),
                })),
              ]}
              value={statusFilter}
              onValueChange={(value) => {
                if (value !== null) handleStatusChange(value)
              }}
            >
              <SelectTrigger className='w-full sm:w-36' aria-label={t('Status')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>{t('All statuses')}</SelectItem>
                {CO_BUILDING_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={[
                { value: ALL_FILTER, label: t('All types') },
                ...CO_BUILDING_TYPE_OPTIONS.map((option) => ({
                  value: String(option.value),
                  label: t(option.labelKey),
                })),
              ]}
              value={typeFilter}
              onValueChange={(value) => {
                if (value !== null) handleTypeChange(value)
              }}
            >
              <SelectTrigger className='w-full sm:w-36' aria-label={t('Type')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>{t('All types')}</SelectItem>
                {CO_BUILDING_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading && (
          <div className='flex flex-col gap-2'>
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        )}

        {!isLoading && records.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Inbox aria-hidden='true' />
              </EmptyMedia>
              <EmptyTitle>{t('No submissions yet')}</EmptyTitle>
              <EmptyDescription>
                {isAdminMode
                  ? t('No submissions to review')
                  : t('Submit your first application above')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && records.length > 0 && (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Type')}</TableHead>
                  {isAdminMode && <TableHead>{t('User')}</TableHead>}
                  <TableHead>{t('Content')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Reward')}</TableHead>
                  <TableHead>{t('Note')}</TableHead>
                  {isAdminMode && <TableHead>{t('Reviewer')}</TableHead>}
                  <TableHead>{t('Submitted at')}</TableHead>
                  <TableHead>{t('Reviewed at')}</TableHead>
                  {isAdminMode && <TableHead className='text-right'>{t('Actions')}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const statusConfig =
                    CO_BUILDING_STATUS_CONFIG[record.status] ??
                    CO_BUILDING_STATUS_CONFIG[CO_BUILDING_STATUS.PENDING]
                  const typeConfig = CO_BUILDING_TYPE_CONFIG[record.type]
                  return (
                    <TableRow key={record.id}>
                      <TableCell className='whitespace-nowrap text-sm'>
                        {typeConfig ? t(typeConfig.labelKey) : record.type}
                      </TableCell>
                      {isAdminMode && (
                        <TableCell className='text-sm'>
                          {record.username}
                        </TableCell>
                      )}
                      <TableCell
                        className='max-w-64 truncate text-sm'
                        title={
                          record.type === CO_BUILDING_TYPE.X_POST
                            ? (record.post_url ?? '')
                            : [
                                contentSummary(record),
                                record.contact,
                                record.scale,
                                record.description,
                              ]
                              .filter(Boolean)
                              .join(' · ')
                        }
                      >
                        {record.type === CO_BUILDING_TYPE.X_POST &&
                        record.post_url ? (
                          <a
                            href={record.post_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-primary hover:underline'
                          >
                            {record.post_url}
                          </a>
                        ) : (
                          contentSummary(record)
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          label={t(statusConfig.labelKey)}
                          variant={statusConfig.variant}
                          showDot
                          copyable={false}
                        />
                      </TableCell>
                      <TableCell className='text-sm whitespace-nowrap'>
                        {record.status === CO_BUILDING_STATUS.APPROVED &&
                        record.reward_quota > 0
                          ? formatQuota(record.reward_quota)
                          : '-'}
                      </TableCell>
                      <TableCell
                        className='text-muted-foreground max-w-48 truncate text-sm'
                        title={record.review_note}
                      >
                        {record.review_note || '-'}
                      </TableCell>
                      {isAdminMode && (
                        <TableCell className='text-sm whitespace-nowrap'>
                          {record.reviewer_name || '-'}
                        </TableCell>
                      )}
                      <TableCell className='text-muted-foreground text-sm whitespace-nowrap'>
                        {formatTime(record.created_at)}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm whitespace-nowrap'>
                        {formatTime(record.reviewed_at)}
                      </TableCell>
                      {isAdminMode && (
                        <TableCell className='text-right'>
                          {record.status === CO_BUILDING_STATUS.PENDING &&
                          props.onReview ? (
                            <Button
                              size='sm'
                              onClick={() => props.onReview?.(record)}
                            >
                              {t('Review')}
                            </Button>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className='flex items-center justify-end gap-2'>
            <span className='text-muted-foreground text-xs'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='icon'
              aria-label={t('Previous page')}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft aria-hidden='true' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              aria-label={t('Next page')}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight aria-hidden='true' />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
