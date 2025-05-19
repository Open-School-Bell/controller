import {type ActionFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {trigger} from '~/lib/trigger'

export const action = async ({params}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action}
  })

  await trigger(`Deleted action: ${action.name}`, 'deleteAction')

  await prisma.action.delete({where: {id: params.action}})

  return redirect('/actions')
}
