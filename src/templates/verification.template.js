export const verificationTemplate = (confirmEmailLink) => `
<div style="font-family: Arial, sans-serif; text-align: center; padding: 30px 20px;">
  <h1 style="color: #222; margin-bottom: 20px;">Email Verification</h1>
  <p style="color: #555; font-size: 16px; margin-bottom: 30px;">Please click the button below to verify your email address.</p>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
    <tr>
      <td align="center" bgcolor="#2563EB" style="border-radius: 8px;">
        <a href="${confirmEmailLink}" target="_blank" style="display: inline-block; padding: 18px 50px; font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px;">
          Verify Email Address
        </a>
      </td>
    </tr>
  </table>
  <p style="color: #777; font-size: 13px; margin-top: 30px;">If you did not create an account, you can safely ignore this email.</p>
</div>
`;
