import {type ActionFunctionArgs} from '@remix-run/node'

import {getPrisma} from '~/lib/prisma.server'
import {triggerAction} from '~/lib/trigger-action.server'

export const action = async ({request, params}: ActionFunctionArgs) => {
  const prisma = getPrisma()

  const webhook = await prisma.webhook.findFirst({
    where: {slug: params.hook},
    include: {action: true}
  })

  if (!webhook) {
    return {error: `Hook "${params.hook}" not found.`}
  }

  const {key, zone} = (await request.json()) as {key?: string; zone?: string}

  if (!key || key !== webhook.key) {
    return {error: 'Bad Key Provided'}
  }

  if (!zone) {
    return {error: 'No zone provided.'}
  }

  let response = {status: 'ok'}

  await triggerAction(webhook.action, zone, `Webhook: ${params.hook}`, {
    onMissingZone: () => {
      response = {status: 'zone not found'}
    }
  })

  return Response.json(response)
}
