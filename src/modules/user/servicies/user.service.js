import { compareSync, hashSync } from "bcrypt";
import BlackListTokens from "../../../db/models/blackListTokens.model.js";
import User from "../../../db/models/user.model.js";
import { Decryption, Encryption } from "../../../utils/encryption.utils.js";
import jwt from 'jsonwebtoken';
import { emitter } from "../../../services/sendEmail.service.js";
import { verificationTemplate } from "../../../templates/verification.template.js";

export const profileService = async (req, res) => {
    const { _id } = req.loggedInUser;

    const user = await User.findById(_id);
    if (!user) {
        return res.status(404).json({ message: "User Not Found" });
    }
    //decrypt the phone number before sending it in the response
    const decryptedPhone = await Decryption({ cipher: user.phone, secretKey: process.env.ENCRYPTION_SECRET });
    user.phone = decryptedPhone;
    res.status(200).json({ message: 'User profile retrieved successfully', user: user });
};

export const updatePasswordService = async (req, res) => {
    const { _id } = req.loggedInUser;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const user = await User.findById(_id);
    if (!user) {
        return res.status(404).json({ message: "User Not Found" });
    }

    const isPasswordMatched = compareSync(oldPassword, user.password);
    if (!isPasswordMatched) {
        return res.status(400).json({ message: "Invalid password" });
    }

    const hashedPassword = hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.save();

    // revoke token to login again 
    // await BlackListTokens.create(req.loggedInUser.token);

    return res.status(200).json({ message: 'Password Updaded Successfully' });
}

export const updateProfileService = async (req, res) => {
    const { _id } = req.loggedInUser;
    const { username, phone, email } = req.body;
    const user = await User.findById(_id);
    if (!user) {
        return res.status(404).json({ message: "User Not Found" });
    }
    if (username) user.username = username;
    if (phone) user.phone = await Encryption({ value: phone, secretKey: process.env.ENCRYPTION_SECRET });
    if (email) {
        const isEmailExist = await User.findOne({ email });
        if (isEmailExist) {
            return res.status(409).json({ message: "Email Already Exist" });
        }
        //send email 
        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
            expiresIn: 900000 // 15 min
        });
        const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify/${token}`;
        emitter.emit('sendEmail', {
            toEmail: email,
            subject: "Email Verification",
            html: verificationTemplate(confirmEmailLink),
        });
        user.email = email;
        user.isEmailVerified = false;
    }
    user.save();
    return res.status(200).json({ message: 'Update Profile Success' });
}

export const listUsersService = async (req, res) => {
    const users = await User.find({});
    res.status(200).json({ message: "Users retrieved successfully", users: users });
}

