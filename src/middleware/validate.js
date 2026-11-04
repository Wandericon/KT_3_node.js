import Joi from 'joi'

// Максимум для Int в PostgreSQL: больше Prisma уже не переварит
export const intId = Joi.number().integer().min(1).max(2_147_483_647)

export const idParams = Joi.object({ id: intId.required() })

export const paging = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[source] ?? {}, {
    abortEarly: false,
    stripUnknown: true,
  })
  if (error) return next(error)

  // В Express 5 req.query — геттер, перезаписать его нельзя, поэтому кладём рядом
  req.valid = { ...req.valid, [source]: value }
  next()
}
