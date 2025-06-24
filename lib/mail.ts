import { Resend } from "resend";

const resend = new Resend("re_Wv8HFRk8_FfCVr9F1qinHVwh3gGq7Euv4");

export const sendEmailVerification = async (email: string, token: string) => {
  try {
    await resend.emails.send({
      from: "NextAuth js <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      html: `
        <p>Click the link below to verify your email</p>
        <a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}">Verify email</a>
      `,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
    };
  }
};
