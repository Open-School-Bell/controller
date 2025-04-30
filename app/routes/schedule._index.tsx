import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {Link, useLoaderData, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, Actions} from '~/lib/ui'
import {useStatefulLocalStorage} from '~/lib/hooks/use-local-storage'

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
  const [day, setDay] = useStatefulLocalStorage<string>('day', '_')
  const navigate = useNavigate()

  return (
    <Page title="Schedule">
      <select
        className={INPUT_CLASSES}
        onChange={e => {
          setDay(e.target.value)
        }}
        value={day}
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
      <table className="box-table mb-4">
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
              return dayTypeId === (day === '_' ? null : day)
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
      </table>
      <Actions
        actions={[
          {
            label: 'Add Schedule',
            color: 'bg-green-300',
            onClick: () => navigate('/schedule/add')
          }
        ]}
      />
    </Page>
  )
}

export default Schedule
