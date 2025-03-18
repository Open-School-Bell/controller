import {createCookieSessionStorage} from '@remix-run/node'
import jwt from 'jsonwebtoken'
import {addDays} from 'date-fns'

type SessionData = {
  token: string
}

type SessionFlashData = {
  message: string
}

const {getSession, commitSession, destroySession} = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: '__session'
  }
})

export {getSession, commitSession, destroySession}

export const checkSession = async (request: Request) => {
  const session = await getSession(request.headers.get('Cookie'))

  if (session.has('token')) {
    const valid = await jwtVerify(session.get('token')!)

    if (valid) {
      return true
    }
  }

  return false
}

const jwtVerify = (token: string) => {
  return new Promise(resolve => {
    jwt.verify(token, process.env.JWT_KEY!, () => {
      resolve(true)
    })
  })
}

export const jwtCreate = () => {
  return jwt.sign({expires: addDays(new Date(), 1)}, process.env.JWT_KEY!)
}
