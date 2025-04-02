import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {format} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {getSetting} from '~/lib/settings.server'

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

  const enrollUrl = await getSetting('enrollUrl')

  return {sounder, zones, enrollUrl}
}

const Sounder = () => {
  const {sounder, zones, enrollUrl} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title={sounder.name}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="box">
          <h2>About</h2>
          <p>IP: {sounder.ip}</p>
          <p>Screen: {sounder.screen ? 'Yes' : 'No'}</p>
          <p>
            Ringer Pin: {sounder.ringerPin === 0 ? 'No' : sounder.ringerPin}
          </p>
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
                <pre>
                  sounder --enroll {sounder.key} --controller {enrollUrl}
                </pre>
              </div>
            </>
          )}
        </div>
        <div className="box">
          <h2>Zones</h2>
          <ul className="mb-2">
            {sounder.zones.map(({id, zone}) => {
              return (
                <li key={zone.id}>
                  <form
                    action={`/sounders/${sounder.id}/remove-from-zone`}
                    method="post"
                  >
                    {zone.name} <button className="cursor-pointer">🗑️</button>
                    <input type="hidden" name="sounderZone" value={id} />
                  </form>
                </li>
              )
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
        </div>
        <div className="col-span-2 box">
          <h2>Log</h2>
          <table className="box-table">
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
                    <td className="text-center">
                      {format(time, 'dd/MM/yy HH:mm')}
                    </td>
                    <td>{message}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Actions
        actions={[
          {
            label: 'Edit Sounder',
            color: 'bg-blue-300',
            onClick: () => navigate(`/sounders/${sounder.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Sounder
