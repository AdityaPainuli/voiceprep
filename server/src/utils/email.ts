import nodemailer from "nodemailer";
import "dotenv/config";

export const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: true, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"VoicePrep<${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
        <p>Welcome 👋🏻 
        <p>Please verify your email by clicking the button below:</p>
        <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email</a>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The VoicePrep Team</p>
        `,
  });
}

export async function verifyEmailTransport() {
  try {
    await transporter.verify();
    console.log("Email SMTP connection successful");
  } catch (err) {
    console.error("SMTP connection failed: ", err);
    throw err;
  }
}
