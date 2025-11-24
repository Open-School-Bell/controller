import {type ActionFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {makeKey} from '~/lib/utils'
import {checkSession} from '~/lib/session'

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirstOrThrow({
    where: {id: params.button}
  })

  await prisma.actionButton.update({
    where: {id: button.id},
    data: {enrolled: false, key: makeKey()}
  })

  return redirect(`/buttons/${button.id}`)
}
