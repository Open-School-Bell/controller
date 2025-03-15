import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'

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

  return (
    <div className="box">
      <h2>Edit Action</h2>
      <form method="post">
        <label>
          Name
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={action.name}
          />
        </label>
        <label>
          Icon
          <input
            name="icon"
            className={INPUT_CLASSES}
            defaultValue={action.icon}
          />
        </label>
        <label>
          Type
          <select
            name="action"
            className={INPUT_CLASSES}
            defaultValue={action.action}
          >
            <option value="broadcast">Broadcast</option>
            <option value="lockdown">Lockdown Toggle</option>
          </select>
        </label>
        <label>
          Sound
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
        </label>
        <input
          type="submit"
          value="Edit"
          className={`${INPUT_CLASSES} bg-green-300 mt-2`}
        />
      </form>
    </div>
  )
}

export default AddAction
