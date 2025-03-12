import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from '@remix-run/node'
import {invariant} from '@arcath/utils'

import {getPrisma} from '~/lib/prisma.server'
import {updateSounders} from '~/lib/update-sounders.server'
import {checkSession} from '~/lib/session'

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

  await fetch(process.env.TTS_API!, {
    body: JSON.stringify({
      target: `${sound.id}.wav`,
      text: tts
    }),
    headers: {'Content-Type': 'application/json'},
    method: 'post'
  }).catch(() => {})

  await prisma.audio.update({
    where: {id: sound.id},
    data: {fileName: `${sound.id}.wav`}
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
