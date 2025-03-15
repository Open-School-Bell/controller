import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {Outlet, useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Sounders')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounders = await prisma.sounder.findMany({orderBy: {name: 'asc'}})

  return {sounders}
}

const Sounders = () => {
  const {sounders} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="box">
        <h1>Sounders ({sounders.length})</h1>
        <table className="box-table">
          <thead>
            <tr>
              <th>Sounder</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sounders.map(({id, name}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/sounders/${id}`}>{name}</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Link to="/sounders/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Sounders
