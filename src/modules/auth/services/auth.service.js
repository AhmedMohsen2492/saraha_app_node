
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


export const signUpService = async (req, res) => {
    const { username, email, password, confirmPassword, phone, age } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    //hash the password
    const hashedPassword = hashSync(password, parseInt(process.env.SALT_ROUNDS));

    //encrypt the phone number
    const encryptedPhone = await Encryption({ value: phone, secretKey: process.env.ENCRYPTION_SECRET });

    //send email for verification
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: 900000 // 15 min
    });
    const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify/${token}`;
    emitter.emit('sendEmail', {
        toEmail: email,
        subject: "Email Verification",
        html: htmlTemplate(confirmEmailLink),
    });

    const user = await User.create({ username, email, password: hashedPassword, phone: encryptedPhone, age });

    if (!user) {
        return res.status(500).json({ message: 'Create User failed , try again later' });
    }
    res.status(201).json({ message: 'User created successfully', user: user });
}

export const verifyEmailService = async (req, res) => {

    const { token } = req.params;
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log({ decodedData });
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

    const accessToken = jwt.sign({ _id: user._id, email: user.email, }, process.env.JWT_SECRET_LOGIN, { expiresIn: 30, jwtid: uuidv4() });
    const refreshToken = jwt.sign({ _id: user._id, email: user.email, }, process.env.JWT_SECRET_REFRESH, { expiresIn: "90d", jwtid: uuidv4() });
    res.status(200).json({ message: 'User signed in successfully', accessToken, refreshToken });
}

export const refreshTokenService = async (req, res) => {

    const { refreshtoken } = req.headers;
    const decodedData = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);
    const accessToken = jwt.sign(
        { _id: decodedData._id, email: decodedData.email, },
        process.env.JWT_SECRET_LOGIN,
        { expiresIn: 30, jwtid: uuidv4() }
    );
    res.status(200).json({ message: 'Token refreshed successfully', accessToken });
}

export const sendEmail = async (req, res) => {

    const { toEmail, subject, html } = req.body;
    const info = await sendEmailService({
        toEmail,
        subject,
        html,
    });
    if (info instanceof Error) {
        return res.status(500).json({ message: 'Error sending email', error: info.message });
    }
    res.status(200).json({ message: 'Email sent successfully', info: info });
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

    user.otpExpireAt = new Date(Date.now() + 1 * 60 * 1000);

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

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'password not matched' });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User Not Found' });
    }

    if (!user.otp) {
        return res.status(400).json({ message: 'please generate otp first' });
    }

    if (user.otpExpireAt.getTime() < Date.now()) {
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

export const htmlTemplate = (confirmEmailLink) => {
    return `
<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px 20px;"> <h1 style="color: #222; margin-bottom: 20px;"> Email Verification </h1>
<p style="color: #555; font-size: 16px; margin-bottom: 30px;">
  Please click the button below to verify your email address.
</p>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
  <tr>
    <td align="center" bgcolor="#2563EB" style="border-radius: 8px;">
      <a
        href="${confirmEmailLink}"
        target="_blank"
        style="
          display: inline-block;
          padding: 18px 50px;
          font-family: Arial, sans-serif;
          font-size: 18px;
          font-weight: bold;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
        "
      >
        Verify Email Address
      </a>
    </td>
  </tr>
</table>
<p style="color: #777; font-size: 13px; margin-top: 30px;">
  If you did not create an account, you can safely ignore this email.
</p>
</div> `
};

const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial,Helvetica,sans-serif;">

    <div style="max-width:600px; margin:40px auto; padding:20px;">

        <div style="background-color:#ffffff; border-radius:12px; padding:40px 30px; text-align:center; border:1px solid #e8ebef;">

            <div style="font-size:32px; margin-bottom:20px;">
                🔐
            </div>

            <h1 style="color:#1f2937; font-size:26px; margin:0 0 15px;">
                Reset Your Password
            </h1>

            <p style="color:#6b7280; font-size:15px; line-height:1.7; margin:0 0 25px;">
                We received a request to reset your password.
                Use the verification code below to continue.
            </p>

            <div style="background-color:#f3f6ff; border:1px dashed #4f46e5; border-radius:10px; padding:22px 15px; margin:25px 0;">

                <p style="color:#6b7280; font-size:13px; margin:0 0 12px;">
                    YOUR VERIFICATION CODE
                </p>

                <div style="font-size:36px; font-weight:bold; letter-spacing:10px; color:#4f46e5; padding-left:10px;">
                    ${otp}
                </div>

            </div>

            <p style="color:#374151; font-size:14px; line-height:1.7;">
                This code will expire in <strong>5 minutes</strong>.
                For your security, do not share this code with anyone.
            </p>

            <div style="border-top:1px solid #e5e7eb; margin-top:30px; padding-top:20px;">
                <p style="color:#9ca3af; font-size:12px; line-height:1.6; margin:0;">
                    If you didn't request a password reset, you can safely ignore this email.
                </p>
            </div>

        </div>

        <p style="text-align:center; color:#9ca3af; font-size:12px; margin-top:20px;">
            © ${new Date().getFullYear()} All rights reserved.
        </p>

    </div>

</body>
</html>
`;

