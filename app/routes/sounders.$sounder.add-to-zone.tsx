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

  const zone = formData.get('zone') as string | undefined

  invariant(zone)

  await prisma.zoneSounder.create({
    data: {sounderId: params.sounder!, zoneId: zone}
  })

  return redirect(`/sounders/${params.sounder}`)
}
