import Joi from "joi";

export const sendMessageSchema = {
    body: Joi.object({
        body: Joi.string().trim().min(1).required(),
        owner: Joi.string().hex().length(24).required()
            .messages({
                "string.hex": "Owner must be a valid MongoDB ObjectId",
                "string.length": "Owner must be a valid MongoDB ObjectId",
            }),
    }),
};
