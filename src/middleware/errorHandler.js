import { Prisma } from '@prisma/client'

const prismaErrors = {
  P2002: [409, 'Запись с таким уникальным значением уже существует'],
  P2025: [404, 'Запись не найдена'],
  P2003: [400, 'Связанная запись не существует'],
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.isJoi) {
    const details = err.details.map(({ path, message }) => ({ field: path.join('.'), message }))
    return res.status(400).json({ error: 'Ошибка валидации', details })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Невалидный JSON в теле запроса' })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && prismaErrors[err.code]) {
    const [status, error] = prismaErrors[err.code]
    return res.status(status).json({ error })
  }

  console.error(err)
  res.status(500).json({ error: 'Внутренняя ошибка сервера' })
}
