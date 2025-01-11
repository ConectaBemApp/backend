import { describe, it, expect, vi } from 'vitest';
import { generateOTP } from '../../utils/generateOTP.mjs';
import { enviarEmail } from '../../utils/sendEmail.mjs';
import { checkUserEmailSendOTP } from '../userController.mjs';
import bcrypt from 'bcrypt';
import User from '../../models/User.mjs';

vi.mock('');
vi.mock('./path/to/your/user/model');
vi.mock('bcrypt');

describe('checkUserEmailSendOTP', () => {
  it('should return 422 if email is not provided', async () => {
    const req = { body: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await checkUserEmailSendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Um e-mail é exigido" });
  });

  it('should return 422 if email is invalid', async () => {
    const req = { body: { email: 'invalid-email' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await checkUserEmailSendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: "Um e-mail é exigido" });
  });

  it('should return 201 if new user is created', async () => {
    const req = { body: { email: 'newuser@example.com' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    generateOTP.mockReturnValue(123456);
    enviarEmail.mockImplementation(() => { });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedOTP');
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: 'newUserId',
      email: 'newuser@example.com',
      hashedOTP: 'hashedOTP',
      status: 'pending'
    });

    await checkUserEmailSendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 'newUserId',
      email: {
        adress: 'newuser@example.com',
        exists: false,
      },
      role: undefined,
      message: "User created and OTP sent through email",
    });
  });

  it('should return 200 if existing user is updated', async () => {
    const req = { body: { email: 'existinguser@example.com' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    generateOTP.mockReturnValue(123456);
    enviarEmail.mockImplementation(() => { });
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedOTP');
    User.findOne.mockResolvedValue({
      _id: 'existingUserId',
      email: 'existinguser@example.com',
      hashedOTP: 'oldHashedOTP',
      status: 'active'
    });
    User.updateOne.mockResolvedValue({});

    await checkUserEmailSendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: 'existingUserId',
      email: {
        adress: 'existinguser@example.com',
        exists: true,
      },
      message: "User OTP updated and sent",
    });
  });

  it('should return 500 on server error', async () => {
    const req = { body: { email: 'user@example.com' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    User.findOne.mockRejectedValue(new Error('Server error'));

    await checkUserEmailSendOTP(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
  });
});
