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

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})

  return {actions}
}

const Actions = () => {
  const {actions} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h1>Actions ({actions.length})</h1>
        <ul>
          {actions.map(({id, name}) => {
            return (
              <li key={id}>
                <Link to={`/actions/${id}`}>{name}</Link>
              </li>
            )
          })}
        </ul>
        <Link to="/actions/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Actions
