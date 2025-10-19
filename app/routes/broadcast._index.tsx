import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'

import {pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, Page} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'broadcast.pageTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

const Broadcast = () => {
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('broadcast.pageTitle')} helpLink="/guides/broadcast/">
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `0`}}
        />
      </div>
      <div>
        <div className="box mb-4">
          {t('broadcast.description')}
        </div>
        <Actions
          actions={[
            {
              label: t('broadcast.buildButton'),
              color: 'bg-blue-300',
              onClick: () => navigate('/broadcast/builder')
            }
          ]}
        />
      </div>
    </Page>
  )
}

export default Broadcast
