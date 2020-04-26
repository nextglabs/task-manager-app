import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

describe('User entity', () => {
  describe('validatePassword', () => {
    let user;
    beforeEach(() => {
      user = new User();
      user.salt = 'testSalt';
      user.password = 'hashedPassword';
      bcrypt.hash = jest.fn();
    });

    it('returns true when password matches hash', async () => {
      bcrypt.hash.mockResolvedValue(user.password);
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword(user.password);
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, user.salt);

      expect(result).toEqual(true);
    });

    it("returns false when password doesn't match hash", async () => {
      bcrypt.hash.mockResolvedValue('wrongHashedPassword');
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('wrongPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('wrongPassword', user.salt);

      expect(result).toEqual(false);
    });
  });
});
