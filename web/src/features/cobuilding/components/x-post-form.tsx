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
import { ArrowRight, Link2, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSubmitCoBuilding } from '../hooks/use-co-building'
import { xPostFormSchema, type XPostFormValues } from '../lib/schema'
import { CO_BUILDING_TYPE } from '../types'

/** X 发帖活动提交卡片 */
export function XPostForm() {
  const { t } = useTranslation()
  const submit = useSubmitCoBuilding()

  const form = useForm<XPostFormValues>({
    resolver: zodResolver(xPostFormSchema),
    defaultValues: {
      post_url: '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    submit.mutate(
      { type: CO_BUILDING_TYPE.X_POST, post_url: values.post_url.trim() },
      {
        onSuccess: (response) => {
          if (response.success) {
            form.reset()
          }
        },
      }
    )
  })

  return (
    <Card className='gap-6'>
      <CardHeader className='gap-3'>
        <span
          className='bg-foreground text-background flex size-11 items-center justify-center rounded-xl text-lg font-bold'
          aria-hidden='true'
        >
          X
        </span>
        <div className='flex flex-col gap-1.5'>
          <h2 className='text-lg leading-snug font-semibold'>
            {t('Share your real experience with ModelSet')}
          </h2>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t(
              'Publish a real, public X post about your experience, then submit the post link to us'
            )}
          </p>
        </div>
      </CardHeader>

      <CardContent className='flex flex-col gap-6'>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-5'>
            <FormField
              control={form.control}
              name='post_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('X post link')}</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Link2
                        className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2'
                        aria-hidden='true'
                      />
                      <Input
                        className='pl-8'
                        placeholder='https://x.com/yourname/status/...'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <dl className='bg-muted/50 text-muted-foreground grid grid-cols-1 gap-4 rounded-lg p-4 sm:grid-cols-2'>
              <div className='flex flex-col gap-1'>
                <dt className='text-xs'>{t('Reward range')}</dt>
                <dd className='text-foreground text-sm font-semibold'>
                  {t('$1–$1000 account balance')}
                </dd>
              </div>
              <div className='flex flex-col gap-1 sm:border-border sm:border-l sm:pl-4'>
                <dt className='text-xs'>{t('How it is granted')}</dt>
                <dd className='text-foreground text-sm font-semibold'>
                  {t('Granted after manual review')}
                </dd>
              </div>
            </dl>

            <Button
              type='submit'
              disabled={submit.isPending}
              className='w-full sm:w-auto sm:min-w-44'
            >
              {submit.isPending ? (
                <Loader2 className='animate-spin' aria-hidden='true' />
              ) : (
                <>
                  {t('Submit post')}
                  <ArrowRight aria-hidden='true' data-icon='inline-end' />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
