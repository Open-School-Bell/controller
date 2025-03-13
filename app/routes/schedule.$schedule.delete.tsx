import {type ActionFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({params}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  await prisma.schedule.delete({where: {id: params.schedule}})

  return redirect('/schedule')
}
