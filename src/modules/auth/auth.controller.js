import { Router } from "express";
import * as authService from "./services/auth.service.js";
import { errorHandler } from "../../middlewares/errorHandler.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { signUpSchema } from "../../validators/auth.schema.js";

const authController = Router();

authController.post('/signup', validationMiddleware(signUpSchema) , errorHandler(authService.signUpService));
authController.post('/signin', errorHandler(authService.signInService));
authController.get('/verify/:token', errorHandler(authService.verifyEmailService)) // correct is patch not get 
authController.post('/refresh-token', errorHandler(authService.refreshTokenService))
authController.post('/signout', errorHandler(authService.signoutService))
authController.patch('/forget-password', errorHandler(authService.forgetPasswordService))
authController.put('/reset-password', errorHandler(authService.resetPassword))

authController.post('/send-email', errorHandler(authService.sendEmail));
export default authController;