import { Router } from "express";
import * as userService from "./servicies/user.service.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";
import { authorizationMiddleware } from "../../middlewares/authorization.middleware.js";
import { systemRoles } from "../../constants/constants.js";
import { errorHandler } from "../../middlewares/errorHandler.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { updatePasswordSchema, updateProfileSchema } from "../../validators/user.schema.js";

const userController = Router();
const { USER, ADMIN, SUPER_ADMIN } = systemRoles;

userController.use(errorHandler(authenticationMiddleware()));

userController.get('/profile', errorHandler(userService.profileService));
userController.patch('/update-password',validationMiddleware(updatePasswordSchema) ,errorHandler(userService.updatePasswordService));
userController.put('/update-profile', validationMiddleware(updateProfileSchema), errorHandler(userService.updateProfileService));
userController.get('/list', authorizationMiddleware([USER,ADMIN,SUPER_ADMIN]), errorHandler(userService.listUsersService));

export default userController;
