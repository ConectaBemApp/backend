import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'live.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: 'smtp@mailtrap.io',
    pass: '54011a31235db7dbf4d3d762a3c894b7',
  }
});

const mailOptions = {
  from: 'smtp@demomailtrap.com',
  to: 'gustavomottadeveloper@gmail.com',
  subject: 'Enviando Email usando Node.js',
  text: 'Isso foi fácil!'
};

export const enviarEmail = (subject, text) => {
  mailOptions.subject = subject;
  mailOptions.text = text;
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log('Erro:', error);
    } else {
      console.log('Email enviado: ' + info.response);
    }
  });
}