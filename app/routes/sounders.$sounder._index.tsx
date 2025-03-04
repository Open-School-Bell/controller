import {type LoaderFunctionArgs} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder},
    include: {zones: {include: {zone: true}}}
  })

  const zones = await prisma.zone.findMany({
    orderBy: {name: 'asc'},
    where: {id: {notIn: sounder.zones.map(({zoneId}) => zoneId)}}
  })

  return {sounder, zones}
}

const Zone = () => {
  const {sounder, zones} = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{sounder.name}</h1>
      IP: {sounder.ip}
      {sounder.enrolled ? (
        <Link to={`/sounders/${sounder.id}/reset`}>
          Reset Key (will require re-enroll)
        </Link>
      ) : (
        <>
          <p>Key: {sounder.key}</p>
          <div className="bg-gray-300 rounded-md p-2">
            <pre>sounder --enroll {sounder.key} --controller 127.0.0.1</pre>
          </div>
        </>
      )}
      <h2>Zones</h2>
      <ul>
        {sounder.zones.map(({zone}) => {
          return <li key={zone.id}>{zone.name}</li>
        })}
      </ul>
      <form method="post" action={`/sounders/${sounder.id}/add-to-zone`}>
        <select name="zone">
          {zones.map(({id, name}) => {
            return (
              <option key={id} value={id}>
                {name}
              </option>
            )
          })}
        </select>
        <input type="submit" value="Add to Zone" />
      </form>
    </div>
  )
}

export default Zone
