import { AuthService } from '../../../src/services/authService';
import { UserRepository } from '../../../src/repositories/userRepository';
import { User } from '../../../src/entities/User';
import { ApplicationError } from '../../../src/services/userService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createMockUserRepository,
  mockUser,
} from '../../mocks/mockRepositories';

// Mock external dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Create a fresh mock repository for each test
    mockUserRepository = createMockUserRepository();
    authService = new AuthService(mockUserRepository);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginRequest = {
      email: 'student@test.com',
      password: 'Password123!',
    };

    it('should return user data and token when credentials are valid', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      // Act
      const result = await authService.login(loginRequest);

      // Assert
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
        token: 'mock-jwt-token',
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginRequest.password,
        mockUser.password,
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          name: mockUser.name,
          id: mockUser.id,
          role: mockUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
      );
    });

    it('should throw ApplicationError when user is not found', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(null);

      // Act & Assert
      await expect(authService.login(loginRequest)).rejects.toThrow(
        new ApplicationError('Email ou senha incorretos'),
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw ApplicationError when password does not match', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginRequest)).rejects.toThrow(
        new ApplicationError('Email ou senha incorretos'),
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        loginRequest.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginRequest.password,
        mockUser.password,
      );
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should call jwt.sign with correct parameters', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      // Act
      await authService.login(loginRequest);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          name: mockUser.name,
          id: mockUser.id,
          role: mockUser.role,
        },
        'test_secret_key_12345',
        { expiresIn: '1h' },
      );
    });

    it('should not include password in the returned user object', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      // Act
      const result = await authService.login(loginRequest);

      // Assert
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('role');
    });

    it('should work with different user roles (student, instructor)', async () => {
      // Arrange
      const instructorUser = new User({
        ...mockUser.toJSON(),
        role: 'INSTRUCTOR',
        password: mockUser.password,
      });
      mockUserRepository.findByEmail.mockReturnValue(instructorUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('instructor-token');

      // Act
      const result = await authService.login(loginRequest);

      // Assert
      expect(result.user.role).toBe('INSTRUCTOR');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'INSTRUCTOR' }),
        expect.any(String),
        expect.any(Object),
      );
    });
  });

  describe('validateCredentials (private method - tested through login)', () => {
    it('should validate email before password check', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act & Assert
      await expect(
        authService.login({
          email: 'wrong@test.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ApplicationError);

      // Password comparison should not be called if email is invalid
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with different casing', async () => {
      // Arrange
      const loginWithUpperCase = {
        email: 'STUDENT@TEST.COM',
        password: 'Password123!',
      };
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      const result = await authService.login(loginWithUpperCase);

      // Assert
      expect(result).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'STUDENT@TEST.COM',
      );
    });

    it('should handle email with spaces (repository responsibility)', async () => {
      // Arrange
      const loginWithSpaces = {
        email: '  student@test.com  ',
        password: 'Password123!',
      };
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      const result = await authService.login(loginWithSpaces);

      // Assert
      expect(result).toBeDefined();
      // Service passes email as-is, normalization is repository's job
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        '  student@test.com  ',
      );
    });
  });

  describe('Security', () => {
    it('should return same error message for invalid email and invalid password', async () => {
      // Arrange - Invalid email
      mockUserRepository.findByEmail.mockReturnValue(null);

      let errorMessage1 = '';
      try {
        await authService.login({
          email: 'wrong@test.com',
          password: 'Password123!',
        });
      } catch (error: any) {
        errorMessage1 = error.message;
      }

      // Arrange - Invalid password
      jest.clearAllMocks();
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      let errorMessage2 = '';
      try {
        await authService.login({
          email: 'student@test.com',
          password: 'WrongPassword123!',
        });
      } catch (error: any) {
        errorMessage2 = error.message;
      }

      // Assert - Same error message prevents user enumeration
      expect(errorMessage1).toBe(errorMessage2);
      expect(errorMessage1).toBe('Email ou senha incorretos');
    });
  });

  describe('Error Handling', () => {
    it('should propagate bcrypt errors', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt error'),
      );

      // Act & Assert
      await expect(
        authService.login({
          email: 'student@test.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow('Bcrypt error');
    });

    it('should propagate jwt.sign errors', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT error');
      });

      // Act & Assert
      await expect(
        authService.login({
          email: 'student@test.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow('JWT error');
    });
  });

  describe('Token Generation', () => {
    it('should include all required user data in token payload', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      await authService.login({
        email: 'student@test.com',
        password: 'Password123!',
      });

      // Assert
      const tokenPayload = (jwt.sign as jest.Mock).mock.calls[0][0];
      expect(tokenPayload).toHaveProperty('id', mockUser.id);
      expect(tokenPayload).toHaveProperty('name', mockUser.name);
      expect(tokenPayload).toHaveProperty('role', mockUser.role);
      expect(tokenPayload).not.toHaveProperty('password');
      expect(tokenPayload).not.toHaveProperty('email');
    });

    it('should use environment variables for JWT configuration', async () => {
      // Arrange
      const originalSecret = process.env.JWT_SECRET;
      const originalExpires = process.env.JWT_EXPIRES_IN;

      process.env.JWT_SECRET = 'custom_secret';
      process.env.JWT_EXPIRES_IN = '2h';

      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      // Act
      await authService.login({
        email: 'student@test.com',
        password: 'Password123!',
      });

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        'custom_secret',
        { expiresIn: '2h' },
      );

      // Restore original values
      process.env.JWT_SECRET = originalSecret;
      process.env.JWT_EXPIRES_IN = originalExpires;
    });
  });
});
