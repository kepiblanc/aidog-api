import { NextFunction, Request, Response } from 'express'
import { getService } from '../common/util'
import ModuleService, { AllocationPayload } from './module.service'
import { StatusCodes } from 'http-status-codes'

export default class ModuleController {
  private get moduleService() { return getService(ModuleService) }

  getAllocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.moduleService.getAllocation(req.query as unknown as AllocationPayload)
      res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Allocation fetched successfully',
        data: response || null
      })
    } catch (err) {
      next(err)
    }
  }

  postAllocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.moduleService.postAllocation(req.body)
      res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Allocation posted successfully',
        data: response || null
      })
    } catch (err) {
      next(err)
    }
  }
}