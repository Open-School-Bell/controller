import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {Link, Outlet, useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Desktop Groups')}]
}

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const desktopGroups = await prisma.desktopAlertGroup.findMany({
    orderBy: {name: 'asc'}
  })

  return {desktopGroups}
}

const DesktopGroups = () => {
  const {desktopGroups} = useLoaderData<typeof loader>()

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="box">
        <h1>Desktop Groups ({desktopGroups.length})</h1>
        <table className="box-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Key</th>
            </tr>
          </thead>
          <tbody>
            {desktopGroups.map(({id, name, key}) => {
              return (
                <tr key={id}>
                  <td>
                    <Link to={`/desktop-groups/${id}`}>{name}</Link>
                  </td>
                  <td>{key}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Link to="/desktop-groups/add">Add</Link>
      </div>
      <Outlet />
    </div>
  )
}

export default DesktopGroups
