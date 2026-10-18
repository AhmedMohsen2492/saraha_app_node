import { Router } from "express";
import * as messageService from "./services/message.service.js";
import { errorHandler } from "../../middlewares/errorHandler.middleware.js";
import { authenticationMiddleware } from "../../middlewares/authentication.middleware.js";

const messageController = Router();

messageController.post('/send', errorHandler(messageService.sendMessageService));
messageController.get('/list', errorHandler(messageService.getMessagesService));

// required login 
messageController.use(errorHandler(authenticationMiddleware()));
messageController.get('/messages', errorHandler(messageService.getUserMessagesService));

export default messageController;