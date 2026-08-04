import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'
import {finished} from 'stream/promises'
import {Readable} from 'stream'
import {parseFile} from 'music-metadata'

import {getPrisma} from '~/lib/prisma.server'
import {updateSounders} from '~/lib/update-sounders.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {getSetting} from '~/lib/settings.server'
import {Page, FormElement, Actions} from '~/lib/ui'
import {useTranslation} from '~/lib/i18n'
import {translate} from '~/lib/i18n.shared'
import {getRootI18n} from '~/lib/i18n.meta'

export const meta: MetaFunction<typeof loader> = ({matches}) => {
  const {messages} = getRootI18n(matches)
  return [
    {
      title: pageTitle(
        translate(messages, 'sounds.metaTitle'),
        translate(messages, 'sounds.addTts.metaTitle')
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

  const speed = await getSetting('ttsSpeed')

  const formData = await request.formData()

  const name = formData.get('name') as string | undefined
  const ringerWire = formData.get('ringer-wire') as string | undefined
  const tts = formData.get('tts') as string | undefined

  invariant(name)
  invariant(tts)

  const sound = await prisma.audio.create({
    data: {
      name,
      fileName: '',
      ringerWire: ringerWire ? ringerWire : ''
    }
  })

  const downloadResponse = await fetch(
    `${process.env.TTS_API}/piper/synthesize`,
    {
      body: JSON.stringify({
        text: tts,
        length_scale: speed
      }),
      headers: {'Content-Type': 'application/json'},
      method: 'post'
    }
  ).catch(() => {})

  const downloadStream = fs.createWriteStream(
    path.join(process.cwd(), 'public', 'sounds', `${sound.id}.wav`)
  )
  await finished(
    Readable.fromWeb(downloadResponse!.body as any).pipe(downloadStream)
  )

  const meta = await parseFile(
    path.join(process.cwd(), 'public', 'sounds', `${sound.id}.wav`)
  )

  await prisma.audio.update({
    where: {id: sound.id},
    data: {
      fileName: `${sound.id}.wav`,
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
    <Page title={t('sounds.addTts.pageTitle')}>
      <form method="post" encType="multipart/form-data">
        <FormElement
          label={t('sounds.form.name.label')}
          helperText={t('sounds.form.name.helper')}
        >
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label={t('sounds.form.text.label')}
          helperText={t('sounds.form.text.helper')}
        >
          <input name="tts" className={INPUT_CLASSES} />
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
