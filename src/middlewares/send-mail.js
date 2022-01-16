const nodemailer = require('nodemailer');
const log = require('./log');
const { links, mail } = require('./config');

const sendRegisterMail = (email, userId, name) => {
  const transporter = nodemailer.createTransport(mail);

  const mailOptions = {
    from: mail.auth.user,
    to: email,
    subject: 'Confirm your new @rusio-chat-app account',
    html: `<h1>Hi ${name}</h1>
                <p>Confirm your email address to complete sign up.</p>
                <p>You registered with email: <b>${email}</b></p>
                <a href="${links.api}/api/confirm/${userId}">Confirm your address here!</a>
                <br>
                <p>Best regards,</p>
                <p>Mateusz Rusak</p>
                `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      log(userId, 'Send mail error');
    } else {
      log(userId, `Mail sent to ${email}`);
    }
  });
};

const sendDisableMail = (email, userId, name) => {
  const transporter = nodemailer.createTransport(mail);

  const mailOptions = {
    from: mail.auth.user,
    to: email,
    subject: 'Your @rusio-chat-app account has been disabled!',
    html: `<h1>Hi ${name}</h1>
                <p>You received this mail because you disabled yours acoount in @rusio-chat-app.</p>
                <p>If you want use your account again, you have to click on the link below.</p>
                <a href="${links.api}/api/confirm/${userId}">Enable your account again!</a>
                <p>If you want to give me a feedback, please reply by this email.</p>
                <br>
                <p>Best regards,</p>
                <p>Mateusz Rusak</p>
                `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      log(userId, 'Accont disabled error');
    } else {
      log(userId, `Account disabled: ${email}`);
    }
  });
};

module.exports = {
  sendRegisterMail,
  sendDisableMail,
};
