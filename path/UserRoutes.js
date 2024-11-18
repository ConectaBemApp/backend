const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const router = express.Router();
var cors = require("cors");

// Models
const User = require("../models/User");

// Config JSON responses
router.use(express.json());

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080'];
    console.log(origin);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

router.use(cors(corsOptions));

// Open Route - Public Route
router.get("/", (req, res) => {
  /*
    #swagger.tags = ['Teste']
    #swagger.summary = 'Teste da rota'
    #swagger.description = 'Este endpoint é um teste para verificar se a API está funcionando corretamente'
  */
  res.status(200).json({ msg: "Hello World" });
});

// Private route
router.get("/user/:id", checkToken, async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Retorna informações do usuário'
    #swagger.description = 'Retorna informações do usuário'
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
  const id = req.params.id;
  // check if user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Acesso negado, token inválido!" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido" });
  }
}

// Public route for login
router.post("/auth/register", async (req, res) => {
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Realiza o cadastro do usuário'
    #swagger.description = 'Realiza o cadastro do usuário'
  */
  const { name, email, password, confirmPassword } = req.body;

  // validations
  if (!name) {
    return res.status(422).json({ msg: "Name is required" });
  }
  if (!email) {
    return res.status(422).json({ msg: "Email is required" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Password is required" });
  }
  if (password !== confirmPassword) {
    return res
      .status(422)
      .json({ msg: "Password and Confirm Password must be equal" });
  }

  // check if user exists
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({
      msg: "Este email já está sendo utilizado, por favor utilize outro email!",
    });
  }

  // craete password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  });
  try {
    await user.save();
    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
});

router.post("/auth/login", async (req, res) => {
  // Public route for login
  /*
    #swagger.tags = ['User']
    #swagger.summary = 'Realiza o login do usuário'
    #swagger.description = 'Realiza o login do usuário'
  */
  const { email, password } = req.body;
  // validations
  if (!email) {
    return res.status(422).json({ msg: "Email is required" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Password is required" });
  }

  // check if user exists
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({
      msg: "Email não encontrado",
    });
  }
  // check if password is match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({
      msg: "Senha incorreta",
    });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );
    res.status(200).json({ msg: "Autenticação realizada com sucesso", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
});

module.exports = router;
