import {
  redirect,
  type ActionFunctionArgs,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type MetaFunction,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'
import {parseFile} from 'music-metadata'

import {getPrisma} from '~/lib/prisma.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {Page, FormElement, Actions} from '~/lib/ui'
import {updateSounders} from '~/lib/update-sounders.server'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

const {rename} = fs.promises

export const meta: MetaFunction<typeof loader> = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'sounds.metaTitle'),
        translate(messages, 'sounds.add.metaTitle')
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

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 50_000_000,
      directory: 'public/sounds/',
      file: ({filename}) => {
        return filename
      }
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const name = formData.get('name') as string | undefined
  const ringerWire = formData.get('ringer-wire') as string | undefined
  const fileData = formData.get('file') as any as {filepath: string} | undefined

  invariant(name)
  invariant(fileData)

  const sound = await prisma.audio.create({
    data: {
      name,
      fileName: path.basename(fileData.filepath),
      ringerWire: ringerWire ? ringerWire : ''
    }
  })

  await rename(
    path.join(
      process.cwd(),
      'public',
      'sounds',
      path.basename(fileData.filepath)
    ),
    path.join(
      process.cwd(),
      'public',
      'sounds',
      `${sound.id}${path.extname(fileData.filepath)}`
    )
  )

  const meta = await parseFile(
    path.join(
      process.cwd(),
      'public',
      'sounds',
      `${sound.id}${path.extname(fileData.filepath)}`
    )
  )

  await prisma.audio.update({
    where: {id: sound.id},
    data: {
      fileName: `${sound.id}${path.extname(fileData.filepath)}`,
      duration: meta.format.duration,
      audioContainer: meta.format.container
    }
  })

  await updateSounders()

  return redirect(`/sounds/${sound.id}`)
}

const AddSound = () => {
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <Page title={t('sounds.add.pageTitle')}>
      <form method="post" encType="multipart/form-data">
        <FormElement
          label={t('sounds.form.name.label')}
          helperText={t('sounds.form.name.helper')}
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('sounds.form.file.label')}
          helperText={t('sounds.form.file.helper')}
        >
          <input
            name="file"
            type="file"
            accept="audio/mp3"
            className={INPUT_CLASSES}
          />
        </FormElement>
        <FormElement
          label={t('sounds.form.ringer.label')}
          helperText={t('sounds.form.ringer.helper')}
        >
          <input name="ringer-wire" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: t('button.cancel'),
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/sounds')
              }
            },
            {label: t('sounds.add.submit'), color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSound
