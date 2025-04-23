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
  return [{title: pageTitle('Webhooks')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const webhooks = await prisma.webhook.findMany({orderBy: {slug: 'asc'}})

  return {webhooks}
}

const WebhooksPage = () => {
  const {webhooks} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title={`Webhooks (${webhooks.length})`}>
      <div className="box mb-4">
        <table className="box-table">
          <thead>
            <tr>
              <th>Webhook</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map(({id, slug}) => {
              return (
                <tr key={id}>
                  <td className="text-center">
                    <Link to={`/webhooks/${id}`}>{slug}</Link>
                  </td>
                  <td className="text-center">
                    <form method="post" action={`/webhooks/${id}/delete`}>
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
            label: 'Add Webook',
            color: 'bg-green-300',
            onClick: () => navigate('/webhooks/add')
          }
        ]}
      />
    </Page>
  )
}

export default WebhooksPage
