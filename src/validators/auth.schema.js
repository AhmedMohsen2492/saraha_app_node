import Joi from "joi";

export const signUpSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
    phone: Joi.string().required(),
    age: Joi.number().integer().min(1).optional(),
  }),
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.required(),
    password: Joi.string().min(4).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required()
    .messages({ "any.only": "Passwords do not match", }),
  }),
};