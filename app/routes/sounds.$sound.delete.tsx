import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const prisma = getPrisma()

  await prisma.audio.delete({where: {id: params.sound}})

  return redirect('/sounds')
}
