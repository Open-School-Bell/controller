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

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Calendar')}]
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

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
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

const dateOrdinal = (d: number) => {
  return 31 == d || 21 == d || 1 == d
    ? 'st'
    : 22 == d || 2 == d
      ? 'nd'
      : 23 == d || 3 == d
        ? 'rd'
        : 'th'
}

const CalendarPage = () => {
  const [{month, year, startOffset, daysInMonth, endOffset}, setDate] =
    useState(getStateDate())
  const {days, dayAssigments} = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  return (
    <Page title="Calendar" wide>
      <div className="grid grid-cols-7">
        <button
          className="cursor-pointer"
          onClick={() => {
            setDate(getStateDate(new Date(year, month - 1, 1)))
          }}
        >
          {'<< Previous Month'}
        </button>
        <div className="col-span-5 text-center font-bold text-3xl pb-2">
          {MONTHS[month]} {year}
        </div>
        <button
          className="text-right cursor-pointer"
          onClick={() => {
            setDate(getStateDate(new Date(year, month + 1, 1)))
          }}
        >
          {'Next Month >>'}
        </button>

        <div className="bg-stone-200 font-semibold text-center border border-stone-200">
          Monday
        </div>
        <div className="bg-stone-200 font-semibold text-center border border-stone-200">
          Tuesday
        </div>
        <div className="bg-stone-200 font-semibold text-center border border-stone-200">
          Wednesday
        </div>
        <div className="bg-stone-200 font-semibold text-center border border-stone-200">
          Thursday
        </div>
        <div className="bg-stone-200 font-semibold text-center border border-stone-200">
          Friday
        </div>
        <div className="bg-stone-200 font-semibold text-center border border-stone-200">
          Saturday
        </div>
        <div className="bg-stone-200 font-semibold text-center border border-stone-200">
          Sunday
        </div>
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

          return (
            <div
              className={`border ${assignments.length > 1 ? 'border-red-200' : 'border-stone-200'} min-h-24 p-2`}
              key={n}
            >
              <strong>
                {n}
                <sup>{dateOrdinal(n)}</sup>
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
        <h2>Day Types</h2>
        <table className="box-table">
          <thead>
            <tr>
              <th>Day</th>
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
            label: 'Add Day',
            color: 'bg-green-300',
            onClick: () => navigate('/days/add')
          },
          {
            label: 'Manage Assignments',
            color: 'bg-blue-300',
            onClick: () => navigate('/days/assignments')
          }
        ]}
      />
    </Page>
  )
}

export default CalendarPage
