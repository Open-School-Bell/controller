import {
  type ActionFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Schedule', 'Add')}]
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

  await prisma.schedule.create({
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

const AddSchedule = () => {
  const {zones, days, sounds} = useLoaderData<typeof loader>()

  return (
    <div className="border border-gray-300 p-2">
      <form method="post">
        <div className="grid grid-cols-7">
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
              <label key={i} className="text-center cursor-pointer">
                <p>{day}</p>
                <input type="checkbox" name={`day[${i + 1}]`} value={i + 1} />
              </label>
            )
          })}
        </div>
        <div className="grid grid-cols-4 mt-2">
          <label className="p-2">
            Time
            <input type="time" name="time" className={`${INPUT_CLASSES}`} />
            <span className="text-gray-400">
              The time that the scheduled bell will occur.
            </span>
          </label>
          <label className="p-2">
            Day Type
            <select
              name="dayType"
              defaultValue={'_'}
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
            <span className="text-gray-400">
              The day type that this schedule applies to.
            </span>
          </label>
          <label className="p-2">
            Zone
            <select name="zone" className={INPUT_CLASSES}>
              {zones.map(({id, name}) => {
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </select>
          </label>
          <label className="p-2">
            Sound
            <select name="sound" className={INPUT_CLASSES}>
              {sounds.map(({id, name}) => {
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </select>
          </label>
          <label>
            Count
            <input
              type="number"
              defaultValue={1}
              name="count"
              className={INPUT_CLASSES}
            />
          </label>
        </div>
        <input
          type="submit"
          value="Add"
          className={`${INPUT_CLASSES} bg-green-300 cursor-pointer`}
        />
      </form>
    </div>
  )
}

export default AddSchedule
