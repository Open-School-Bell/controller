import {type ActionFunctionArgs, redirect} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const action = async ({params, request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const sounderZone = formData.get('sounderZone') as string | undefined

  invariant(sounderZone)

  await prisma.zoneSounder.delete({
    where: {id: sounderZone}
  })

  return redirect(`/sounders/${params.sounder}`)
}
