import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {formatDistance} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})

  return {sounders}
}

export const meta: MetaFunction = () => {
  return [{title: 'Open School Bell'}]
}

export default function Index() {
  const {sounders} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-3">
      <div className="border border-gray-200 p-2">
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
