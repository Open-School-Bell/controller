import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {makeKey, INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Sounders', 'Add')}]
}

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
  const ip = formData.get('ip') as string | undefined

  invariant(name)
  invariant(ip)

  const key = makeKey()

  const sounder = await prisma.sounder.create({data: {name, key}})

  return redirect(`/sounders/${sounder.id}`)
}

const AddSounder = () => {
  return (
    <div className="box">
      <h2>Add Sounder</h2>
      <form method="post">
        <label>
          Name
          <input name="name" className={INPUT_CLASSES} />
        </label>
        <label>
          IP
          <input name="ip" className={INPUT_CLASSES} />
        </label>
        <input
          type="submit"
          value="Add"
          className={`${INPUT_CLASSES} mt-2 bg-green-300`}
        />
      </form>
    </div>
  )
}

export default AddSounder
