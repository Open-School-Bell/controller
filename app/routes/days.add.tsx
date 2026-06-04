import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useNavigate, useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'calendar.metaTitle'),
        translate(messages, 'days.add.pageTitle')
      )
    }
  ]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})

  return {days}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const copyFrom = formData.get('copyFrom') as string | undefined

  invariant(name)
  invariant(copyFrom)

  const dayType = await prisma.dayType.create({data: {name}})

  if (copyFrom !== '-') {
    const schedules = await prisma.schedule.findMany({
      where: {dayTypeId: copyFrom === '_' ? null : copyFrom}
    })

    await prisma.schedule.createMany({
      data: schedules.map(
        ({time, weekDays, zoneId, audioId, audioSequence}) => {
          return {
            dayTypeId: dayType.id,
            time,
            weekDays,
            zoneId,
            audioId,
            audioSequence
          }
        }
      )
    })
  }

  return redirect(`/calendar`)
}

const AddDay = () => {
  const navigate = useNavigate()
  const {days} = useLoaderData<typeof loader>()
  const {t} = useTranslation()

  return (
    <Page title={t('days.add.pageTitle')}>
      <form method="post">
        <FormElement
          label={t('days.form.name.label')}
          helperText={t('days.form.name.helper')}
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('days.form.copy.label')}
          helperText={t('days.form.copy.helper')}
        >
          <select name="copyFrom" className={INPUT_CLASSES}>
            <option value="-" selected>
              {t('days.form.copy.none')}
            </option>
            <option value="_">{t('days.form.copy.default')}</option>
            {days.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/calendar')
              }
            },
            {
              label: t('days.add.submit'),
              color: 'bg-green-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default AddDay
