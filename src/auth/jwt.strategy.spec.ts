import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';
import { UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('validates & returns the user based on JWT payload', async () => {
      const user = new User();
      user.username = 'testUser';

      userRepository.findOne.mockResolvedValue(user);

      const result = await jwtStrategy.validate({ username: user.username });

      expect(userRepository.findOne).toHaveBeenCalledWith({
        username: user.username,
      });
      expect(result).toEqual(user);
    });

    it('throws unauthorized exception if user not found', async () => {
      userRepository.findOne.mockResolvedValue();
      expect(jwtStrategy.validate({ username: 'unknownUser' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
