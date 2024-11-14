import nodemailer from "nodemailer";

const sendEmail = async (email, subject, htmlContent) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    // port: 587,
    // secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmail;
