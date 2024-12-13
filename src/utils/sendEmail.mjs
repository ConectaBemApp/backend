import nodemailer from 'nodemailer';

// Criar um objeto de transporte
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'd2861ed9284c81',
    pass: '179b0cdde49fd3',
  }
});

// Configurar o objeto mailOptions
const mailOptions = {
  from: 'gustavomottadeveloper@gmail.com',
  to: 'gustavomottacardoso1@gmail.com',
  subject: 'Enviando Email usando Node.js',
  text: 'Isso foi fácil!'
};

// Enviar o email
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