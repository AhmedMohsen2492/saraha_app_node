import { globalErrorHandler } from "../middlewares/errorHandler.middleware.js";
import authController from "../modules/auth/auth.controller.js";
import messageController from "../modules/message/message.controller.js";
import userController from "../modules/user/user.controller.js";

const routerHandler = (app) => {
    app.use('/auth', authController);
    app.use('/user', userController);
    app.use('/message', messageController);

    // 404 handler
    app.use((req, res) => {
        return res.status(404).json({
            message: "WELCOME TO EL HOMOS APP"
        });
    });

    // Global error handler 
    app.use(globalErrorHandler);
}

export default routerHandler;

// import userRouter from "../modules/user/user.controller.js";

// const routerHandler = (app) => {
//     app.use('/users', userRouter);
// }

// export default routerHandler;