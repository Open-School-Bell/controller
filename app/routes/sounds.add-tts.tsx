import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {invariant} from '@arcath/utils'
import path from 'path'
import fs from 'fs'
import {finished} from 'stream/promises'
import {Readable} from 'stream'

import {getPrisma} from '~/lib/prisma.server'
import {updateSounders} from '~/lib/update-sounders.server'
import {checkSession} from '~/lib/session'
import {INPUT_CLASSES} from '~/lib/utils'
import {pageTitle} from '~/lib/utils'

export const meta: MetaFunction<typeof loader> = ({data}) => {
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
      target: `${sound.id}.wav`,
      text: tts
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
  return (
    <div className="box">
      <h2>Add Sound (text to speech)</h2>
      <form method="post" encType="multipart/form-data">
        <label className="block">
          Name
          <input name="name" className={INPUT_CLASSES} />
        </label>
        <label className="block">
          Text
          <input name="tts" className={INPUT_CLASSES} />
          <span className="text-gray-400">The text to be generated.</span>
        </label>
        <label className="block">
          Ringer Wire
          <input name="ringer-wire" className={INPUT_CLASSES} />
          <span className="text-gray-400">
            Comma seperated list of seconds to operate the relay. ON,OFF,ON,OFF,
            e.g. 1,3,1,3. make sure to end with an off time.
          </span>
        </label>
        <input
          type="submit"
          value="Add"
          className={`${INPUT_CLASSES} mt-2 bg-green-300`}
        />
      </form>
    </div>
  )
}

export default AddSound
