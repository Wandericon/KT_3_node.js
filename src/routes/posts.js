import { Router } from 'express'
import Joi from 'joi'
import { prisma } from '../config/index.js'
import { validate, idParams, intId, paging } from '../middleware/validate.js'

const router = Router()

const postFields = {
  title: Joi.string().trim().min(1).max(200),
  content: Joi.string().allow('', null),
  published: Joi.boolean(),
  authorId: intId,
  tags: Joi.array().items(Joi.string().trim().min(1).max(50)),
}

const createPostSchema = Joi.object({
  ...postFields,
  title: postFields.title.required(),
  authorId: postFields.authorId.required(),
})

const updatePostSchema = Joi.object(postFields).min(1)

const listPostsQuery = Joi.object({
  ...paging,
  search: Joi.string().trim().allow(''),
  published: Joi.boolean(),
  authorId: intId,
})

const postRelations = {
  author: { select: { id: true, name: true, email: true } },
  tags: true,
}

const tagLinks = (names) =>
  [...new Set(names)].map((name) => ({ where: { name }, create: { name } }))

router.get('/', validate(listPostsQuery, 'query'), async (req, res) => {
  const { search, published, authorId, page, limit } = req.valid.query

  const where = {
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...(published !== undefined && { published }),
    ...(authorId && { authorId }),
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: postRelations,
      // id нужен для стабильного порядка, когда у постов совпадает createdAt
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ])

  res.json({ data: posts, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
})

router.get('/:id', validate(idParams, 'params'), async (req, res) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: req.valid.params.id },
    include: postRelations,
  })

  res.json(post)
})

router.post('/', validate(createPostSchema), async (req, res) => {
  const { tags = [], ...fields } = req.valid.body

  const post = await prisma.post.create({
    data: { ...fields, tags: { connectOrCreate: tagLinks(tags) } },
    include: postRelations,
  })

  res.status(201).json(post)
})

router.patch('/:id', validate(idParams, 'params'), validate(updatePostSchema), async (req, res) => {
  const { tags, ...fields } = req.valid.body

  const post = await prisma.post.update({
    where: { id: req.valid.params.id },
    data: {
      ...fields,
      // set: [] сначала отвязывает старые теги, иначе новые лишь добавились бы к ним
      ...(tags && { tags: { set: [], connectOrCreate: tagLinks(tags) } }),
    },
    include: postRelations,
  })

  res.json(post)
})

router.delete('/:id', validate(idParams, 'params'), async (req, res) => {
  await prisma.post.delete({ where: { id: req.valid.params.id } })
  res.status(204).end()
})

export default router
