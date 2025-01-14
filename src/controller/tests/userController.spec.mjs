import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";
import { checkUserEmailSendOTP } from "../userController.mjs";
import User from "../../models/User.mjs";

vi.mock("bcrypt");
vi.mock("../../models/User.mjs");
vi.mock("../../utils/generateOTP.mjs");
vi.mock("../../utils/sendEmail.mjs");

const app = express();
app.use(express.json());
app.post("/checkUserEmailSendOTP", checkUserEmailSendOTP);

describe("Teste para checkUserEmailSendOTP", () => {
  it("deve retornar 422 se o e-mail não for fornecido ou for inválido", async () => {
    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "" });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe("Um e-mail é exigido");
  });

  it("deve retornar 201 se o usuário for criado e o OTP for enviado", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "12345", email: "teste@exemplo.com" });
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedOTP");

    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "teste@exemplo.com" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email.exists).toBe(false);
    expect(res.body.message).toBe("User created and OTP sent through email");
  });

  it("deve retornar 200 se o usuário já existir e o OTP for atualizado e enviado", async () => {
    User.findOne.mockResolvedValue({ _id: "12345", email: "teste@exemplo.com" });
    User.updateOne.mockResolvedValue({});
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedOTP");

    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "teste@exemplo.com" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email.exists).toBe(true);
    expect(res.body.message).toBe("User OTP updated and sent");
  });

  it("deve retornar 500 em caso de erro no servidor", async () => {
    User.findOne.mockRejectedValue(new Error("Erro no servidor"));

    const res = await request(app).post("/checkUserEmailSendOTP").send({ email: "teste@exemplo.com" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");
=======
import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkUserEmailSendOTP } from "../userController.mjs";
import bcrypt from "bcrypt";
import User from "../../models/User.mjs"; // Importando o modelo User como default
import { sendEmail } from "../../utils/sendEmail.mjs";
import { generateOTP } from "../../utils/generateOTP.mjs";
import { testEmailSyntax } from "../../utils/testEmailSyntax.mjs";

vi.mock("bcrypt");
vi.mock("../../models/User.mjs", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    __esModule: true, // Para garantir que o módulo é tratado como um módulo ES
    ...actual,
    default: {
      findOne: vi.fn(),
      create: vi.fn(),
      updateOne: vi.fn(),
    },
  };
});

vi.mock("../../utils/sendEmail.mjs", () => ({
  sendEmail: vi.fn(),
}));
vi.mock("../../utils/generateOTP.mjs", () => ({
  generateOTP: vi.fn(),
}));
vi.mock("../../utils/testEmailSyntax.mjs", () => ({
  testEmailSyntax: vi.fn(),
}));

describe("checkUserEmailSendOTP", () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: { email: "teste@teste.com.br" } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("deve retornar status 422 se o e-mail for inválido ou ausente", async () => {
    req.body.email = "";
    await checkUserEmailSendOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Um e-mail é exigido" });

    req.body.email = "invalid-email";
    await checkUserEmailSendOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Um e-mail é exigido" });
  });

  it("deve criar um novo usuário se ele não existir", async () => {
    testEmailSyntax.mockReturnValue(true);
    generateOTP.mockReturnValue("1234");
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedOTP");
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "newUserId", email: "teste@exemplo.com.br", hashedOTP: "hashedOTP" }); // Retornando valor correto
    sendEmail.mockResolvedValue({});

    await checkUserEmailSendOTP(req, res);
    expect(User.create).toHaveBeenCalledWith({
      email: "teste@exemplo.com.br",
      hashedOTP: "hashedOTP",
      status: "pending",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: "newUserId",
      email: { adress: "teste@exemplo.com.br", exists: false },
      role: undefined,
      message: "User created and OTP sent through email",
    });
  });

  it("deve atualizar o OTP do usuário existente", async () => {
    testEmailSyntax.mockReturnValue(true);
    generateOTP.mockReturnValue("123456");
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedOTP");
    User.findOne.mockResolvedValue({ _id: "existingUserId" });
    User.updateOne.mockResolvedValue({});
    sendEmail.mockResolvedValue({});

    await checkUserEmailSendOTP(req, res);

    // Verificar se findOne foi chamado corretamente
    expect(User.findOne).toHaveBeenCalledWith({ email: "teste@teste.com.br" });

    expect(User.updateOne).toHaveBeenCalledWith({ email: "teste@teste.com.br" }, { hashedOTP: "hashedOTP" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: "existingUserId",
      email: { adress: "teste@teste.com.br", exists: true },
      message: "User OTP updated and sent",
    });
  });

  it("deve retornar status 500 se ocorrer um erro no servidor", async () => {
    testEmailSyntax.mockReturnValue(true);
    generateOTP.mockReturnValue("123456");
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockRejectedValue(new Error("Server error"));
    sendEmail.mockResolvedValue({});

    await checkUserEmailSendOTP(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
