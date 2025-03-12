import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

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

  const dayType = await prisma.dayType.create({data: {name}})

  return redirect(`/days/${dayType.id}`)
}

const AddDay = () => {
  return (
    <div>
      <h2>Add Day</h2>
      <form method="post">
        <label>
          Name
          <input
            name="name"
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <input type="submit" value="Add" />
      </form>
    </div>
  )
}

export default AddDay
