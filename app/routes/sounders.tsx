import {type LoaderFunctionArgs, redirect} from '@remix-run/node'
import {Outlet, useLoaderData, Link} from '@remix-run/react'

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

const Sounders = () => {
  const {sounders} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h1>Sounders ({sounders.length})</h1>
        <ul>
          {sounders.map(({id, name}) => {
            return (
              <li key={id}>
                <Link to={`/sounders/${id}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
        <Link to="/sounders/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Sounders
