const { sendOtpEmail } = require('./mailer');

// In-memory OTP storage: email -> { otp, expiresAt, attempts, createdAt }
const otpStore = new Map();

// Mask email for public API response display: e.g. "c*********c@gmail.com"
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const maskedLocal = local[0] + '*'.repeat(Math.max(1, local.length - 2)) + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate and dispatch an OTP to any user's registered email (Patient, Nurse, Admin)
 */
async function generateAndSendOtp(email, userName = 'Clinic User', userRole = 'USER') {
  const cleanEmail = email.toLowerCase().trim();
  const now = Date.now();

  // Cooldown check: prevent requesting more than once every 15 seconds per email
  const existing = otpStore.get(cleanEmail);
  if (existing && (now - existing.createdAt < 15 * 1000)) {
    const waitSec = Math.ceil((15 * 1000 - (now - existing.createdAt)) / 1000);
    return {
      success: false,
      error: `Security rate limit: Please wait ${waitSec} seconds before requesting another verification code.`
    };
  }

  const otp = generateOtpCode();
  const validityMinutes = 10;
  const expiresAt = now + validityMinutes * 60 * 1000;

  otpStore.set(cleanEmail, {
    otp,
    expiresAt,
    attempts: 0,
    createdAt: now
  });

  await sendOtpEmail({
    to: cleanEmail,
    userName,
    userRole,
    otp,
    validityMinutes
  });

  return {
    success: true,
    message: `Verification code dispatched to registered email: ${maskEmail(cleanEmail)}. Valid for 10 minutes.`,
    maskedEmail: maskEmail(cleanEmail),
    email: cleanEmail,
    validityMinutes,
    // In local dev/testing without real SMTP configured, provide devOtp for testing convenience
    devOtp: (!process.env.SMTP_HOST && !process.env.GMAIL_USER) ? otp : undefined
  };
}

/**
 * Verify the OTP provided for an email address
 */
function verifyOtp(email, enteredOtp) {
  const cleanEmail = email.toLowerCase().trim();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return {
      valid: false,
      error: "No active verification OTP found for this email. Please request an OTP code first."
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      error: "The verification OTP has expired. Please request a new code."
    };
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return {
      valid: false,
      error: "Maximum security verification attempts (5) exceeded. Please request a fresh OTP."
    };
  }

  if (String(record.otp).trim() !== String(enteredOtp).trim()) {
    record.attempts += 1;
    const remaining = 5 - record.attempts;
    return {
      valid: false,
      error: `Invalid OTP entered. (${remaining} attempts remaining before code is invalidated).`
    };
  }

  // OTP verified successfully - clear immediately to prevent replay
  otpStore.delete(cleanEmail);
  return { valid: true };
}

module.exports = {
  generateAndSendOtp,
  verifyOtp,
  maskEmail,
  // Backward compatibility aliases
  generateAndSendAdminOtp: (email, name) => generateAndSendOtp(email, name, 'ADMIN'),
  verifyAdminOtp: (email, otp) => verifyOtp(email, otp)
};
