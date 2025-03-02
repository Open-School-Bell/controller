import {
  type ActionFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})
  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})
  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {zones, days, sounds}
}

export const action: ActionFunction = async ({request}) => {
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

  invariant(time)
  invariant(zone)
  invariant(day)
  invariant(sound)

  const schedule = await prisma.schedule.create({
    data: {
      weekDays: days,
      time,
      zoneId: zone,
      dayTypeId: day === '_' ? undefined : day,
      audioId: sound
    }
  })

  return redirect(`/schedule/${schedule.id}`)
}

const AddSchedule = () => {
  const {zones, days, sounds} = useLoaderData<typeof loader>()

  return (
    <div>
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
              <div key={i}>
                {day}
                <input type="checkbox" name={`day[${i + 1}]`} value={i + 1} />
              </div>
            )
          })}
        </div>
        <label>
          Time
          <input type="time" name="time" />
        </label>
        <label>
          Day Type
          <select name="dayType" defaultValue={'_'}>
            <option value="_">Default</option>
            {days.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </label>
        <label>
          Zone
          <select name="zone">
            {zones.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </label>
        <label>
          Sound
          <select name="sound">
            {sounds.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </label>
        <input type="submit" value="Add" />
      </form>
    </div>
  )
}

export default AddSchedule
