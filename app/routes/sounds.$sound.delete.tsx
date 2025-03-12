import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  await prisma.audio.delete({where: {id: params.sound}})

  return redirect('/sounds')
}
