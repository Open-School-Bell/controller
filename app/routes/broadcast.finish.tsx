import {
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useActionData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {checkSession} from '~/lib/session'
import {broadcast} from '~/lib/broadcast.server'
import {Actions, Page} from '~/lib/ui'
import {pageTitle} from '~/lib/utils'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'broadcast.pageTitle'),
        translate(messages, 'broadcast.finish.metaTitle')
      )
    }
  ]
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const formData = await request.formData()

  const queue = formData.get('queue') as string | undefined
  const zone = formData.get('zone') as string | undefined
  //const desktopGroup = formData.get('desktopGroup') as string | undefined

  invariant(queue)
  invariant(zone)
  //invariant(desktopGroup)

  if (zone !== '_') {
    await broadcast(zone, queue)
  }
  /*if (desktopGroup !== '_') {
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
  }*/

  return {queue, zone}
}

const BroadcastFinish = () => {
  const data = useActionData<typeof action>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  if (!data) {
    return <div>{t('common.error')}</div>
  }

  const {queue, zone} = data

  return (
    <Page title={t('broadcast.pageTitle')}>
      <div className="box mb-4">{t('broadcast.finish.message')}</div>
      <form method="post">
        <input type="hidden" name="queue" value={queue} />
        <input type="hidden" name="zone" value={zone} />
        <Actions
          actions={[
            {
              label: t('broadcast.finish.startAgain'),
              color: 'bg-blue-300',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {label: t('broadcast.finish.rebroadcast'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default BroadcastFinish
