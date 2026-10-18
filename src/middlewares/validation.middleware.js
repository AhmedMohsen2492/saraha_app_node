

// schema > inputs which user will input it 
//  req  > koloo [body],query,params,headers 
// const schema = {
//     body: Joi.object({
//         usename: '',
//         email: ''
//     }),
//     query: Joi.object({
//         usename: '',
//         email: ''
//     }),
// }

export const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const schemaKeys = Object.keys(schema);
        console.log("schemaKeys = ", schemaKeys);
        let validationErrors = [];
        for (const key of schemaKeys) {
            const { error } = schema[key].validate(req[key], { abortEarly: false });

            if (error) {
                console.log("error = ", error.details);
                validationErrors.push(...error.details);
            }
        }

        if (validationErrors.length) {
            const messages = validationErrors.map((error) =>
                error.message.replaceAll('"', "")
            );
            return res.status(400).json({
                 message: "Validation Errors", 
                 error: messages[0], 
                 errors: messages,
                 });
        }
        next();
    }
}