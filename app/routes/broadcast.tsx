import {asyncForEach, invariant} from '@arcath/utils'
import {type LoaderFunctionArgs, type ActionFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState} from 'react'
import {formatDistance} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES} from '~/lib/utils'
import {broadcast} from '~/lib/broadcast.server'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})
  const zones = await prisma.zone.findMany({
    orderBy: {name: 'asc'},
    include: {sounders: {include: {sounder: true}}}
  })

  return {sounds, zones}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()

  const sound = formData.get('sound') as string | undefined
  const zone = formData.get('zone') as string | undefined
  const times = formData.get('times') as string | undefined

  invariant(sound)
  invariant(zone)
  invariant(times)

  await broadcast(zone, sound, parseInt(times))

  return {status: 'ok'}
}

const Broadcast = () => {
  const {sounds, zones} = useLoaderData<typeof loader>()
  const [selectedZone, setSelectedZone] = useState(zones[0].id)

  const sounders = zones
    .reduce((zone, nZone) => {
      if (nZone.id === selectedZone) {
        return nZone
      }

      return zone
    })
    .sounders.map(({sounder}) => sounder)

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="border border-gray-200 p-2">
        <form method="post">
          <label>
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
          <label className="mt-4">
            Zone
            <select
              name="zone"
              className={INPUT_CLASSES}
              onChange={e => {
                setSelectedZone(e.target.value)
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
          </label>
          <label>
            Number of Times
            <input
              type="number"
              name="times"
              className={INPUT_CLASSES}
              defaultValue={1}
            />
          </label>
          <input
            type="submit"
            value="Broadcast!"
            className={`${INPUT_CLASSES} bg-green-400 mt-4`}
          />
        </form>
      </div>
      <div className="border border-gray-200 p-2">
        <h2>Sounders in Zone</h2>
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
                  <td>{name}</td>
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

export default Broadcast
