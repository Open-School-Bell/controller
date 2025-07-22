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

import {getPrisma} from '~/lib/prisma.server'
import {updateSounders} from '~/lib/update-sounders.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES, pageTitle} from '~/lib/utils'
import {getSetting} from '~/lib/settings.server'
import {Page, FormElement, Actions} from '~/lib/ui'

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: pageTitle('Sounds', 'Add TTS')}]
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

  const downloadResponse = await fetch(`${process.env.TTS_API}/piper`, {
    body: JSON.stringify({
      text: tts,
      length_scale: speed
    }),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  }).catch(() => {})

  const downloadStream = fs.createWriteStream(
    path.join(process.cwd(), 'public', 'sounds', `${sound.id}.wav`)
  )
  await finished(
    Readable.fromWeb(downloadResponse!.body as any).pipe(downloadStream)
  )

  await prisma.audio.update({
    where: {id: sound.id},
    data: {fileName: `${sound.id}.wav`}
  })

  await updateSounders()

  return redirect(`/sounds/${sound.id}`)
}

const AddSound = () => {
  const navigate = useNavigate()

  return (
    <Page title="Add Sound (text to speech)">
      <form method="post" encType="multipart/form-data">
        <FormElement label="Name" helperText="Descriptive name for the sound.">
          <input name="name" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement label="Text" helperText="The text to be generated.">
          <input name="tts" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="Ringer Wire"
          helperText="Comma seperated list of seconds to operate the relay. ON,OFF,ON,OFF, e.g. 1,3,1,3. make sure to end with an off time."
        >
          <input name="ringer-wire" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Cancel',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/sounds')
              }
            },
            {label: 'Add Sound', color: 'bg-green-300'}
          ]}
        />
      </form>
    </Page>
  )
}

export default AddSound
