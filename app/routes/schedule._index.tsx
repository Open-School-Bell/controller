import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {Link, useLoaderData, useNavigate} from '@remix-run/react'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, Actions} from '~/lib/ui'
import {useStatefulLocalStorage} from '~/lib/hooks/use-local-storage'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'schedule.metaTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const schedules = await prisma.schedule.findMany({
    orderBy: {time: 'asc'},
    include: {zone: true, audio: true}
  })

  const days = await prisma.dayType.findMany({
    orderBy: {name: 'asc'}
  })

  return {schedules, days}
}

const Schedule = () => {
  const {schedules, days} = useLoaderData<typeof loader>()
  const [day, setDay] = useStatefulLocalStorage<string>('day', '_')
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('schedule.pageTitle')}>
      <select
        className={INPUT_CLASSES}
        onChange={e => {
          setDay(e.target.value)
        }}
        value={day}
      >
        <option value="_">{t('schedule.defaultOption')}</option>
        {days.map(({id, name}) => {
          return (
            <option key={id} value={id}>
              {name}
            </option>
          )
        })}
      </select>
      <table className="box-table mb-4">
        <thead>
          <tr>
            <th className="p-2">{t('schedule.table.time')}</th>
            <th className="p-2">{t('calendar.weekdays.monday')}</th>
            <th className="p-2">{t('calendar.weekdays.tuesday')}</th>
            <th className="p-2">{t('calendar.weekdays.wednesday')}</th>
            <th className="p-2">{t('calendar.weekdays.thursday')}</th>
            <th className="p-2">{t('calendar.weekdays.friday')}</th>
            <th className="p-2">{t('calendar.weekdays.saturday')}</th>
            <th className="p-2">{t('calendar.weekdays.sunday')}</th>
            <th className="p-2">{t('schedule.table.zone')}</th>
            <th className="p-2">{t('schedule.table.sound')}</th>
            <th className="p-2">{t('schedule.table.count')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schedules
            .filter(({dayTypeId}) => {
              return dayTypeId === (day === '_' ? null : day)
            })
            .map(({id, time, weekDays, zone, audio, count}) => {
              const days = weekDays.split(',')

              return (
                <tr key={id}>
                  <td>
                    <Link to={`/schedule/${id}`}>{time}</Link>
                  </td>
                  <td className="text-center">
                    {days.includes('1') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('2') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('3') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('4') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('5') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('6') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">
                    {days.includes('7') ? '✔️' : '❌'}
                  </td>
                  <td className="text-center">{zone.name}</td>
                  <td className="text-center">
                    <Link to={`/sounds/${audio.id}`}>{audio.name}</Link>
                  </td>
                  <td className="text-center">{count}</td>
                  <td className="text-center">
                    <form method="post" action={`/schedule/${id}/delete`}>
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
      <Actions
        actions={[
          {
            label: t('schedule.addButton'),
            color: 'bg-green-300',
            onClick: () => navigate('/schedule/add')
          }
        ]}
      />
    </Page>
  )
}

export default Schedule
