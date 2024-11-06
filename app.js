// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Config JSON responses
app.use(express.json());

// Models
const User = require("./models/User");

// Open Route - Public Route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Hello World" });
});

// Private route
app.get("/user/:id", checkToken, async (req, res) => {
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
    return res.status(401).json({ msg: "Acesso negado" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "Token inválido" });
  }
}

// Register user
app.post("/auth/register", async (req, res) => {
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

// Login user
app.post("/auth/login", async (req, res) => {
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

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.rczok.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco com sucesso");
  })
  .catch((error) => console.log(error));
