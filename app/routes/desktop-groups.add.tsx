import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, makeKey} from '~/lib/utils'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const key = makeKey()

  const desktopGroup = await prisma.desktopAlertGroup.create({
    data: {name, key}
  })

  return redirect(`/desktop-groups/${desktopGroup.id}`)
}

const AddDay = () => {
  return (
    <div className="box">
      <h2>Add Desktop Group</h2>
      <form method="post">
        <label>
          Name
          <input name="name" className={INPUT_CLASSES} />
        </label>
        <input
          type="submit"
          value="Add"
          className={`${INPUT_CLASSES} bg-green-300 mt-2`}
        />
      </form>
    </div>
  )
}

export default AddDay
