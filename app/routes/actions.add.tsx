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
  return [{title: pageTitle('Actions', 'Add')}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

export const action = async ({request}: ActionFunctionArgs) => {
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

  const newAction = await prisma.action.create({
    data: {name, icon, action, audioId: sound}
  })

  return redirect(`/actions/${newAction.id}`)
}

const AddAction = () => {
  const {sounds} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Add Action">
      <form method="post">
        <FormElement
          label="Name"
          helperText="The name of the action as it will appear on the screens"
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="Icon"
          helperText="An Emoji to use as the actions icon. Be aware that Emojis render differently on the RPi screen."
        >
          <input name="icon" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="Type"
          helperText="Broadcast runs a broadcast to the supplied zone. Lockdown triggers a system wide lockdown."
        >
          <select name="action" className={INPUT_CLASSES}>
            <option value="broadcast">Broadcast</option>
            <option value="lockdown">Lockdown Toggle</option>
          </select>
        </FormElement>
        <FormElement
          label="Sound"
          helperText="When Broadcasting which sound should be used?"
        >
          <select name="sound" className={INPUT_CLASSES}>
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
                navigate('/actions')
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

export default AddAction
