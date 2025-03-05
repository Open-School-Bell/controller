import {type MetaFunction, type LoaderFunctionArgs} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {formatDistance} from 'date-fns'
import {useState} from 'react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})

  const date = new Date()
  date.setHours(0, 0, 0, 0)

  const dayAssignment = await prisma.dayTypeAssignment.findFirst({
    where: {date}
  })

  const dayTypeId = dayAssignment ? dayAssignment.dayTypeId : null

  const schedules = await prisma.schedule.findMany({
    where: {dayTypeId},
    orderBy: {time: 'asc'}
  })

  let dayType = 'Default'
  if (dayTypeId) {
    const dayTypeDb = await prisma.dayType.findFirstOrThrow({
      where: {id: dayTypeId}
    })

    dayType = dayTypeDb.name
  }

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})
  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})

  return {sounders, schedules, dayType, actions, zones}
}

const Screen = () => {
  const {sounders, schedules, dayType, actions, zones} =
    useLoaderData<typeof loader>()
  const [zone, setZone] = useState(zones[0].id)

  return (
    <div className="grid grid-cols-4 gap-12 p-12">
      <div className="grid grid-cols-2 col-span-2 bg-green-200 p-4">
        <img src="/logo.png" className="m-auto w-64" alt="Open School Bell" />
        <div>
          <ul>
            {zones.map(({id, name}) => {
              return (
                <li
                  key={id}
                  className={`${zone === id ? 'bg-blue-200' : ''} p-2`}
                  onClick={() => {
                    setZone(id)
                  }}
                >
                  {name}
                </li>
              )
            })}
          </ul>
        </div>
        {actions.map(({id, name, icon, action, audioId}) => {
          return (
            <button
              key={id}
              className="cursor-pointer text-center text-xl"
              onClick={async () => {
                if (action === 'broadcast') {
                  const data = new FormData()
                  data.append('sound', audioId!)
                  data.append('zone', zone)
                  await fetch('/broadcast', {method: 'post', body: data})
                }
              }}
            >
              <div className="text-6xl mb-2">{icon}</div>
              {name}
            </button>
          )
        })}
      </div>
      <div>
        <h2>{dayType}</h2>
        {schedules.map(({id, time}) => {
          return <div key={id}>{time}</div>
        })}
      </div>
      <div>
        <h2>Sounders</h2>
        <table>
          <thead>
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Online</th>
              <th className="p-2">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {sounders.map(({id, name, lastCheckIn}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/sounders/${id}`}>{name}</Link>
                  </td>
                  <td className="text-center">
                    {new Date().getTime() / 1000 -
                      lastCheckIn.getTime() / 1000 <
                    65
                      ? '🟢'
                      : '🔴'}
                  </td>
                  <td>
                    {formatDistance(lastCheckIn, new Date(), {addSuffix: true})}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Screen
