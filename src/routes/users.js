import { Router } from 'express'
import Joi from 'joi'
import { prisma } from '../config/index.js'
import { validate, idParams, paging } from '../middleware/validate.js'

const router = Router()

const createUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required(),
  name: Joi.string().trim().min(1).max(100).required(),
  role: Joi.string().valid('USER', 'ADMIN'),
})

const updateUserSchema = createUserSchema
  .fork(['email', 'name'], (field) => field.optional())
  .min(1)

const listUsersQuery = Joi.object(paging)

router.get('/', validate(listUsersQuery, 'query'), async (req, res) => {
  const { page, limit } = req.valid.query

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      orderBy: { id: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ])

  res.json({ data: users, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
})

router.get('/:id', validate(idParams, 'params'), async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.valid.params.id },
    include: { posts: { orderBy: { createdAt: 'desc' } } },
  })

  res.json(user)
})

router.post('/', validate(createUserSchema), async (req, res) => {
  const user = await prisma.user.create({ data: req.valid.body })
  res.status(201).json(user)
})

router.patch('/:id', validate(idParams, 'params'), validate(updateUserSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.valid.params.id },
    data: req.valid.body,
  })

  res.json(user)
})

router.delete('/:id', validate(idParams, 'params'), async (req, res) => {
  const { id } = req.valid.params

  // В схеме нет onDelete: Cascade, поэтому посты автора убираем сами.
  // Транзакция откатится, если пользователя не существует (P2025 -> 404).
  await prisma.$transaction([
    prisma.post.deleteMany({ where: { authorId: id } }),
    prisma.user.delete({ where: { id } }),
  ])

  res.status(204).end()
})

export default router
