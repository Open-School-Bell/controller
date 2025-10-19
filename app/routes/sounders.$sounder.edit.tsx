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
        translate(messages, 'sounders.metaTitle'),
        data
          ? translate(messages, 'sounders.edit.metaTitle', {
              name: data.sounder.name
            })
          : translate(messages, 'sounders.edit.metaTitle', {name: ''})
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

  const sounder = await prisma.sounder.findFirstOrThrow({
    where: {id: params.sounder}
  })

  return {sounder}
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
  const ringerPin = formData.get('ringer') as string | undefined
  const screen = formData.get('screen') as string | undefined

  invariant(name)
  invariant(ip)
  invariant(ringerPin)

  const sounder = await prisma.sounder.update({
    where: {id: params.sounder},
    data: {name, ip, ringerPin: parseInt(ringerPin), screen: !!screen}
  })

  return redirect(`/sounders/${sounder.id}`)
}

const EditSounder = () => {
  const {sounder} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('sounders.edit.pageTitle', {name: sounder.name})}>
      <form method="post">
        <FormElement
          label={t('sounders.form.name.label')}
          helperText={t('sounders.form.name.helper')}
        >
          <input
            name="name"
            defaultValue={sounder.name}
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label={t('sounders.form.ip.label')}
          helperText={t('sounders.form.ip.helper')}
        >
          <input
            name="ip"
            defaultValue={sounder.ip}
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label={t('sounders.form.ringer.label')}
          helperText={t('sounders.form.ringer.helper')}
        >
          <input
            name="ringer"
            defaultValue={sounder.ringerPin}
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label={t('sounders.form.screen.label')}
          helperText={t('sounders.form.screen.helper')}
        >
          <input
            type="checkbox"
            defaultChecked={sounder.screen}
            name="screen"
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate(`/sounders/${sounder.id}`)
              }
            },
            {label: t('button.saveChanges'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default EditSounder
