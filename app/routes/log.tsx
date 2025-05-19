import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {format} from 'date-fns'

import {pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page} from '~/lib/ui'
import {getPrisma} from '~/lib/prisma.server'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Log')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const logs = await prisma.log.findMany({orderBy: {time: 'desc'}})

  return {logs}
}

const Log = () => {
  const {logs} = useLoaderData<typeof loader>()

  return (
    <Page title="Log">
      <table className="box-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(({id, message, time}) => {
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
    </Page>
  )
}

export default Log
