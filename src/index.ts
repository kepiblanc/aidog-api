import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import Module from './module/module.route'

const router = Router()

router.use(Module)

router.use((_: any, res: any) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: StatusCodes.NOT_FOUND,
    message: 'Resource does not exist',
    data: null
  })
})

export default router