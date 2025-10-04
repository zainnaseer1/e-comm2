const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //1) create Transporter (service that will send email like gmail,mailgun,mailtrap,sendGrid)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // if false we use port 587 , if true we use port 465
    auth: {
      user: process.env.EMAIL_USER, // email to send mails from
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false }, // try enabling this in dev
  });
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "******" : "MISSING");

  //2) define email options (from, to, subject, email content)
  const mailOptions = {
    from: "E shop app <zainnaser813@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //3) send email
  const msg = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", msg.messageId);
};

module.exports = sendEmail;
