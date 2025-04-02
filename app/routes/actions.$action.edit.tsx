import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Actions', 'Edit')}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action}
  })

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds, action}
}

export const action = async ({params, request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const icon = formData.get('icon') as string | undefined
  const action = formData.get('action') as string | undefined
  const sound = formData.get('sound') as string | undefined

  invariant(name)
  invariant(icon)
  invariant(action)
  invariant(sound)

  await prisma.action.update({
    where: {id: params.action},
    data: {name, icon, action, audioId: sound}
  })

  return redirect(`/actions/${params.action}`)
}

const AddAction = () => {
  const {sounds, action} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title={`Edit ${action.name}`}>
      <form method="post">
        <FormElement
          label="Name"
          helperText="The name of the action as it will appear on the screens"
        >
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={action.name}
          />
        </FormElement>
        <FormElement
          label="Icon"
          helperText="An Emoji to use as the actions icon. Be aware that Emojis render differently on the RPi screen."
        >
          <input
            name="icon"
            className={INPUT_CLASSES}
            defaultValue={action.icon}
          />
        </FormElement>
        <FormElement
          label="Type"
          helperText="Broadcast runs a broadcast to the supplied zone. Lockdown triggers a system wide lockdown."
        >
          <select
            name="action"
            className={INPUT_CLASSES}
            defaultValue={action.action}
          >
            <option value="broadcast">Broadcast</option>
            <option value="lockdown">Lockdown Toggle</option>
          </select>
        </FormElement>
        <FormElement
          label="Sound"
          helperText="When Broadcasting which sound should be used?"
        >
          <select
            name="sound"
            className={INPUT_CLASSES}
            defaultValue={action.audioId!}
          >
            {sounds.map(({id, name}) => {
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
                navigate(`/actions/${action.id}`)
              },
              color: 'bg-stone-200'
            },
            {label: 'Edit', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddAction
