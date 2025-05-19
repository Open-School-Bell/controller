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
  const outboundWebhooks = await prisma.outboundWebhook.findMany({
    orderBy: {target: 'asc'}
  })

  return {webhooks, outboundWebhooks}
}

const WebhooksPage = () => {
  const {webhooks, outboundWebhooks} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <div>
      <Page
        title={`Inbound Webhooks (${webhooks.length})`}
        helpLink="/docs/configuration/webhooks/"
      >
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
      <Page title={`Outbound Webhooks (${outboundWebhooks.length})`}>
        <div className="box mb-4">
          <table className="box-table">
            <thead>
              <tr>
                <th>Outbound Webhook</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {outboundWebhooks.map(({id, target}) => {
                return (
                  <tr key={id}>
                    <td className="text-center">
                      <Link to={`/webhooks/outbound/${id}`}>{target}</Link>
                    </td>
                    <td className="text-center">
                      <form
                        method="post"
                        action={`/webhooks/outbound/${id}/delete`}
                      >
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
              label: 'Add Outbound Webook',
              color: 'bg-green-300',
              onClick: () => navigate('/webhooks/outbound/add')
            }
          ]}
        />
      </Page>
    </div>
  )
}

export default WebhooksPage
