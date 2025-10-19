import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useLoaderData, useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {Page, FormElement, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({data, matches}) => {
  const {messages} = getRootI18n(matches)
  const name = data?.zone.name ?? translate(messages, 'zones.detail.metaFallback')
  return [
    {
      title: pageTitle(
        translate(messages, 'zones.metaTitle'),
        translate(messages, 'zones.edit.metaTitle', {name})
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

  const zone = await prisma.zone.findFirstOrThrow({where: {id: params.zone}})

  return {zone}
}

export const action = async ({request, params}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const zone = await prisma.zone.update({
    where: {id: params.zone},
    data: {name}
  })

  return redirect(`/zones/${zone.id}`)
}

const AddZone = () => {
  const {zone} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('zones.edit.pageTitle', {name: zone.name})}>
      <form method="post">
        <FormElement
          label={t('zones.form.name.label')}
          helperText={t('zones.form.name.helper')}
        >
          <input
            name="name"
            className={INPUT_CLASSES}
            defaultValue={zone.name}
          />
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate(`/zones/${zone.id}`)
              }
            },
            {label: t('button.saveChanges'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddZone
