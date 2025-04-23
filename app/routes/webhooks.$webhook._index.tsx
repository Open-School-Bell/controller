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
import {getSetting} from '~/lib/settings.server'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Webhooks')}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const webhook = await prisma.webhook.findFirstOrThrow({
    where: {id: params.webhook},
    include: {action: true}
  })

  const controllerUrl = await getSetting('enrollUrl')

  return {webhook, controllerUrl}
}

const Webhook = () => {
  const {webhook, controllerUrl} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title={webhook.slug}>
      <div className="box mb-4">
        <p>Key: {webhook.key}</p>
        <p>
          Action:{' '}
          <Link to={`/actions/${webhook.actionId}`}>{webhook.action.name}</Link>
        </p>
        <p className="bg-stone-200 p-2 rounded-md">
          curl -H 'Content-Type: application/json' -d '
          {`{"key": "${webhook.key}"}`}' -X POST {controllerUrl}/hook/
          {webhook.slug}
        </p>
        <p>
          If this webhook uses an action that has the type Broadcast, your
          request JSON must include <i>"zone": "ZONE ID"</i>
        </p>
      </div>
      <Actions
        actions={[
          {
            label: 'Back',
            color: 'bg-stone-200',
            onClick: () => navigate('/webhooks')
          },
          {
            label: 'Edit',
            color: 'bg-blue-300',
            onClick: () => navigate(`/webhooks/${webhook.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Webhook
