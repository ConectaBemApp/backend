import { User } from "../models/index.mjs";
import { generateOTP } from "../utils/generateOTP.mjs";
import { enviarEmail } from "../utils/sendEmail.mjs";
import bcrypt from "bcrypt";
import testEmail from "../utils/regexValidations.mjs";
import config from "../config/config.mjs";
import jwt from "jsonwebtoken";
import { parseDateString } from "../utils/parseDateString.mjs";

const saltRounds = 10;

export const checkUserEmailSendOTP = async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Envia o código OTP para o e-mail enviado pelo body'
    #swagger.description = 'Envia o código OTP para registro/login da conta no e-mail enviado no body'
    #swagger.responses[200] = { description: 'Usuário já existente, código OTP enviado por e-mail' }
    #swagger.responses[201] = { description: 'Usuário criado com sucesso e código OTP enviado por e-mail' }
    #swagger.responses[201] = { description: 'Usuário criado com sucesso e código OTP enviado por e-mail' }
    #swagger.responses[422] = { description: 'Parâmetros exigidos não estão sendo enviados no body' }
    #swagger.responses[500] = { description: 'Erro no servidor' }
  */
  const { email } = req.body;

  if (!email || testEmail(email) === false) {
    return res.status(422).json({ message: "Um e-mail é exigido" });
  }
  try {
    const OTP = generateOTP();
    enviarEmail(email, OTP);

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedOTP = await bcrypt.hash(String(OTP), salt);

    console.log(`OTP gerado ${OTP}, hashed OTP: ${hashedOTP}`);

    const userExists = await User.findOne({ email: email });
    if (!userExists) {
      const result = await User.create({
        email: email,
        hashedOTP: hashedOTP,
        status: "pending",
      });
      console.log(result);

      return res.status(201).json({
        id: result._id,
        email: {
          adress: result.email,
          exists: false,
        },
        role: undefined,
        message: "User created and OTP sent through email",
      });
    } else {
      await User.updateOne({ email }, { hashedOTP });
      console.log("User OTP updated");
      return res.status(200).json({
        id: userExists._id,
        email: {
          adress: email,
          exists: true,
        },
        message: "User OTP updated and sent",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const checkOTP = async (req, res) => {
  /*
  #swagger.tags = ['User']
  #swagger.summary = 'Checa se OTPs coincidem, e parte para o login/registro do usuário'
  #swagger.description = 'Checa se o OTP enviado no body é o mesmo OTP encriptado no backend. Se for o mesmo, será checado se o usuário já está cadastrado no backend, se estiver, o usuário é logado, se não estiver, o usuário está liberado para o registro'
  #swagger.responses[200] = { description: 'Còdigos OTP coincidem' }
  #swagger.responses[401] = { description: 'Códigos OTP não coincidem' }
  #swagger.responses[422] = { description: 'Parâmetros exigidos não estão sendo enviados no body' }
  #swagger.responses[500] = { description: 'Erro no servidor' }
*/

  const { email, OTP } = req.body;
  if (!email || !OTP || testEmail(email) === false) {
    return res.status(422).json({
      msg: "Parâmetros exigidos não estão sendo enviados ou não estão sendo enviados de forma correta no body",
    });
  }
  try {
    const userExists = await User.findOne({ email: email });
    await User.updateOne({ email }, { hashedOTP });

    const resultComparation = await bcrypt.compare(OTP, userExists.hashedOTP);
    console.log(`Comparação entre os OTPs: ${resultComparation}`);
    if (resultComparation) {
      const message = {
        id: userExists._id,
        email: {
          address: userExists.email,
          exists: false,
        },
        otp: {
          isConfirmed: true,
        },
      };
      if (userExists.status === "completed") {
        message.email.exists = true;
        const accessToken = jwt.sign(message, config.ACCESS_TOKEN_SECRET);
        res.status(200).json({ accessToken: accessToken });
      } else {
        res.status(200).json({ message });
      }
    } else {
      return res.status(401).json({ msg: "Código OTP está incorreto!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const completeSignUp = async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Completa o cadastro do usuário no backend'
    #swagger.description = 'Completa o cadastro do usuário (paciente ou profissional) de acordo com as suas respectivas características'
    #swagger.responses[201] = { description: 'Usuário encontrado, cadastro completado com sucesso' } 
    #swagger.responses[200] = { description: 'Usuário encontardo, mas nenhuma alteração realizada no seu cadastro' } 
    #swagger.responses[422] = { description: 'Parâmetros exigidos não estão sendo enviados no body' } 
    #swagger.responses[404] = { description: 'Usuário não encontrado' } 
    #swagger.responses[500] = { description: 'Erro no servidor' }
  */
  const {
    userId,
    role,
    name,
    birthdayDate,
    cepResidencial,
    nomeClinica,
    CNPJCPFProfissional,
    cepClinica,
    enderecoClinica,
    complementoClinica,
    professionalSpecialities,
    otherProfessionalSpecialities,
    professionalServicePreferences,
    userSpecialities,
    userServicePreferences,
    userAcessibilityPreferences,
    profilePhoto,
  } = req.body;

  if (!role || (role != "paciente" && role != "profissional")) {
    return res.status(422).json({
      msg: "Tipo do usuário não está conforme o exigido ('paciente' ou 'profissional'), ou não está sendo enviado de forma correta no body",
    });
  }

  if (!profilePhoto) {
    const profilePhoto = null;
  }
  if (!userAcessibilityPreferences) {
    const userAcessibilityPreferences = null;
  }
  if (!complementoClinica) {
    const complementoClinica = null;
  }
  if (!otherProfessionalSpecialities) {
    const otherProfessionalSpecialities = null;
  }

  if (role === "paciente") {
    if (
      !userId ||
      !name ||
      !birthdayDate ||
      !userSpecialities ||
      !userServicePreferences
    ) {
      return res.status(422).json({
        msg: "Existem alguns parâmetros faltando para completar o cadastro do paciente",
      });
    }
    const userExists = await User.findOne({ _id: userId });
    console.log(userExists);
    if (!userExists) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const update = {
      name,
      birthdayDate: parseDateString(birthdayDate),
      userSpecialities,
      userServicePreferences,
      profilePhoto,
      userAcessibilityPreferences,
    };

    try {
      const result = await User.updateOne({ _id: userId }, { $set: update });
      console.log("Resultado da atualização:", result);
      if (result.nModified > 0) {
        const updatedUser = await User.findOne({ _id: userId });
        console.log("Usuário atualizado:", updatedUser);
        return res.status(201).json(updatedUser);
      } else {
        return res.status(200).json({ message: "Nenhuma alteração realizada" });
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  if (
    role === "profissional" &&
    (!userId ||
      !name ||
      !birthdayDate ||
      !cepResidencial ||
      !nomeClinica ||
      !CNPJCPFProfissional ||
      !cepClinica ||
      !enderecoClinica ||
      !professionalSpecialities ||
      !professionalServicePreferences)
  ) {
    return res.status(422).json({
      msg: "Existem alguns parâmetros faltando para completar o cadastro do profissional",
    });
  }
};

