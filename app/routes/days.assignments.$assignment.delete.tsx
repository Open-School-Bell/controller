import {type ActionFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  await prisma.dayTypeAssignment.delete({where: {id: params.assignment}})

  return redirect('/days/assignments')
}
