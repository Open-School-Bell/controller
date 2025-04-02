import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Actions')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})

  return {actions}
}

const ActionsPage = () => {
  const {actions} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title={`Actions (${actions.length})`}>
      <div className="box mb-4">
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
                  <td className="text-center">
                    <Link to={`/actions/${id}`}>{name}</Link>
                  </td>
                  <td className="text-center">{action}</td>
                  <td className="text-center">
                    <form method="post" action={`/actions/${id}/delete`}>
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Actions
        actions={[
          {
            label: 'Add Action',
            color: 'bg-green-300',
            onClick: () => navigate('/actions/add')
          }
        ]}
      />
    </Page>
  )
}

export default ActionsPage
