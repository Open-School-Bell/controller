import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type MetaFunction,
  redirect
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant, asyncForEach} from '@arcath/utils'
import {subDays, format, eachDayOfInterval} from 'date-fns'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions, HelperText} from '~/lib/ui'
import {useLocalStorage} from '~/lib/hooks/use-local-storage'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'calendar.metaTitle'),
        translate(messages, 'days.assignments.metaTitle')
      )
    }
  ]
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

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const startDate = formData.get('startDate') as string | undefined
  const endDate = formData.get('endDate') as string | undefined
  const day = formData.get('day') as string | undefined

  invariant(startDate)
  invariant(endDate)
  invariant(day)

  const days = eachDayOfInterval({
    start: new Date(startDate),
    end: new Date(endDate)
  })

  await asyncForEach(days, async date => {
    await prisma.dayTypeAssignment.create({
      data: {date, dayTypeId: day}
    })
  })

  return redirect(`/days/assignments`)
}

const DayAssignments = () => {
  const {dayAssigments, days} = useLoaderData<typeof loader>()
  const [day, setDay] = useLocalStorage<string>('day', days[0].id)
  const [assignmentDate, setAssignmentDate] = useLocalStorage<string>(
    'assignmentDate',
    format(new Date(), 'yyyy-LL-dd')
  )
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-4">
      <Page title={t('days.assignments.title')}>
        <HelperText>{t('days.assignments.helper')}</HelperText>
        <table className="box-table">
          <thead>
            <tr>
              <th>{t('days.assignments.table.date')}</th>
              <th>{t('days.assignments.table.dayType')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dayAssigments.map(({id, dayType, date}) => {
              return (
                <tr key={id}>
                  <td>{format(date, 'dd/MM/yyyy')}</td>
                  <td>{dayType.name}</td>
                  <td className="text-center">
                    <form
                      method="post"
                      action={`/days/assignments/${id}/delete`}
                    >
                      <button className="cursor-pointer">🗑️</button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Page>
      <Page title={t('days.assignments.addTitle')}>
        <form method="post">
          <FormElement
            label={t('days.assignments.form.from.label')}
            helperText={t('days.assignments.form.from.helper')}
          >
            <input
              type="date"
              name="startDate"
              className={INPUT_CLASSES}
              defaultValue={assignmentDate}
              onChange={e => {
                setAssignmentDate(e.target.value)
              }}
            />
          </FormElement>
          <FormElement
            label={t('days.assignments.form.to.label')}
            helperText={t('days.assignments.form.to.helper')}
          >
            <input
              type="date"
              className={INPUT_CLASSES}
              name="endDate"
              defaultValue={assignmentDate}
              onChange={e => {
                setAssignmentDate(e.target.value)
              }}
            />
          </FormElement>
          <FormElement
            label={t('days.assignments.form.day.label')}
            helperText={t('days.assignments.form.day.helper')}
          >
            <select
              className={INPUT_CLASSES}
              name="day"
              defaultValue={day}
              onChange={e => {
                setDay(e.target.value)
              }}
            >
              {days.map(({id, name}) => {
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </select>
          </FormElement>
          <Actions
            actions={[
              {
                label: t('button.cancel'),
                color: 'bg-stone-200',
                onClick: e => {
                  e.preventDefault()
                  navigate('/calendar')
                }
              },
              {
                label: t('days.assignments.addButton'),
                color: 'bg-green-300'
              }
            ]}
          />
        </form>
      </Page>
    </div>
  )
}

export default DayAssignments
