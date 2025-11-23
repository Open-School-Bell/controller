import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Page, FormElement, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction<typeof loader> = ({data, matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'buttons.metaTitle'),
        data
          ? translate(messages, 'buttons.edit.metaTitle', {
              name: data.button.name
            })
          : translate(messages, 'buttons.edit.metaTitle', {name: ''})
      )
    }
  ]
}

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const actions = await prisma.action.findMany({orderBy: {name: 'asc'}})
  const zones = await prisma.zone.findMany({orderBy: {name: 'asc'}})
  const button = await prisma.actionButton.findFirstOrThrow({
    where: {id: params.button}
  })

  return {actions, button, zones}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const ip = formData.get('ip') as string | undefined
  const action = formData.get('action') as string | undefined
  const zone = formData.get('zone') as string | undefined
  const ledPin = formData.get('ledpin') as string | undefined
  const buttonPin = formData.get('buttonpin') as string | undefined
  const holdDuration = formData.get('holdduration') as string | undefined
  const cancelDuration = formData.get('cancelduration') as string | undefined

  invariant(name)
  invariant(ip)
  invariant(action)
  invariant(zone)
  invariant(ledPin)
  invariant(buttonPin)
  invariant(holdDuration)
  invariant(cancelDuration)

  const button = await prisma.actionButton.update({
    where: {id: params.button},
    data: {
      name,
      ip,
      actionId: action,
      zoneId: zone,
      ledPin: parseInt(ledPin),
      buttonPin: parseInt(buttonPin),
      holdDuration: parseInt(holdDuration),
      cancelDuration: parseInt(cancelDuration)
    }
  })

  return redirect(`/buttons/${button.id}`)
}

const EditButton = () => {
  const {actions, button, zones} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('buttons.edit.pageTitle', {name: button.name})}>
      <form method="post">
        <FormElement
          label={t('buttons.form.name.label')}
          helperText={t('buttons.form.name.helper')}
        >
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={button.name}
          />
        </FormElement>
        <FormElement
          label={t('buttons.form.ip.label')}
          helperText={t('buttons.form.ip.helper')}
        >
          <input name="ip" className={INPUT_CLASSES} defaultValue={button.ip} />
        </FormElement>
        <FormElement
          label={t('buttons.form.action.label')}
          helperText={t('buttons.form.action.helper')}
        >
          <select
            name="action"
            className={INPUT_CLASSES}
            defaultValue={button.actionId}
          >
            {actions.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <FormElement
          label={t('buttons.form.zone.label')}
          helperText={t('buttons.form.zone.helper')}
        >
          <select
            name="zone"
            className={INPUT_CLASSES}
            defaultValue={button.zoneId ? button.zoneId : ''}
          >
            {zones.map(({id, name}) => {
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        </FormElement>
        <FormElement
          label={t('buttons.form.ledPin.label')}
          helperText={t('buttons.form.ledPin.helper')}
        >
          <input
            name="ledpin"
            className={INPUT_CLASSES}
            defaultValue={button.ledPin}
            type="number"
          />
        </FormElement>
        <FormElement
          label={t('buttons.form.buttonPin.label')}
          helperText={t('buttons.form.buttonPin.helper')}
        >
          <input
            name="buttonpin"
            className={INPUT_CLASSES}
            defaultValue={button.buttonPin}
            type="number"
          />
        </FormElement>
        <FormElement
          label={t('buttons.form.holdDuration.label')}
          helperText={t('buttons.form.holdDuration.helper')}
        >
          <input
            name="holdduration"
            className={INPUT_CLASSES}
            defaultValue={button.holdDuration}
            type="number"
          />
        </FormElement>
        <FormElement
          label={t('buttons.form.cancelDuration.label')}
          helperText={t('buttons.form.cancelDuration.helper')}
        >
          <input
            name="cancelduration"
            className={INPUT_CLASSES}
            defaultValue={button.cancelDuration}
            type="number"
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/buttons')
              }
            },
            {label: t('buttons.edit.submit'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default EditButton
