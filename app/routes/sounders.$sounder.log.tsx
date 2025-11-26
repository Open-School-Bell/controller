import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder},
    include: {
      logs: {orderBy: {time: 'desc'}}
    }
  })

  return new Response(
    sounder.logs
      .map(({time, message}) => {
        return `${time}: ${message}`
      })
      .join(`\r\n`)
  )
}
