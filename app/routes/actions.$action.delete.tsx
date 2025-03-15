import {type ActionFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({params}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  await prisma.action.delete({where: {id: params.action}})

  return redirect('/actions')
}
