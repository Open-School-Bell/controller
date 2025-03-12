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

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

const Sounds = () => {
  const {sounds} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h1>Sounds ({sounds.length})</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sounds.map(({id, name}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/sounds/${id}`}>{name}</Link>
                  </td>
                  <td>
                    <Link to={`/sounds/${id}/delete`}>🗑️</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Link to="/sounds/add">Add</Link>
        <Link to="/sounds/add-tts">Add TTS</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Sounds
