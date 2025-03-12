import {type LoaderFunctionArgs, redirect} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action}
  })

  return {action}
}

const Action = () => {
  const {action} = useLoaderData<typeof loader>()

  return (
    <div>
      <h1>{action.name}</h1>
    </div>
  )
}

export default Action
