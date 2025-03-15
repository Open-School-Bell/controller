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
      <div className="box">
        <h1>Actions ({actions.length})</h1>
        <table className="box-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actions.map(({id, name, action}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/actions/${id}`}>{name}</Link>
                  </td>
                  <td>{action}</td>
                  <td>
                    <form method="post" action={`/actions/${id}/delete`}>
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Link to="/actions/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default Actions
