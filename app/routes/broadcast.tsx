import {invariant} from '@arcath/utils'
import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {useState} from 'react'
import {formatDistance} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {broadcast} from '~/lib/broadcast.server'
import {checkSession} from '~/lib/session'
import {Page} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})
  const zones = await prisma.zone.findMany({
    orderBy: {name: 'asc'},
    include: {sounders: {include: {sounder: true}}}
  })
  const desktopGroups = await prisma.desktopAlertGroup.findMany({
    orderBy: {name: 'asc'}
  })

  return {sounds, zones, desktopGroups}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const sound = formData.get('sound') as string | undefined
  const zone = formData.get('zone') as string | undefined
  const desktopGroup = formData.get('desktopGroup') as string | undefined
  const times = formData.get('times') as string | undefined

  invariant(sound)
  invariant(zone)
  invariant(desktopGroup)
  invariant(times)

  if (zone !== '_') {
    await broadcast(zone, sound, parseInt(times))
  }
  if (desktopGroup !== '_') {
    const audio = await prisma.audio.findFirstOrThrow({where: {id: sound}})

    const playData = JSON.stringify({
      fileName: audio.fileName,
      times,
      triggerTime: new Date().toJSON()
    })

    await prisma.desktopAlertGroup.update({
      where: {id: desktopGroup},
      data: {playData}
    })
  }

  return {status: 'ok'}
}

const Broadcast = () => {
  const {sounds, zones, desktopGroups} = useLoaderData<typeof loader>()
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
    <Page title="Broadcast">
      <div className="grid grid-cols-2 gap-8">
        <div className="box">
          <form method="post">
            <div className="grid grid-cols-2 gap-4">
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
              <label>
                Number of Times
                <input
                  type="number"
                  name="times"
                  className={INPUT_CLASSES}
                  defaultValue={1}
                />
              </label>
              <label>
                Zone
                <select
                  name="zone"
                  className={INPUT_CLASSES}
                  onChange={e => {
                    setSelectedZone(e.target.value)
                  }}
                  defaultValue="_"
                >
                  <option value="_">None</option>
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
                Desktop Groups
                <select
                  name="desktopGroup"
                  className={INPUT_CLASSES}
                  onChange={e => {
                    setSelectedZone(e.target.value)
                  }}
                  defaultValue="_"
                >
                  <option value="_">None</option>
                  {desktopGroups.map(({id, name}) => {
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    )
                  })}
                </select>
              </label>
            </div>

            <input
              type="submit"
              value="Broadcast!"
              className={`${INPUT_CLASSES} bg-green-400 mt-4`}
            />
          </form>
        </div>
        <div className="box">
          <h2>Sounders in Zone</h2>
          <table className="box-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Online</th>
                <th>Last Seen</th>
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
                      {formatDistance(lastCheckIn, new Date(), {
                        addSuffix: true
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  )
}

export default Broadcast
