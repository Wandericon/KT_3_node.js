import { PrismaClient } from '@prisma/client'

export const port = Number(process.env.PORT) || 3000

export const prisma = new PrismaClient()
