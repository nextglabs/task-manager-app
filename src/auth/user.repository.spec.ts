import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';

const mockCredentialsDto: AuthCredentialsDto = {
  username: 'TestUser',
  password: 'TestPassword',
};

describe('User Repository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;
    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('signs up the user', () => {
      save.mockResolvedValue();
      expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it('throws conflict error if user already exists', () => {
      save.mockRejectedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws if unhandled error', () => {
      save.mockRejectedValue({ code: '0' });
      expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    const { username, password } = mockCredentialsDto;
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = username;
      user.validatePassword = jest.fn();
    });

    it('returns username if validation successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({ username });
      expect(user.validatePassword).toHaveBeenCalledWith(password);
      expect(result).toEqual(username);
    });

    it('returns null if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null); // user not found

      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );
      expect(user.validatePassword).not.toHaveBeenCalled();

      expect(result).toBeNull();
    });

    it('returns null if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      const result = await userRepository.validateUserPassword(
        mockCredentialsDto,
      );
      expect(user.validatePassword).toHaveBeenCalled();

      expect(result).toEqual(null);
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');
      const password = 'testPassword';
      const salt = 'testSalt';
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword(password, salt);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, salt);
      expect(result).toEqual('testHash');
    });
  });
});
