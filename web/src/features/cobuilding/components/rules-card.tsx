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
import { Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type RulesCardProps = {
  /** 卡片标题（已翻译） */
  title: string
  /** 规则条目（已翻译） */
  rules: string[]
}

/** 活动规则 / 赞助约定 通用说明卡：编号列表 + 人工审核脚注 */
export function RulesCard(props: RulesCardProps) {
  const { t } = useTranslation()

  return (
    <Card className='gap-4'>
      <CardHeader>
        <CardTitle className='text-base'>{props.title}</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col'>
        <ol className='space-y-3'>
          {props.rules.map((rule, index) => (
            <li key={rule} className='flex items-start gap-3'>
              <span className='bg-muted text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium'>
                {index + 1}
              </span>
              <span className='text-muted-foreground text-sm leading-relaxed'>
                {rule}
              </span>
            </li>
          ))}
        </ol>
        <div className='mt-auto flex flex-col gap-3 pt-6'>
          <Separator />
          <p className='text-muted-foreground flex items-center gap-2 text-xs'>
            <Clock className='size-3.5' aria-hidden='true' />
            {t('All submissions are reviewed manually by the team')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
