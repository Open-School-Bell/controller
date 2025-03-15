import {type LoaderFunctionArgs, redirect} from '@remix-run/node'
import {useLoaderData, Link} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action},
    include: {audio: true}
  })

  return {action}
}

const Action = () => {
  const {action} = useLoaderData<typeof loader>()

  return (
    <div className="box">
      <h1>{action.name}</h1>
      <Link to={`/actions/${action.id}/edit`}>Edit</Link>
      <p>Icon: {action.icon}</p>
      <p>Type: {action.action}</p>
      <p>
        Sound:{' '}
        <Link to={`/sounds/${action.audioId}`}>{action.audio!.name}</Link>
      </p>
    </div>
  )
}

export default Action
