import { User } from '../models/index.mjs';
import { generateOTP } from '../utils/generateOTP.mjs';
import { enviarEmail } from '../utils/sendEmail.mjs';
import bcrypt from 'bcrypt';
import testEmail from '../utils/regexValidations.mjs';

const saltRounds = 10;

// Public route for auth
export const checkUserEmailSendOTP = async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Envia o código OTP por e-mail'
    #swagger.description = 'Checa se o usuário já está cadastrado no sistema. Envia o código OTP para registro/login da conta no e-mail do usuário'
    #swagger.responses[200] = { description: 'Usuário já existente, código OTP enviado por e-mail' }
    #swagger.responses[201] = { description: 'Usuário criado com sucesso e código OTP enviado por e-mail' }
    #swagger.responses[201] = { description: 'Usuário criado com sucesso e código OTP enviado por e-mail' }
    #swagger.responses[422] = { description: 'Parâmetros exigidos não estão sendo enviados no body' }
    #swagger.responses[500] = { description: 'Erro no servidor' }
  */
  const { email } = req.body;

  // validation
  if (!email || testEmail(email) === false) {
    return res.status(422).json({ message: "Um e-mail é exigido" });
  }
  try {
    // gerando o otp
    const OTP = generateOTP();
    enviarEmail(email, OTP);

    // Hashing otp
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedOTP = await bcrypt.hash(String(OTP), salt);


    console.log(`OTP gerado ${OTP}, hashed OTP: ${hashedOTP}`);

    // check if user exists
    const userExists = await User.findOne({ email: email });
    if (!userExists) {
      const result = await User.create({ email: email, hashedOTP: hashedOTP });
      return res.status(201).json({
        id: result._id,
        message: 'User created and OTP sent through email'
      });
    }

    await User.updateOne({ email }, { hashedOTP });
    console.log('User OTP updated');
    return res.status(200).json({
      id: userExists._id,
      email: {
        adress: email,
        isConfirmed: true
      },
      role: userExists.role || 'User',
      message: 'User OTP updated and sent'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const checkOTP = async (req, res) => {
  /*
  #swagger.tags = ['User']
  #swagger.summary = 'Checa se OTPs coincidem'
  #swagger.description = 'Checa se o OTP enviado no body é o mesmo OTP encriptado no backend.'
  #swagger.responses[200] = { description: 'Còdigos OTP coincidem' }
  #swagger.responses[401] = { description: 'Códigos OTP não coincidem' }
  #swagger.responses[422] = { description: 'Parâmetros exigidos não estão sendo enviados no body' }
  #swagger.responses[500] = { description: 'Erro no servidor' }
*/

  const { email, OTP } = req.body;
  if (!email || !OTP || testEmail(email) === false) {
    return res.status(422).json({ msg: "Parâmetros exigidos não estão sendo enviados ou não estão sendo enviados de forma correta no body" });
  }
  const userExists = await User.findOne({ email: email })
  const resultComparation = await bcrypt.compare(OTP, userExists.hashedOTP);
  console.log(resultComparation)
  if (resultComparation) {
    return res.status(200).json({
      id: userExists._id,
      email: {
        address: userExists.email,
        isConfirmed: true
      },
      role: userExists.role || 'User',
      otp: {
        isConfirmed: true
      }
    })
  } else {
    return res.status(401).json({ msg: "Código OTP está errado" })
  }
}