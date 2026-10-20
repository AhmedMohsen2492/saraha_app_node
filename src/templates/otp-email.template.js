export const otpEmailTemplate = (otp) => `
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
      <div style="font-size:32px; margin-bottom:20px;">🔐</div>
      <h1 style="color:#1f2937; font-size:26px; margin:0 0 15px;">Reset Your Password</h1>
      <p style="color:#6b7280; font-size:15px; line-height:1.7; margin:0 0 25px;">We received a request to reset your password. Use the verification code below to continue.</p>
      <div style="background-color:#f3f6ff; border:1px dashed #4f46e5; border-radius:10px; padding:22px 15px; margin:25px 0;">
        <p style="color:#6b7280; font-size:13px; margin:0 0 12px;">YOUR VERIFICATION CODE</p>
        <div style="font-size:36px; font-weight:bold; letter-spacing:10px; color:#4f46e5; padding-left:10px;">${otp}</div>
      </div>
      <p style="color:#374151; font-size:14px; line-height:1.7;">This code will expire in <strong>5 minutes</strong>. For your security, do not share this code with anyone.</p>
      <div style="border-top:1px solid #e5e7eb; margin-top:30px; padding-top:20px;">
        <p style="color:#9ca3af; font-size:12px; line-height:1.6; margin:0;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    </div>
    <p style="text-align:center; color:#9ca3af; font-size:12px; margin-top:20px;">© ${new Date().getFullYear()} All rights reserved.</p>
  </div>
</body>
</html>
`;
