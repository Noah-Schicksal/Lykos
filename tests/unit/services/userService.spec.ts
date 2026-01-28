import bcrypt from 'bcrypt';
import { UserService, ApplicationError } from '../../../src/services/userService';
import { User } from '../../../src/entities/User';
import { createMockUserRepository } from '../../mocks/mockRepositories';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: any;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const email = 'user@test.com';

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    userService = new UserService(mockUserRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user when data is valid', async () => {
      // Arrange
      const dto = {
        name: 'Test User',
        email,
        password: 'Strong@123',
        role: 'student',
      };

      mockUserRepository.findByEmail.mockReturnValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUserRepository.save.mockReturnValue({
        id: userId,
        ...dto,
        password: 'hashed-password',
      });

      // Act
      const result = await userService.create(dto);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(userId);
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue({ id: userId });

      // Act & Assert
      await expect(
        userService.create({
          name: 'User',
          email,
          password: 'Strong@123',
          role: 'student',
        })
      ).rejects.toThrow(ApplicationError);
    });

    it('should throw error when password rules are invalid', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(null);

      // Act & Assert
      await expect(
        userService.create({
          name: 'User',
          email,
          password: '123',
          role: 'student',
        })
      ).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      // Act
      await userService.delete(userId);

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update name and email', async () => {
      // Arrange
      const user = new User({
        id: userId,
        name: 'Old Name',
        email,
        password: 'hashed',
        role: 'student',
      });

      mockUserRepository.findById.mockReturnValue(user);
      mockUserRepository.findByEmail.mockReturnValue(null);
      mockUserRepository.update.mockReturnValue(user);

      // Act
      const result = await userService.update(userId, {
        name: 'New Name',
        email: 'new@test.com',
      });

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
    });

    it('should update password when provided', async () => {
      // Arrange
      const user = new User({
        id: userId,
        name: 'User',
        email,
        password: 'old-hash',
        role: 'student',
      });

      mockUserRepository.findById.mockReturnValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      mockUserRepository.update.mockReturnValue({
        ...user,
        password: 'new-hash',
      });

      // Act
      const result = await userService.update(userId, {
        password: 'NewStrong@123',
      });

      // Assert
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result.password).toBe('new-hash');
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockReturnValue(null);

      // Act & Assert
      await expect(
        userService.update(userId, { name: 'Test' })
      ).rejects.toThrow(ApplicationError);
    });

    it('should throw error when email already exists for another user', async () => {
      // Arrange
      mockUserRepository.findById.mockReturnValue({ id: userId });
      mockUserRepository.findByEmail.mockReturnValue({ id: 'other-id' });

      // Act & Assert
      await expect(
        userService.update(userId, { email: 'duplicated@test.com' })
      ).rejects.toThrow(ApplicationError);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const user = { id: userId, email };
      mockUserRepository.findById.mockReturnValue(user);

      // Act
      const result = await userService.findById(userId);

      // Assert
      expect(result).toEqual(user);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockReturnValue(null);

      // Act & Assert
      await expect(userService.findById(userId)).rejects.toThrow(
        ApplicationError
      );
    });
  });
});
