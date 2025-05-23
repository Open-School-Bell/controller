import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useActionData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {checkSession} from '~/lib/session'
import {getPrisma} from '~/lib/prisma.server'
import {broadcast} from '~/lib/broadcast.server'
import {Actions, Page} from '~/lib/ui'
import {pageTitle} from '~/lib/utils'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast', 'Finished!')}]
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const sound = formData.get('sound') as string | undefined
  const zone = formData.get('zone') as string | undefined
  const desktopGroup = formData.get('desktopGroup') as string | undefined
  const count = formData.get('count') as string | undefined

  invariant(sound)
  invariant(zone)
  invariant(desktopGroup)
  invariant(count)

  if (zone !== '_') {
    await broadcast(zone, sound, parseInt(count))
  }
  if (desktopGroup !== '_') {
    const audio = await prisma.audio.findFirstOrThrow({where: {id: sound}})

    const playData = JSON.stringify({
      fileName: audio.fileName,
      times: parseInt(count),
      triggerTime: new Date().toJSON()
    })

    await prisma.desktopAlertGroup.update({
      where: {id: desktopGroup},
      data: {playData}
    })
  }

  return {sound, zone, desktopGroup, count}
}

const BroadcastFinish = () => {
  const data = useActionData<typeof action>()
  const navigate = useNavigate()

  if (!data) {
    return <div>Error</div>
  }

  const {sound, zone, desktopGroup, count} = data

  return (
    <Page title="Broadcast">
      <div className="box mb-4">Broadcast Sent!</div>
      <form method="post">
        <input type="hidden" name="sound" value={sound} />
        <input type="hidden" name="zone" value={zone} />
        <input type="hidden" name="desktopGroup" value={desktopGroup} />
        <input type="hidden" name="count" value={count} />
        <Actions
          actions={[
            {
              label: 'Start Again',
              color: 'bg-blue-300',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {label: 'Re-Broadcast', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default BroadcastFinish
