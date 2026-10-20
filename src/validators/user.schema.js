
import Joi from "joi";

export const updatePasswordSchema = {
    body: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(4).required(),
        confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).required()
            .messages({ "any.only": "Passwords do not match", }),
    }),
};

export const updateProfileSchema = {
    body: Joi.object({
        username: Joi.string().trim().min(3).max(30),
        email: Joi.string().trim().email(),
        phone: Joi.string().trim(),
    }).or("username", "email", "phone")
        .messages({
            "object.missing": "At least one field is required: username, email, or phone",
        }),
};
