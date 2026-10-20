
/*
    1- destructing data from request body 
    2- check if email already exists in the database or not
    3- hash the password 
    4- encrypt the phone number
    5- if not exists, create a new user in the database
    6- send email for verification 
*/

import { compareSync, hashSync } from "bcrypt";
import User from "../../../db/models/user.model.js";
import { Encryption } from "../../../utils/encryption.utils.js";
import { emitter, sendEmailService } from "../../../services/sendEmail.service.js";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import BlackListTokens from "../../../db/models/blackListTokens.model.js";
import crypto from 'node:crypto';
import { verificationTemplate } from "../../../templates/verification.template.js";
import { otpEmailTemplate } from "../../../templates/otp-email.template.js";

export const signUpService = async (req, res) => {
    const { username, email, password, confirmPassword, phone, age } = req.body;

    const isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    //hash the password
    const hashedPassword = hashSync(password, parseInt(process.env.SALT_ROUNDS));

    //encrypt the phone number
    const encryptedPhone = await Encryption({ value: phone, secretKey: process.env.ENCRYPTION_SECRET });

    //send email for verification
    const token = jwt.sign({ email }, process.env.JWT_SECRET
        , {
            expiresIn: "1d" 
        }
    );
    const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify/${token}`;
    emitter.emit('sendEmail', {
        toEmail: email,
        subject: "Email Verification",
        html: verificationTemplate(confirmEmailLink),
    });

    const user = await User.create({ username, email, password: hashedPassword, phone: encryptedPhone, age });

    if (!user) {
        return res.status(500).json({ message: 'Create User failed , try again later' });
    }
    res.status(201).json({ message: 'User created successfully' });
}

export const verifyEmailService = async (req, res) => {
    const { token } = req.params;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const { email } = decodedData;
    const user = await User.findOneAndUpdate({ email }, { isEmailVerified: true }, { new: true });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Email verified successfully' });
}

export const signInService = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWT_SECRET_LOGIN,
        { expiresIn: "30m", jwtid: uuidv4() });

    const refreshToken = jwt.sign(
        { _id: user._id, email: user.email, },
        process.env.JWT_SECRET_REFRESH,
        { expiresIn: "90d", jwtid: uuidv4() });

    res.status(200).json({ message: 'User signed in successfully', accessToken, refreshToken });
}

export const refreshTokenService = async (req, res) => {
    const { refreshtoken } = req.headers;
    const decodedData = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);
    const accessToken = jwt.sign(
        { _id: decodedData._id, email: decodedData.email, },
        process.env.JWT_SECRET_LOGIN,
        { expiresIn: "30m", jwtid: uuidv4() }
    );
    res.status(200).json({ message: 'Token refreshed successfully', accessToken });
}

export const signoutService = async (req, res) => {
    const { accesstoken, refreshtoken } = req.headers;
    const decodedData = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
    const decodedRefreshToken = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);

    await BlackListTokens.insertMany([
        { tokenId: decodedData.jti, expiryDate: decodedData.exp },
        { tokenId: decodedRefreshToken.jti, expiryDate: decodedRefreshToken.exp }
    ]);
    res.status(200).json({ message: 'User Logged out successfully' });
}

export const forgetPasswordService = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User Not Found' });
    }

    const otp = crypto.randomInt(10000, 100000);
    console.log({ otp });

    emitter.emit('sendEmail', {
        toEmail: user.email,
        subject: "Reset Your Password",
        html: otpEmailTemplate(otp),
    });

    user.otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    //hash otp 
    const hashedOtp = hashSync(otp.toString(), parseInt(process.env.OTP_SALT));

    user.otp = hashedOtp;
    await user.save();

    return res.status(200).json({
        message: 'OTP generated successfully'
    });
}

export const resetPassword = async (req, res) => {
    const { email, otp, password, confirmPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User Not Found' });
    }

    if (!user.otp) {
        return res.status(400).json({ message: 'please generate otp first' });
    }

    if (user.otpExpireAt.getTime() < Date.now()) {
        await User.updateOne({ email }, { $unset: { otp: "", otpExpireAt: "" } })
        return res.status(400).json({ message: 'OTP Expired' })
    }

    const isMatchOtp = compareSync(otp?.toString(), user.otp);
    if (!isMatchOtp) {
        return res.status(400).json({ message: 'Invaild Otp' });
    }

    const hashedPassword = hashSync(password, 10);
    await User.updateOne({ email }, { password: hashedPassword, $unset: { otp: "", otpExpireAt: "" } })

    return res.status(200).json({
        message: 'Password changed successfully'
    });
}

//For fun
// export const sendEmail = async (req, res) => {
//     const { toEmail, subject, html } = req.body;
//     const info = await sendEmailService({
//         toEmail,
//         subject,
//         html,
//     });
//     if (info instanceof Error) {
//         return res.status(500).json({ message: 'Error sending email', error: info.message });
//     }
//     res.status(200).json({ message: 'Email sent successfully', info: info });
// }
