import {type LoaderFunctionArgs, redirect} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirstOrThrow({
    where: {id: params.button},
    include: {
      logs: {orderBy: {time: 'desc'}}
    }
  })

  return new Response(
    button.logs
      .map(({time, message}) => {
        return `${time}: ${message}`
      })
      .join(`\r\n`)
  )
}
