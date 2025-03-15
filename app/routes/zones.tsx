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
  return [{title: pageTitle('Zones')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const zones = await prisma.zone.findMany({
    include: {sounders: true, schedules: true},
    orderBy: {name: 'asc'}
  })

  return {zones}
}

const Zones = () => {
  const {zones} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="box">
        <h1>Zones ({zones.length})</h1>
        <table className="box-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Sounders</th>
              <th>Schedules</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {zones.map(({id, name, sounders, schedules}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/zones/${id}`}>{name}</Link>
                  </td>
                  <td className="text-center">{sounders.length}</td>
                  <td className="text-center">{schedules.length}</td>
                  <td>
                    <form method="post" action={`/zones/${id}/delete`}>
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Link to="/zones/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Zones
