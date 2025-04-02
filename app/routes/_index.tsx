import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {Link, useLoaderData} from '@remix-run/react'
import {formatDistance} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {getSetting} from '~/lib/settings.server'
import {Page} from '~/lib/ui'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})

  const lockdownMode = await getSetting('lockdownMode')

  return {sounders, lockdownMode}
}

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Dashboard')}]
}

export default function Index() {
  const {sounders, lockdownMode} = useLoaderData<typeof loader>()

  return (
    <Page title="Open School Bell">
      <div className="grid grid-cols-2 gap-4">
        <div className="box">
          <h2>Sounders</h2>
          <table className="box-table">
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
        <div
          className={`box ${lockdownMode === '0' ? 'bg-green-300' : 'bg-red-300'}`}
        >
          <p>Lockdown Mode {lockdownMode === '0' ? 'Disabled' : 'Enabled'}</p>
          <form
            action="/lockdown/trigger"
            method="post"
            onSubmit={e => {
              if (
                !confirm(
                  `Are you sure you want to ${lockdownMode === '0' ? 'enable' : 'disable'} lockdown?`
                )
              ) {
                e.preventDefault()
              }
            }}
          >
            <button className="bg-gray-300 p-2 rounded-xl shadow-sm cursor-pointer">
              {lockdownMode === '0' ? 'Enable' : 'Disable'}
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}
