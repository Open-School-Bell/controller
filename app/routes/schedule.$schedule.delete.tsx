import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  await prisma.schedule.delete({where: {id: params.schedule}})

  return redirect('/schedule')
}
