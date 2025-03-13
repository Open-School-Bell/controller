import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {useState} from 'react'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Schedule')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const schedules = await prisma.schedule.findMany({
    orderBy: {time: 'asc'},
    include: {zone: true, audio: true}
  })

  const days = await prisma.dayType.findMany({
    orderBy: {name: 'asc'}
  })

  return {schedules, days}
}

const Schedule = () => {
  const {schedules, days} = useLoaderData<typeof loader>()
  const [day, setDay] = useState<null | string>(null)

  return (
    <div className="border border-gray-200 p-2">
      <h1>Schedules</h1>
      <select
        className={INPUT_CLASSES}
        onChange={e => {
          setDay(e.target.value === '_' ? null : e.target.value)
        }}
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
      <table>
        <thead>
          <tr>
            <th className="p-2">Time</th>
            <th className="p-2">Monday</th>
            <th className="p-2">Tuesday</th>
            <th className="p-2">Wednesday</th>
            <th className="p-2">Thursday</th>
            <th className="p-2">Friday</th>
            <th className="p-2">Saturday</th>
            <th className="p-2">Sunday</th>
            <th className="p-2">Zone</th>
            <th className="p-2">Sound</th>
            <th className="p-2">Count</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schedules
            .filter(({dayTypeId}) => {
              return dayTypeId === day
            })
            .map(({id, time, weekDays, zone, audio, count}) => {
              const days = weekDays.split(',')

              return (
                <tr key={id}>
                  <td>
                    <Link to={`/schedule/${id}`}>{time}</Link>
                  </td>
                  <td className="text-center">
                    {days.includes('1') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('2') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('3') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('4') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('5') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('6') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('7') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">{zone.name}</td>
                  <td className="text-center">
                    <Link to={`/sounds/${audio.id}`}>{audio.name}</Link>
                  </td>
                  <td className="text-center">{count}</td>
                  <td className="text-center">
                    <form method="post" action={`/schedule/${id}/delete`}>
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
        </tbody>
        <tfoot>
          <tr>
            <td className="py-4">
              <Link to="/schedule/add">Add</Link>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default Schedule
