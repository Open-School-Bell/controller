import {type LoaderFunctionArgs} from '@remix-run/node'
import {Outlet, useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})

  return {zones}
}

const Zones = () => {
  const {zones} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h1>Zones ({zones.length})</h1>
        <ul>
          {zones.map(({id, name}) => {
            return (
              <li key={id}>
                <Link to={`/zones/${id}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
        <Link to="/zones/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Zones
