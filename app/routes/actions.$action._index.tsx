import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, Link, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {SequenceViewer} from '~/lib/sequence-builder'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'actions.title'))}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const action = await prisma.action.findFirstOrThrow({
    where: {id: params.action}
  })

  const sounds = await prisma.audio.findMany({orderBy: {name: 'asc'}})

  return {action, sounds}
}

const Action = () => {
  const {action, sounds} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()
  const typeLabels: Record<string, string> = {
    broadcast: t('actions.types.broadcast'),
    lockdown: t('actions.types.lockdown')
  }

  return (
    <Page title={action.name}>
      <div className="box mb-4">
        <p>
          {t('actions.detail.icon')}: {action.icon}
        </p>
        <p>
          {t('actions.detail.type')}:{' '}
          {typeLabels[action.action] ?? action.action}
        </p>
        <p>
          {t('actions.detail.pin')}: {action.controlPin}
        </p>
      </div>
      <SequenceViewer
        sounds={sounds}
        label={t('actions.detail.sequence.label')}
        queue={action.data === '' ? [] : JSON.parse(action.data)}
      />
      <Actions
        actions={[
          {
            label: t('button.back'),
            color: 'bg-stone-200',
            onClick: () => navigate('/actions')
          },
          {
            label: t('button.edit'),
            color: 'bg-blue-300',
            onClick: () => navigate(`/actions/${action.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Action
