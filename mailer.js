let nodemailer;

try {
  nodemailer = require("nodemailer");
} catch {
  nodemailer = null;
}

function getMailerConfig() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !nodemailer) {
    return null;
  }
  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    from: SMTP_FROM
  };
}

async function sendOtpEmail(email, otp, verifyLink = "") {
  const config = getMailerConfig();
  if (!config) {
    return { sent: false, mode: "dev", otp, verifyLink };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  const linkBlockText = verifyLink
    ? `\n\nOr click this link to verify instantly:\n${verifyLink}\n`
    : "";
  const linkBlockHtml = verifyLink
    ? `<p>Or click the button below to verify instantly:</p>
       <p><a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Verify my account</a></p>
       <p style="font-size:12px;color:#666">If the button doesn't work, paste this URL into your browser:<br><a href="${verifyLink}">${verifyLink}</a></p>`
    : "";

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: "Your WHITETEAKLLC verification code",
    text: `Your WHITETEAKLLC OTP is ${otp}. It is valid for 10 minutes.${linkBlockText}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
         <h2 style="color:#111">Welcome to WHITETEAKLLC</h2>
             <p>Your verification code is:</p>
             <p style="font-size:32px;letter-spacing:6px;font-weight:700;background:#f4f4f6;padding:16px 24px;border-radius:8px;text-align:center;color:#111">${otp}</p>
             <p>This code is valid for 10 minutes.</p>
             ${linkBlockHtml}
             <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
             <p style="font-size:12px;color:#888">If you didn't request this, you can safely ignore this email.</p>
           </div>`
  });

  return { sent: true, mode: "smtp" };
}

module.exports = { sendOtpEmail };
