import {asyncForEach, invariant} from '@arcath/utils'
import {type LoaderFunctionArgs, type ActionFunctionArgs} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})
  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})

  return {sounds, zones}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  const formData = await request.formData()

  const sound = formData.get('sound') as string | undefined
  const zone = formData.get('zone') as string | undefined

  invariant(sound)
  invariant(zone)

  const z = await prisma.zone.findFirstOrThrow({
    where: {id: zone},
    include: {sounders: {include: {sounder: true}}}
  })

  await asyncForEach(z.sounders, async ({sounder}) => {
    await fetch(`http://${sounder.ip}:3000/play?id=${sound}`)
  })

  return {status: 'ok'}
}

const Broadcast = () => {
  const {sounds, zones} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <form method="post">
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
          <input type="submit" value="broadcast" />
        </form>
      </div>
    </div>
  )
}

export default Broadcast
