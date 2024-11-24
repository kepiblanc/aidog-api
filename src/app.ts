import express, { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'express-validation'
import helmet from 'helmet'
import cors from "cors";
import hpp from "hpp";
import compression from "compression";
import { StatusCodes } from 'http-status-codes'
import modules from '.'
import { ServiceError, UnauthorizedException } from './common/error'
import dotenv from 'dotenv'

dotenv.config();
const app = express()

app.use(cors());
app.use(hpp());
app.use(compression());
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_: Request, res: Response) => {
  res.send('<h1>I am okay 👍</h1>')
})

app.use('/', modules)

// Health check route
app.get('/health', async (_req, res, _next) => {
  const healthcheck = {
    uptime: process.uptime(),
    responsetime: process.hrtime()?.[0],
    message: 'OK',
    status: StatusCodes.OK,
    timestamp: new Date().toISOString()
  };

  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error instanceof Error ? error.message : "";
    res.status(StatusCodes.SERVICE_UNAVAILABLE).send();
  }
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    const errors = Object.values(err.details)
    .flat()
    .map((detail) => ({
      field: detail.context?.key,
      description: detail?.message,
    }))

    return res.status(err.statusCode).json({
      status: StatusCodes.OK,
      message: errors?.[0]?.description,
      data: null
    })
  }

  if (err instanceof ServiceError) {
    if(err instanceof UnauthorizedException) {
      return res.status(err.code).json({
        status: err.code,
        message: err.message,
        data: { 
          "requires_authentication": true
        }
      });
    }

    return res.status(err.code).json({
      status: err.code,
      message: err.message,
      data: null
    });
  }

  if (err instanceof Error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: err.message,
      data: null
    })
  }

  return res.status(StatusCodes.BAD_REQUEST).json({
    status: StatusCodes.BAD_REQUEST,
    message: 'Something went wrong while processing request',
    data: null
  })
})

export default app
