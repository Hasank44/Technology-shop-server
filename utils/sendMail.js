import nodemailer from "nodemailer";

export const sendMail = ( email ) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAILER_USER,
      pass: process.env.EMAILER_PASSWORD,
    },
  });
  const mailConfigurations = {
    from: process.env.MAILER_USER,
    to: email,
    subject: "Thank you for subscribing to our Newsletter",
      text: `Hi! There, Recently you subscribed to our Newsletter. We're excited to have you on board!
      Stay tuned for the latest updates, exclusive offers, and exciting news delivered straight to your inbox.
      If you have any questions or need assistance, feel free to reach out to us.
      Welcome aboard! Our Website ${process.env.FRONT_URL}.`,
  };
  transporter.sendMail(mailConfigurations, function (error, _info) {
    if (error) throw Error(error);
    console.log("Email Sent Successfully");
  });
};
