import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES} from '~/lib/utils'

export const loader = async ({}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {sounds}
}

export const action = async ({request}: ActionFunctionArgs) => {
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

  return (
    <div>
      <h2>Add Action</h2>
      <form method="post">
        <label>
          Name
          <input name="name" className={INPUT_CLASSES} />
        </label>
        <label>
          Icon
          <input name="icon" className={INPUT_CLASSES} />
        </label>
        <label>
          Type
          <select name="action" className={INPUT_CLASSES}>
            <option value="broadcast">Broadcast</option>
            <option value="lockdown">Lockdown Toggle</option>
          </select>
        </label>
        <label>
          Type
          <select name="sound" className={INPUT_CLASSES}>
            {sounds.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </label>
        <input type="submit" value="Add" />
      </form>
    </div>
  )
}

export default AddAction
