import { Joi, validate } from "express-validation"

const addressValidation = Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).messages({
  'string.pattern.base': 'Invalid address'
});

export const getAllocation = validate({
  query: Joi.object({
    address: addressValidation.required(),
    referred_by: Joi.string().length(6).optional(),
  })
});

export const postAllocation = validate({
  body: Joi.object({
    address: addressValidation.required()
  })
});