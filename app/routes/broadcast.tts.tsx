import {
  type LoaderFunctionArgs,
  type MetaFunction,
  type ActionFunctionArgs,
  redirect
} from '@remix-run/node'
import {useNavigate} from '@remix-run/react'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'
import {finished} from 'stream/promises'
import {Readable} from 'stream'

import {pageTitle, INPUT_CLASSES} from '~/lib/utils'
import {checkSession} from '~/lib/session'
import {Actions, Page, FormElement} from '~/lib/ui'
import {getPrisma} from '~/lib/prisma.server'
import {getSetting} from '~/lib/settings.server'
import {updateSounders} from '~/lib/update-sounders.server'

export const meta: MetaFunction = () => {
  return [{title: pageTitle('Broadcast', 'Text to Speech')}]
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

  const ringerWire = formData.get('ringer-wire') as string | undefined
  const tts = formData.get('tts') as string | undefined

  invariant(tts)

  const sound = await prisma.audio.create({
    data: {
      name: `TTS: ${tts}`,
      fileName: '',
      ringerWire: ringerWire ? ringerWire : ''
    }
  })

  const downloadResponse = await fetch(`${process.env.TTS_API}/piper`, {
    body: JSON.stringify({
      target: `${sound.id}.wav`,
      text: tts,
      speed
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

  return redirect(`/broadcast/tts-complete?tts=${sound.id}`)
}

const BroadcastTTS = () => {
  const navigate = useNavigate()

  return (
    <Page title="Broadcast (Text to Speech)">
      <div className="w-full bg-gray-100 rounded-3xl h-1.5 my-4 ">
        <div
          role="progressbar"
          className="bg-indigo-600 h-1.5 rounded-3xl"
          style={{width: `25%`}}
        />
      </div>
      <form method="post">
        <FormElement label="Text" helperText="The text to be broadcast.">
          <input name="tts" className={INPUT_CLASSES} />
        </FormElement>
        <FormElement
          label="Ringer Wire"
          helperText="How to ring the ringerwire"
        >
          <input name="ringerWire" className={INPUT_CLASSES} />
        </FormElement>
        <Actions
          actions={[
            {
              label: 'Back',
              color: 'bg-stone-200',
              onClick: e => {
                e.preventDefault()
                navigate('/broadcast')
              }
            },
            {
              label: 'Next',
              color: 'bg-blue-300'
            }
          ]}
        />
      </form>
    </Page>
  )
}

export default BroadcastTTS
