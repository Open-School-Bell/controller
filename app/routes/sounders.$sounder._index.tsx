import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {format} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {getSetting} from '~/lib/settings.server'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'
import {useLivePageData} from '~/lib/hooks/use-live-data'

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  const {messages} = getRootI18n(matches)
  const name = data
    ? data.sounder.name
    : translate(messages, 'sounders.detail.metaFallback')

  return [{title: pageTitle(translate(messages, 'sounders.metaTitle'), name)}]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder},
    include: {
      zones: {include: {zone: true}},
      logs: {orderBy: {time: 'desc'}, take: 10}
    }
  })

  const zones = await prisma.zone.findMany({
    orderBy: {name: 'asc'},
    where: {id: {notIn: sounder.zones.map(({zoneId}) => zoneId)}}
  })

  const enrollUrl = await getSetting('enrollUrl')

  return {sounder, zones, enrollUrl}
}

const Sounder = () => {
  const {sounder, zones, enrollUrl} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()
  const screenLabel = sounder.screen ? t('common.yes') : t('common.no')
  const ringerPinLabel =
    sounder.ringerPin === 0
      ? t('sounders.detail.ringerPin.none')
      : String(sounder.ringerPin)

  useLivePageData()

  return (
    <Page title={sounder.name}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="box">
          <h2>{t('sounders.detail.infoTitle')}</h2>
          <p>
            {t('sounders.detail.ipLabel')}: {sounder.ip}
          </p>
          <p>
            {t('sounders.detail.screenLabel')}: {screenLabel}
          </p>
          <p>
            {t('sounders.detail.ringerPinLabel')}: {ringerPinLabel}
          </p>
          {sounder.enrolled ? (
            <form method="post" action={`/sounders/${sounder.id}/reset`}>
              <button className={`${INPUT_CLASSES} bg-red-300 mt-2`}>
                {t('sounders.detail.resetButton')}
              </button>
            </form>
          ) : (
            <>
              <p>
                {t('sounders.detail.keyLabel')}: {sounder.key}
              </p>
              <div className="bg-gray-300 rounded-md p-2">
                <pre>
                  sounder --enroll {sounder.key} --controller {enrollUrl}
                </pre>
              </div>
            </>
          )}
        </div>
        <div className="box">
          <h2>{t('sounders.detail.zonesTitle')}</h2>
          <ul className="mb-2">
            {sounder.zones.map(({id, zone}) => {
              return (
                <li key={zone.id}>
                  <form
                    action={`/sounders/${sounder.id}/remove-from-zone`}
                    method="post"
                  >
                    {zone.name} <button className="cursor-pointer">🗑️</button>
                    <input type="hidden" name="sounderZone" value={id} />
                  </form>
                </li>
              )
            })}
          </ul>
          <form method="post" action={`/sounders/${sounder.id}/add-to-zone`}>
            <select name="zone" className={INPUT_CLASSES}>
              {zones.map(({id, name}) => {
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </select>
            <input
              type="submit"
              value={t('sounders.detail.addToZone')}
              className={`${INPUT_CLASSES} mt-2 bg-green-300`}
            />
          </form>
        </div>
        <div className="col-span-2 box">
          <h2>{t('sounders.detail.logTitle')}</h2>
          <table className="box-table">
            <thead>
              <tr>
                <th>{t('log.columns.time')}</th>
                <th>{t('log.columns.message')}</th>
              </tr>
            </thead>
            <tbody>
              {sounder.logs.map(({id, message, time}) => {
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
            label: t('buttons.detail.logButton'),
            color: 'bg-blue-100',
            onClick: () => {
              window.location.href = `/sounders/${sounder.id}/log`
            }
          },
          {
            label: t('sounders.detail.editButton'),
            color: 'bg-blue-300',
            onClick: () => navigate(`/sounders/${sounder.id}/edit`)
          }
        ]}
      />
    </Page>
  )
}

export default Sounder
