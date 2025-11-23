import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate, Link} from '@remix-run/react'
import {format} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {getSetting} from '~/lib/settings.server'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  const {messages} = getRootI18n(matches)
  const name = data
    ? data.button.name
    : translate(messages, 'buttons.detail.metaFallback')

  return [{title: pageTitle(translate(messages, 'buttons.metaTitle'), name)}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const button = await prisma.actionButton.findFirstOrThrow({
    where: {id: params.sounder},
    include: {
      action: true,
      zone: true,
      logs: {orderBy: {time: 'desc'}, take: 10}
    }
  })

  const enrollUrl = await getSetting('enrollUrl')

  return {button, enrollUrl}
}

const Sounder = () => {
  const {button, enrollUrl} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={button.name}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="box">
          <h2>{t('buttons.detail.infoTitle')}</h2>
          <p>
            {t('buttons.detail.ipLabel')}: {button.ip}
          </p>
          <p>
            {t('buttons.detail.ledPinLabel')}: {button.ledPin}
          </p>
          <p>
            {t('buttons.detail.buttonPinLabel')}: {button.buttonPin}
          </p>
          <p>
            {t('buttons.detail.holdLabel')}: {button.holdDuration}
          </p>
          <p>
            {t('buttons.detail.cancelLabel')}: {button.cancelDuration}
          </p>
          <p>
            {t('buttons.detail.actionLabel')}:{' '}
            <Link to={`/actions/${button.actionId}`}>{button.action.name}</Link>
          </p>
          <p>
            {t('buttons.detail.zoneLabel')}:{' '}
            <Link to={`/zones/${button.zoneId}`}>
              {button.zone ? button.zone.name : 'None'}
            </Link>
          </p>
          {button.enrolled ? (
            <form method="post" action={`/buttons/${button.id}/reset`}>
              <button className={`${INPUT_CLASSES} bg-red-300 mt-2`}>
                {t('sounders.detail.resetButton')}
              </button>
            </form>
          ) : (
            <>
              <p>
                {t('buttons.detail.keyLabel')}: {button.key}
              </p>
              <div className="bg-gray-300 rounded-md p-2">
                <pre>
                  button --enroll {button.key} --controller {enrollUrl}
                </pre>
              </div>
            </>
          )}
        </div>
        <div className="col-span-2 box">
          <h2>{t('buttons.detail.logTitle')}</h2>
          <table className="box-table">
            <thead>
              <tr>
                <th>{t('log.columns.time')}</th>
                <th>{t('log.columns.message')}</th>
              </tr>
            </thead>
            <tbody>
              {button.logs.map(({id, message, time}) => {
                return (
                  <tr key={id}>
                    <td className="text-center">
                      {format(time, 'dd/MM/yy HH:mm')}
                    </td>
                    <td>{message}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Actions
        actions={[
          {
            label: t('buttons.detail.editButton'),
            color: 'bg-blue-300',
            onClick: () => navigate(`/buttons/${button.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Sounder
