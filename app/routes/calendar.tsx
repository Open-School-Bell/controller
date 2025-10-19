import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate, Link} from '@remix-run/react'
import {useState} from 'react'
import {numberArray} from '@arcath/utils'
import {subDays} from 'date-fns'

import {pageTitle} from '~/lib/utils'
import {Page, Actions} from '~/lib/ui'
import {checkSession} from '~/lib/session'
import {getPrisma} from '~/lib/prisma.server'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [{title: pageTitle(translate(messages, 'calendar.metaTitle'))}]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const dayAssigments = await prisma.dayTypeAssignment.findMany({
    where: {date: {gt: subDays(new Date(), 1)}},
    include: {dayType: true},
    orderBy: {date: 'asc'}
  })

  const days = await prisma.dayType.findMany({orderBy: {name: 'asc'}})

  return {dayAssigments, days}
}

const MONTH_KEYS: readonly string[] = [
  'calendar.months.january',
  'calendar.months.february',
  'calendar.months.march',
  'calendar.months.april',
  'calendar.months.may',
  'calendar.months.june',
  'calendar.months.july',
  'calendar.months.august',
  'calendar.months.september',
  'calendar.months.october',
  'calendar.months.november',
  'calendar.months.december'
]

const getStateDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(year, month + 1, 0)

  const daysInMonth = lastDay.getDate()

  return {
    month,
    year,
    startOffset: firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1,
    endOffset: 6 - lastDay.getDay(),
    daysInMonth
  }
}

const dateOrdinal = (locale: string, day: number) => {
  if (locale !== 'en') {
    return ''
  }

  if (day % 100 >= 11 && day % 100 <= 13) {
    return 'th'
  }

  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

const CalendarPage = () => {
  const {t, locale} = useTranslation()
  const [{month, year, startOffset, daysInMonth, endOffset}, setDate] =
    useState(getStateDate())
  const {days, dayAssigments} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const monthLabels = MONTH_KEYS.map(key => t(key))
  const weekdayKeys = [
    'calendar.weekdays.monday',
    'calendar.weekdays.tuesday',
    'calendar.weekdays.wednesday',
    'calendar.weekdays.thursday',
    'calendar.weekdays.friday',
    'calendar.weekdays.saturday',
    'calendar.weekdays.sunday'
  ]
  const weekdays = weekdayKeys.map(key => t(key))

  return (
    <Page
      title={t('calendar.metaTitle')}
      wide
      helpLink="/docs/configuration/calendar/"
    >
      <div className="grid grid-cols-7">
        <button
          className="cursor-pointer"
          onClick={() => {
            setDate(getStateDate(new Date(year, month - 1, 1)))
          }}
        >
          {t('calendar.previous')}
        </button>
        <div className="col-span-5 text-center font-bold text-3xl pb-2">
          {monthLabels[month]} {year}
        </div>
        <button
          className="text-right cursor-pointer"
          onClick={() => {
            setDate(getStateDate(new Date(year, month + 1, 1)))
          }}
        >
          {t('calendar.next')}
        </button>

        {weekdays.map(weekday => {
          return (
            <div
              key={weekday}
              className="bg-stone-200 font-semibold text-center border border-stone-200"
            >
              {weekday}
            </div>
          )
        })}
        {numberArray(1, startOffset).map(n => {
          return (
            <div className="bg-stone-100 border border-stone-200" key={n} />
          )
        })}
        {numberArray(1, daysInMonth).map(n => {
          const assignments = dayAssigments.filter(({date}) => {
            return (
              date.getFullYear() === year &&
              date.getMonth() === month &&
              date.getDate() === n
            )
          })

          const ordinal = dateOrdinal(locale, n)

          return (
            <div
              className={`border ${assignments.length > 1 ? 'border-red-200' : 'border-stone-200'} min-h-24 p-2`}
              key={n}
            >
              <strong>
                {n}
                {ordinal ? <sup>{ordinal}</sup> : null}
              </strong>
              <p className="mt-3 text-center">
                {assignments.map(({dayType}) => dayType.name).join(', ')}
              </p>
            </div>
          )
        })}
        {numberArray(0, endOffset).map(n => {
          return (
            <div className="bg-stone-100 border border-stone-200" key={n} />
          )
        })}
      </div>
      <div className="box mb-4">
        <h2>{t('calendar.dayTypes')}</h2>
        <table className="box-table">
          <thead>
            <tr>
              <th>{t('calendar.dayTypesTable.day')}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {days.map(({id, name}) => {
              return (
                <tr key={id}>
                  <td>{name}</td>
                  <td className="text-right">
                    <Link to={`/days/${id}/edit`}>✏️</Link>
                  </td>
                  <td>
                    <form method="post" action={`/days/${id}/delete`}>
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Actions
        actions={[
          {
            label: t('calendar.buttons.addDay'),
            color: 'bg-green-300',
            onClick: () => navigate('/days/add')
          },
          {
            label: t('calendar.buttons.manageAssignments'),
            color: 'bg-blue-300',
            onClick: () => navigate('/days/assignments')
          }
        ]}
      />
    </Page>
  )
}

export default CalendarPage
