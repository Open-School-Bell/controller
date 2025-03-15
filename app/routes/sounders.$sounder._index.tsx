import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: pageTitle('Sounders', data ? data.sounder.name : 'View Sounder')}
  ]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder},
    include: {
      zones: {include: {zone: true}},
      logs: {orderBy: {time: 'desc'}, take: 10}
    }
  })

  const zones = await prisma.zone.findMany({
    orderBy: {name: 'asc'},
    where: {id: {notIn: sounder.zones.map(({zoneId}) => zoneId)}}
  })

  return {sounder, zones}
}

const Sounder = () => {
  const {sounder, zones} = useLoaderData<typeof loader>()

  return (
    <div className="box">
      <h1>{sounder.name}</h1>
      <Link to={`/sounders/${sounder.id}/edit`}>Edit</Link>
      <p>IP: {sounder.ip}</p>
      <p>Screen: {sounder.screen ? 'Yes' : 'No'}</p>
      <p>Ringer Pin: {sounder.ringerPin === 0 ? 'No' : sounder.ringerPin}</p>
      {sounder.enrolled ? (
        <form method="post" action={`/sounders/${sounder.id}/reset`}>
          <button className={`${INPUT_CLASSES} bg-red-300 mt-2`}>
            Reset Key (will require re-enroll)
          </button>
        </form>
      ) : (
        <>
          <p>Key: {sounder.key}</p>
          <div className="bg-gray-300 rounded-md p-2">
            <pre>sounder --enroll {sounder.key} --controller 127.0.0.1</pre>
          </div>
        </>
      )}
      <h2>Zones</h2>
      <ul className="mb-2">
        {sounder.zones.map(({zone}) => {
          return <li key={zone.id}>{zone.name}</li>
        })}
      </ul>
      <form method="post" action={`/sounders/${sounder.id}/add-to-zone`}>
        <select name="zone" className={INPUT_CLASSES}>
          {zones.map(({id, name}) => {
            return (
              <option key={id} value={id}>
                {name}
              </option>
            )
          })}
        </select>
        <input
          type="submit"
          value="Add to Zone"
          className={`${INPUT_CLASSES} mt-2 bg-green-300`}
        />
      </form>
      <h2>Log</h2>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {sounder.logs.map(({id, message, time}) => {
            return (
              <tr key={id}>
                <td>{time.toISOString()}</td>
                <td>{message}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Sounder
