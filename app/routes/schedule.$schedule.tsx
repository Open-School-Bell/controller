import {
  type ActionFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: pageTitle('Schedule', data ? data.schedule.time : 'View Schedule')}
  ]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})
  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})
  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  const schedule = await prisma.schedule.findFirstOrThrow({
    where: {id: params.schedule}
  })

  return {zones, days, sounds, schedule}
}

export const action: ActionFunction = async ({request, params}) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

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
    throw new Error('Days must be defined')
  }

  const time = formData.get('time') as string | undefined
  const zone = formData.get('zone') as string | undefined
  const day = formData.get('dayType') as string | undefined
  const sound = formData.get('sound') as string | undefined
  const count = formData.get('count') as string | undefined

  invariant(time)
  invariant(zone)
  invariant(day)
  invariant(sound)
  invariant(count)

  await prisma.schedule.update({
    where: {id: params.schedule},
    data: {
      weekDays: days,
      time,
      zoneId: zone,
      dayTypeId: day === '_' ? undefined : day,
      audioId: sound,
      count: parseInt(count)
    }
  })

  return redirect(`/schedule`)
}

const EditSchedule = () => {
  const {zones, days, sounds, schedule} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Edit Schedule">
      <form method="post">
        <div className="grid grid-cols-7 border-b border-b-stone-100 mb-4">
          {[
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ].map((day, i) => {
            return (
              <label key={i} className="text-center cursor-pointer mb-4">
                <p>{day}</p>
                <input
                  type="checkbox"
                  name={`day[${i + 1}]`}
                  value={i + 1}
                  defaultChecked={schedule.weekDays
                    .split(',')
                    .includes(`${i + 1}`)}
                />
              </label>
            )
          })}
        </div>
        <FormElement
          label="Time"
          helperText="The time to trigger the sound. Will be triggered at 0 seconds past the minute."
        >
          <input
            type="time"
            name="time"
            className={`${INPUT_CLASSES}`}
            defaultValue={schedule.time}
          />
        </FormElement>
        <FormElement
          label="Day"
          helperText="The type of day this schedule applies to."
        >
          <select
            name="dayType"
            defaultValue={schedule.dayTypeId!}
            className={`${INPUT_CLASSES}`}
          >
            <option value="_">Default</option>
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
          label="Zone"
          helperText="Which zone does this schedule apply to?"
        >
          <select
            name="zone"
            className={INPUT_CLASSES}
            defaultValue={schedule.zoneId}
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
        <FormElement
          label="Sound"
          helperText="Which sound should be played for this schedule?"
        >
          <select
            name="sound"
            className={INPUT_CLASSES}
            defaultValue={schedule.audioId}
          >
            {sounds.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <FormElement
          label="Count"
          helperText="How many times should the sound be played"
        >
          <input
            type="number"
            defaultValue={schedule.count}
            name="count"
            className={INPUT_CLASSES}
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/schedule')
              }
            },
            {label: 'Edit Schedule', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default EditSchedule
