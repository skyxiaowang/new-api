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
import {
  ArrowRight,
  Award,
  Gift,
  Heart,
  Loader2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { cn } from '@/lib/utils'
import { CO_BUILDING_SUPPORT_OPTIONS } from '../constants'
import { useSubmitCoBuilding } from '../hooks/use-co-building'
import {
  sponsorshipFormSchema,
  type SponsorshipFormValues,
} from '../lib/schema'
import { CO_BUILDING_SUPPORT, CO_BUILDING_TYPE } from '../types'

const SUPPORT_ICONS = [Gift, Heart, Award] as const

/** 申请赞助表单卡片 */
export function SponsorshipForm() {
  const { t } = useTranslation()
  const submit = useSubmitCoBuilding()

  const form = useForm<SponsorshipFormValues>({
    resolver: zodResolver(sponsorshipFormSchema),
    defaultValues: {
      project_name: '',
      contact: '',
      website: '',
      github: '',
      support_type: CO_BUILDING_SUPPORT.BALANCE,
      scale: '',
      description: '',
      agree_promo: false,
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    submit.mutate(
      { type: CO_BUILDING_TYPE.SPONSORSHIP, ...values },
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
          className='bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl'
          aria-hidden='true'
        >
          <Heart className='size-5' />
        </span>
        <div className='flex flex-col gap-1.5'>
          <h2 className='text-lg leading-snug font-semibold'>
            {t('Every dream deserves to be taken seriously')}
          </h2>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {t(
              'Whether your project is just starting out or already serving real users, we are happy to hear your story and support you'
            )}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className='flex flex-col gap-5'>
            <FormField
              control={form.control}
              name='project_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Website or project name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Enter the website or project name')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Contact information')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t(
                        'Email, @Telegram username, or https://t.me/username'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Only email or Telegram is supported, so we can confirm the application with you'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid gap-5 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Website URL (optional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder='https://' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='github'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('GitHub link (optional)')}</FormLabel>
                    <FormControl>
                      <Input placeholder='https://github.com/' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='support_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Support you are applying for')}</FormLabel>
                  <div className='grid gap-3 sm:grid-cols-3'>
                    {CO_BUILDING_SUPPORT_OPTIONS.map((option, index) => {
                      const Icon = SUPPORT_ICONS[index] ?? Gift
                      const active = field.value === option.value
                      return (
                        <button
                          key={option.value}
                          type='button'
                          aria-pressed={active}
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            'flex flex-col gap-2 rounded-lg border p-3 text-start transition-colors outline-none',
                            'focus-visible:ring-ring/40 focus-visible:ring-2',
                            active
                              ? 'border-primary bg-primary/5'
                              : 'hover:bg-muted/60 border-border bg-muted/40'
                          )}
                        >
                          <Icon
                            className={cn(
                              'size-4',
                              active
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            )}
                            aria-hidden='true'
                          />
                          <span className='text-foreground text-sm font-medium'>
                            {t(option.labelKey)}
                          </span>
                          <span className='text-muted-foreground text-xs'>
                            {t(option.descKey)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='scale'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Current scale (optional)')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('For example: 10,000 visits per month')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Project introduction')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Introduce the purpose of the website, target users, current stage, and your plan'
                      )}
                      className='min-h-28'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='agree_promo'
              render={({ field }) => (
                <FormItem>
                  <label className='bg-primary/5 flex items-start gap-3 rounded-lg border border-transparent p-4'>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    <span className='flex flex-col gap-1'>
                      <span className='text-foreground text-sm font-medium'>
                        {t('Agree to display our promotional links')}
                      </span>
                      <span className='text-muted-foreground text-xs leading-relaxed'>
                        {t(
                          'After the project goes live, keep displaying the link we provide in a suitable place on your website as a partnership ad'
                        )}
                      </span>
                    </span>
                  </label>
                </FormItem>
              )}
            />

            <Button
              type='submit'
              disabled={submit.isPending}
              className='w-full sm:w-auto sm:min-w-52'
            >
              {submit.isPending ? (
                <Loader2 className='animate-spin' aria-hidden='true' />
              ) : (
                <>
                  {t('Submit sponsorship application')}
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
