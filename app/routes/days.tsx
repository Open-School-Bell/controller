import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {Outlet, useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Days')}]
}

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})

  return {days}
}

const Days = () => {
  const {days} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-4 gap-8">
      <div className="border border-gray-200 p-2">
        <h1>Days ({days.length})</h1>
        <ul>
          {days.map(({id, name}) => {
            return (
              <li key={id}>
                <Link to={`/days/${id}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
        <Link to="/days/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Days
