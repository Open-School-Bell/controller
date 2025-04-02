import {type LoaderFunctionArgs, type MetaFunction} from '@remix-run/node'
import {Link, useNavigate, useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'

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
  const navigate = useNavigate()

  return (
    <Page title={`Desktop Groups (${desktopGroups.length})`}>
      <div className="box mb-4">
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
      </div>
      <Actions
        actions={[
          {
            label: 'Add Desktop Group',
            color: 'bg-green-300',
            onClick: () => navigate('/desktop-groups/add')
          }
        ]}
      />
    </Page>
  )
}

export default DesktopGroups
