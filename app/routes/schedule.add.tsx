import {
  type ActionFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import {Page, FormElement, Actions} from '~/lib/ui'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {useLocalStorage} from '~/lib/hooks/use-local-storage'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {initTranslations} from '~/lib/i18n.server'
import {SequenceBuilder} from '~/lib/sequence-builder'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'schedule.metaTitle'),
        translate(messages, 'schedule.add.pageTitle')
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

  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})
  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})
  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {zones, days, sounds}
}

export const action: ActionFunction = async ({request}) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()
  const {messages} = initTranslations(request)

  const monday = formData.get('day[1]')
  const tuesday = formData.get('day[2]')
  const wednesday = formData.get('day[3]')
  const thursday = formData.get('day[4]')
  const friday = formData.get('day[5]')
  const saturday = formData.get('day[6]')
  const sunday = formData.get('day[7]')

  const days = [
    !!monday,
    !!tuesday,
    !!wednesday,
    !!thursday,
    !!friday,
    !!saturday,
    !!sunday
  ]
    .reduce((d, c, i) => {
      if (c) {
        return [...d, i + 1]
      }

      return d
    }, [] as number[])
    .join(',')

  if (days === '') {
    throw new Error(translate(messages, 'schedule.error.noDays'))
  }

  const time = formData.get('time') as string | undefined
  const zone = formData.get('zone') as string | undefined
  const day = formData.get('dayType') as string | undefined
  const sequence = formData.get('sequence') as string | undefined

  invariant(time)
  invariant(zone)
  invariant(day)
  invariant(sequence)

  await prisma.schedule.create({
    data: {
      weekDays: days,
      time,
      zoneId: zone,
      dayTypeId: day === '_' ? undefined : day,
      audioId: JSON.parse(sequence)[0],
      count: 0,
      audioSequence: sequence
    }
  })

  return redirect(`/schedule`)
}

const AddSchedule = () => {
  const {zones, days, sounds} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [day, setDay] = useLocalStorage<string>('day', '_')
  const [zone, setZone] = useLocalStorage<string>('zone', zones[0].id)
  const {t} = useTranslation()

  return (
    <Page title={t('schedule.add.pageTitle')}>
      <form method="post">
        <div className="grid grid-cols-7 border-b border-b-stone-100 mb-4">
          {[
            t('calendar.weekdays.monday'),
            t('calendar.weekdays.tuesday'),
            t('calendar.weekdays.wednesday'),
            t('calendar.weekdays.thursday'),
            t('calendar.weekdays.friday'),
            t('calendar.weekdays.saturday'),
            t('calendar.weekdays.sunday')
          ].map((dayLabel, i) => {
            return (
              <label key={i} className="text-center cursor-pointer mb-4">
                <p>{dayLabel}</p>
                <input type="checkbox" name={`day[${i + 1}]`} value={i + 1} />
              </label>
            )
          })}
        </div>
        <FormElement
          label={t('schedule.form.time.label')}
          helperText={t('schedule.form.time.helper')}
        >
          <input type="time" name="time" className={`${INPUT_CLASSES}`} />
        </FormElement>
        <FormElement
          label={t('schedule.form.day.label')}
          helperText={t('schedule.form.day.helper')}
        >
          <select
            name="dayType"
            defaultValue={day}
            className={`${INPUT_CLASSES}`}
            onChange={e => {
              setDay(e.target.value)
            }}
          >
            <option value="_">{t('schedule.defaultOption')}</option>
            {days.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <FormElement
          label={t('schedule.form.zone.label')}
          helperText={t('schedule.form.zone.helper')}
        >
          <select
            name="zone"
            className={INPUT_CLASSES}
            defaultValue={zone}
            onChange={e => {
              setZone(e.target.value)
            }}
          >
            {zones.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <SequenceBuilder
          sounds={sounds}
          initialQueue={[]}
          name="sequence"
          label={t('schedule.form.sequence.label')}
          helperText={t('schedule.form.sequence.helper')}
        />
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/schedule')
              }
            },
            {label: t('schedule.add.submit'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSchedule
