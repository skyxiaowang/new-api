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
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2, X } from 'lucide-react'
import { Fragment, useEffect, type ReactNode } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import {
  CO_BUILDING_MAX_REWARD,
  CO_BUILDING_MIN_REWARD,
  CO_BUILDING_SUPPORT_CONFIG,
  CO_BUILDING_TYPE_CONFIG,
} from '../constants'
import { useReviewCoBuilding } from '../hooks/use-co-building'
import { reviewFormSchema, type ReviewFormValues } from '../lib/schema'
import { CO_BUILDING_TYPE, type CoBuildingRecord } from '../types'

type ReviewDialogProps = {
  record: CoBuildingRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** 管理员审核弹窗：通过=输入奖励金额（美元）；不通过=必填原因 */
export function ReviewDialog(props: ReviewDialogProps) {
  const { t } = useTranslation()
  const review = useReviewCoBuilding()

  const form = useForm<ReviewFormValues>({
    // z.coerce 使 schema 输入/输出类型不同，按项目惯例断言 Resolver（见 subscriptions）
    resolver: zodResolver(reviewFormSchema) as unknown as Resolver<ReviewFormValues>,
    defaultValues: {
      approve: true,
      amount: 0,
      note: '',
    },
  })

  const approve = form.watch('approve')

  useEffect(() => {
    if (props.open) {
      form.reset({ approve: true, amount: 0, note: '' })
    }
  }, [props.open, form])

  const onSubmit = form.handleSubmit((values) => {
    const record = props.record
    if (!record) return
    review.mutate(
      {
        id: record.id,
        approve: values.approve,
        amount: values.approve ? values.amount : undefined,
        note: values.note || undefined,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            props.onOpenChange(false)
          }
        },
      }
    )
  })

  const typeConfig = props.record ? CO_BUILDING_TYPE_CONFIG[props.record.type] : null
  const supportConfig = props.record
    ? CO_BUILDING_SUPPORT_CONFIG[props.record.support_type]
    : null

  // 审核弹窗内完整展示用户提交的原始数据，辅助管理员判断
  const linkContent = (url: string | null) => {
    if (!url) {
      return <span className='text-muted-foreground'>-</span>
    }
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='text-primary hover:underline'
      >
        {url}
      </a>
    )
  }

  const detailRows: { label: string; content: ReactNode }[] = []
  if (props.record) {
    if (props.record.type === CO_BUILDING_TYPE.X_POST) {
      detailRows.push({
        label: t('X post link'),
        content: linkContent(props.record.post_url),
      })
    } else {
      detailRows.push(
        {
          label: t('Website or project name'),
          content: props.record.project_name || '-',
        },
        {
          label: t('Contact information'),
          content: props.record.contact || '-',
        },
        {
          label: t('Website URL'),
          content: linkContent(props.record.website),
        },
        {
          label: t('GitHub link'),
          content: linkContent(props.record.github),
        },
        {
          label: t('Support you are applying for'),
          content: supportConfig ? t(supportConfig.labelKey) : '-',
        },
        {
          label: t('Current scale'),
          content: props.record.scale || '-',
        },
        {
          label: t('Agree to display our promotional links'),
          content: props.record.agree_promo ? t('Yes') : t('No'),
        }
      )
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('Review submission')}</DialogTitle>
          <DialogDescription className='text-left'>
            {props.record && (
              <span className='flex flex-col gap-1 pt-1'>
                <span>
                  {typeConfig ? t(typeConfig.labelKey) : ''} ·{' '}
                  {props.record.username}
                </span>
                <span className='text-muted-foreground text-xs'>
                  {t('Submitted at')}:{' '}
                  {props.record.created_at
                    ? dayjs.unix(props.record.created_at).format('YYYY-MM-DD HH:mm')
                    : '-'}
                </span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {props.record && detailRows.length > 0 && (
          <div className='bg-muted/30 flex flex-col gap-3 rounded-lg border p-4'>
            <div className='grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[9rem_1fr]'>
              {detailRows.map((row) => (
                <Fragment key={row.label}>
                  <span className='text-muted-foreground text-xs leading-5'>
                    {row.label}
                  </span>
                  <span className='min-w-0 text-xs leading-5 break-all'>
                    {row.content}
                  </span>
                </Fragment>
              ))}
            </div>
            {props.record.type === CO_BUILDING_TYPE.SPONSORSHIP &&
              props.record.description && (
                <div className='flex flex-col gap-1.5'>
                  <span className='text-muted-foreground text-xs font-medium'>
                    {t('Project introduction')}
                  </span>
                  <p className='max-h-40 overflow-y-auto text-xs leading-relaxed break-all whitespace-pre-wrap'>
                    {props.record.description}
                  </p>
                </div>
              )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-5'>
            <FormField
              control={form.control}
              name='approve'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      type='button'
                      aria-pressed={field.value === true}
                      onClick={() =>
                        form.setValue('approve', true, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-colors outline-none',
                        'focus-visible:ring-ring/40 focus-visible:ring-2',
                        field.value === true
                          ? 'border-success bg-success/10 text-success'
                          : 'hover:bg-muted/60 border-border'
                      )}
                    >
                      <Check className='size-4' aria-hidden='true' />
                      {t('Approve')}
                    </button>
                    <button
                      type='button'
                      aria-pressed={field.value === false}
                      onClick={() =>
                        form.setValue('approve', false, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-colors outline-none',
                        'focus-visible:ring-ring/40 focus-visible:ring-2',
                        field.value === false
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : 'hover:bg-muted/60 border-border'
                      )}
                    >
                      <X className='size-4' aria-hidden='true' />
                      {t('Reject')}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {approve && (
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Reward amount (USD)')}</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        min={CO_BUILDING_MIN_REWARD}
                        max={CO_BUILDING_MAX_REWARD}
                        placeholder={`${CO_BUILDING_MIN_REWARD} - ${CO_BUILDING_MAX_REWARD}`}
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Will be converted to account quota and added to the user balance'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {approve ? t('Note (optional)') : t('Rejection reason')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        approve
                          ? t('Optional note for this approval')
                          : t('Explain why this submission is rejected')
                      }
                      className='min-h-20'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => props.onOpenChange(false)}
                disabled={review.isPending}
              >
                {t('Cancel')}
              </Button>
              <Button type='submit' disabled={review.isPending}>
                {review.isPending && (
                  <Loader2 className='animate-spin' aria-hidden='true' />
                )}
                {t('Confirm')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
