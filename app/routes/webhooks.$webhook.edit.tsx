import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle, makeKey} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Webhooks', 'Add')}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const webhook = await prisma.webhook.findFirstOrThrow({
    where: {id: params.webhook}
  })

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})

  return {actions, webhook}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const slug = formData.get('slug') as string | undefined
  const action = formData.get('action') as string | undefined

  invariant(slug)
  invariant(action)

  const key = makeKey()

  const newWebhook = await prisma.webhook.update({
    where: {id: params.webhook},
    data: {slug, key, actionId: action}
  })

  return redirect(`/webhooks/${newWebhook.id}`)
}

const EditWebhook = () => {
  const {actions, webhook} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Edit Webhook">
      <form method="post">
        <FormElement
          label="Slug"
          helperText="The name of the action as it will appear on the screens"
        >
          <input
            name="slug"
            className={INPUT_CLASSES}
            defaultValue={webhook.slug}
          />
        </FormElement>
        <FormElement
          label="Action"
          helperText="When triggered which action should be run?"
        >
          <select
            name="action"
            className={INPUT_CLASSES}
            defaultValue={webhook.actionId}
          >
            {actions.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              onClick: e => {
                e.preventDefault()
                navigate('/webhooks')
              },
              color: 'bg-stone-200'
            },
            {label: 'Add', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default EditWebhook
