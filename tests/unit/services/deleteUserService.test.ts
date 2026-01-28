import { DeleteUserService } from '../../../src/services/DeleteUserService';
import { UserRepository } from '../../../src/repositories/userRepository';

describe('DeleteUserService', () => {
  let deleteUserService: DeleteUserService;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const otherUserId = '123e4567-e89b-12d3-a456-426614174999';

  beforeEach(() => {
    deleteUserService = new DeleteUserService();
    jest.clearAllMocks();
  });

  it('should delete user when requester deletes himself', async () => {
    // Arrange
    const deleteSpy = jest
      .spyOn(UserRepository.prototype, 'delete')
      .mockImplementation(jest.fn());

    // Act
    await deleteUserService.execute({
      userIdToDelete: userId,
      requesterId: userId,
    });

    // Assert
    expect(deleteSpy).toHaveBeenCalledWith(userId);
  });

  it('should throw error when requester tries to delete another user', async () => {
    // Arrange
    const deleteSpy = jest
      .spyOn(UserRepository.prototype, 'delete')
      .mockImplementation(jest.fn());

    // Act & Assert
    await expect(
      deleteUserService.execute({
        userIdToDelete: otherUserId,
        requesterId: userId,
      })
    ).rejects.toThrow('Usuário só pode deletar a si mesmo.');

    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
