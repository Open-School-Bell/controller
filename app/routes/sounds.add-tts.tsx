import {redirect, type ActionFunctionArgs} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'
import {finished} from 'stream/promises'
import {Readable} from 'stream'

import {getPrisma} from '~/lib/prisma.server'
import {updateSounders} from '~/lib/update-sounders.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const prisma = getPrisma()

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

  const downloadResponse = await fetch(process.env.TTS_API!, {
    body: JSON.stringify({
      voice: 'google_speech_file',
      textToSpeech: tts,
      language: 'en',
      speed: '1'
    }),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  }).catch(() => {})

  const downloadStream = fs.createWriteStream(
    path.join(process.cwd(), 'public', 'sounds', `${sound.id}.mp3`)
  )
  await finished(
    Readable.fromWeb(downloadResponse!.body as any).pipe(downloadStream)
  )

  await prisma.audio.update({
    where: {id: sound.id},
    data: {fileName: `${sound.id}.mp3`}
  })

  await updateSounders()

  return redirect(`/sounds/${sound.id}`)
}

const AddSound = () => {
  return (
    <div>
      <h2>Add Sound</h2>
      <form method="post" encType="multipart/form-data">
        <label>
          Name
          <input
            name="name"
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <label>
          Text
          <input name="tts" className="border border-gray-200 rounded-md p-2" />
        </label>
        <label>
          Ringer Wire
          <input
            name="ringer-wire"
            className="border border-gray-200 rounded-md p-2"
          />
        </label>
        <input type="submit" value="Add" />
      </form>
    </div>
  )
}

export default AddSound
