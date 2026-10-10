const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let transporter = null;

// Initialize transporter if SMTP or Gmail config is present
function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: { user, pass }
    });
    return transporter;
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    return transporter;
  }

  return null;
}

/**
 * Send an OTP verification email to any user (Patient, Nurse, Admin)
 * @param {Object} options
 * @param {string} options.to - User email address
 * @param {string} options.userName - Name of user
 * @param {string} options.userRole - Role: 'PATIENT', 'NURSE', 'ADMIN'
 * @param {string} options.otp - 6-digit OTP code
 * @param {number} options.validityMinutes - Expiry in minutes (default 10)
 * @returns {Promise<{ sent: boolean, method: string, messageId?: string, preview?: string }>}
 */
async function sendOtpEmail({ to, userName = 'Clinic User', userRole = 'USER', otp, validityMinutes = 10 }) {
  const fromEmail = process.env.SMTP_FROM || process.env.GMAIL_USER || 'security@healixphysio.com';
  const fromName = 'Healix Care & Physiotherapy Clinic';
  
  const roleTitle = userRole === 'ADMIN' 
    ? 'Chief Medical Administrator' 
    : (userRole === 'NURSE' ? 'Clinic Nurse Station' : 'Patient Recovery Portal');

  const subject = `🔐 [OTP: ${otp}] Password Reset Security Code - Healix Clinic`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Healix Security Verification OTP</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f071a; color: #f1f5f9; margin: 0; padding: 24px; }
        .container { max-width: 580px; margin: 0 auto; background: #1a0b2e; border: 1px solid #791a9c; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #791a9c 0%, #d91b76 100%); padding: 28px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #ffffff; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; color: #fce7f3; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; line-height: 1.6; }
        .greeting { font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
        .otp-box { background: rgba(121, 26, 156, 0.2); border: 2px dashed #d91b76; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 12px; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 800; margin-bottom: 8px; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 15px rgba(217, 27, 118, 0.6); }
        .expiry-text { font-size: 13px; color: #f472b6; margin-top: 8px; font-weight: 600; }
        .alert-card { background: rgba(239, 68, 68, 0.12); border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #fca5a5; margin: 20px 0; }
        .footer { background: #130722; padding: 18px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 Healix Care Physiotherapy</h1>
          <p>${roleTitle} Security Verification</p>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${userName}</div>
          <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px;">
            A password reset request was initiated for your Healix Clinic account (<strong>${to}</strong>).
          </p>
          <p style="color: #cbd5e1; font-size: 14px; margin: 0;">
            Use the One-Time Password (OTP) below to authenticate and set your new password:
          </p>

          <div class="otp-box">
            <div class="otp-label">Password Reset Security OTP</div>
            <div class="otp-code">${otp}</div>
            <div class="expiry-text">⏱️ Valid for ${validityMinutes} minutes only</div>
          </div>

          <div class="alert-card">
            <strong>⚠️ Security Notice:</strong> Never share your verification code with anyone. Clinic doctors and support staff will never ask for your password or OTP. If you did not request this, please disregard this email or report immediately.
          </div>

          <p style="color: #94a3b8; font-size: 13px; margin: 0;">
            Time of request: <strong>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</strong>
          </p>
        </div>
        <div class="footer">
          Healix Physiotherapy &amp; Rehabilitation Clinic · 742 Anna Salai, Chennai<br>
          NABH &amp; HIPAA Certified Clinic Management · Confidential Security Dispatch
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Healix Care Physiotherapy - Security Verification OTP
=====================================================
Hello ${userName},

A password reset request was made for your account (${to}).

Your One-Time Password (OTP) is: ${otp}
This code is valid for ${validityMinutes} minutes.

If you did not request this password reset, please disregard this email.
  `.trim();

  const activeTransporter = getTransporter();

  if (activeTransporter) {
    try {
      const info = await activeTransporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`[Email Dispatch] Real email sent to ${to} via SMTP. Message ID: ${info.messageId}`);
      return { sent: true, method: 'smtp', messageId: info.messageId };
    } catch (smtpErr) {
      console.warn(`[Email Dispatch] SMTP send error: ${smtpErr.message}. Falling back to console logger.`);
    }
  }

  // Fallback / Development Logger
  console.log(`\n========================================================================`);
  console.log(`📧 [SIMULATED EMAIL DISPATCH - HEALIX CLINIC]`);
  console.log(`   To: ${to} (${userName} - ${userRole})`);
  console.log(`   Subject: ${subject}`);
  console.log(`   🔐 OTP CODE: >>> ${otp} <<<`);
  console.log(`   ⏱️  Validity: ${validityMinutes} minutes`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`========================================================================\n`);

  return {
    sent: true,
    method: 'dev-logger',
    preview: `OTP dispatched to ${to}`
  };
}

module.exports = {
  sendOtpEmail,
  sendAdminOtpEmail: (opts) => sendOtpEmail({ ...opts, userRole: 'ADMIN', userName: opts.adminName })
};
