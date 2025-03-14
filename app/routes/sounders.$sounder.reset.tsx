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

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder}
  })

  await prisma.sounder.update({
    where: {id: sounder.id},
    data: {enrolled: false, key: makeKey()}
  })

  return redirect(`/sounders/${sounder.id}`)
}
