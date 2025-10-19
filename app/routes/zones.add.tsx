import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {Page, FormElement, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'zones.metaTitle'),
        translate(messages, 'zones.add.metaTitle')
      )
    }
  ]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  return {}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const result = await checkSession(request)

  if (!result) {
    return redirect('/login')
  }

  const prisma = getPrisma()

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined

  invariant(name)

  const zone = await prisma.zone.create({data: {name}})

  return redirect(`/zones/${zone.id}`)
}

const AddZone = () => {
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('zones.add.pageTitle')}>
      <form method="post">
        <FormElement
          label={t('zones.form.name.label')}
          helperText={t('zones.form.name.helper')}
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/zones')
              }
            },
            {label: t('zones.add.submit'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddZone
