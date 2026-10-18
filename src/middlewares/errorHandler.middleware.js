

export const errorHandler = (api) => {
    return (req, res, next) => {
        api(req, res, next).catch((error) => {
            console.log("errorHandler", error.name)
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Token Expired , please login again", error });
            }
            return next(new Error(error.message, { cause: 500 }));
        });
    }
}

export const globalErrorHandler = (error, req, res, next) => {
    if (error) {
        console.log("globalErrorHandler", error)
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Internal server error'
        });
    }
}