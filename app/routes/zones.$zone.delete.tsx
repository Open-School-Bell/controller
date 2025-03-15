import {type ActionFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const action = async ({params}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  await prisma.zoneSounder.deleteMany({where: {zoneId: params.zone}})
  await prisma.schedule.deleteMany({where: {zoneId: params.zone}})
  await prisma.zone.delete({where: {id: params.zone}})

  return redirect('/zones')
}
