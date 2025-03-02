import {type LoaderFunctionArgs} from '@remix-run/node'
import {Outlet, useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

const Sounds = () => {
  const {sounds} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h1>Sounds ({sounds.length})</h1>
        <ul>
          {sounds.map(({id, name}) => {
            return (
              <li key={id}>
                <Link to={`/sounds/${id}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
        <Link to="/sounds/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Sounds
