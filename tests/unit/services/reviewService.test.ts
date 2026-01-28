import { ReviewService } from '../../../src/services/reviewService';

describe('ReviewService (skeleton)', () => {
  let reviewRepository: any;
  let enrollmentRepository: any;
  let service: ReviewService;

  beforeEach(() => {
    reviewRepository = {
      findByCourseId: jest.fn().mockReturnValue({ reviews: [], total: 0 }),
      getAverageRating: jest.fn().mockReturnValue(0),
      findByUserAndCourse: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    enrollmentRepository = {
      findEnrollment: jest.fn(),
    };

    service = new ReviewService(reviewRepository, enrollmentRepository);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('addOrUpdateReview - create when enrolled and no existing review', async () => {
    enrollmentRepository.findEnrollment.mockReturnValue({ id: 'enr1' });

    reviewRepository.findByUserAndCourse.mockReturnValue(null);
    const savedReview = { id: 'r1', userId: 'u1', courseId: 'c1', rating: 5, comment: 'Great' };
    reviewRepository.save.mockResolvedValue(savedReview);

    const result = await service.addOrUpdateReview('u1', 'c1', { rating: 5, comment: 'Great' });

    expect(reviewRepository.save).toHaveBeenCalled();
    expect(result).toEqual(savedReview);
  });

  test('addOrUpdateReview - update when existing review found', async () => {
    enrollmentRepository.findEnrollment.mockReturnValue({ id: 'enr1' });

    const existingReview = {
      id: 'r2',
      setRating: jest.fn(),
      setComment: jest.fn(),
    };
    reviewRepository.findByUserAndCourse.mockReturnValue(existingReview);
    const updatedReview = { id: 'r2', rating: 4, comment: 'Updated' };
    reviewRepository.update.mockResolvedValue(updatedReview);

    const result = await service.addOrUpdateReview('u2', 'c2', { rating: 4, comment: 'Updated' });

    expect(existingReview.setRating).toHaveBeenCalledWith(4);
    expect(existingReview.setComment).toHaveBeenCalledWith('Updated');
    expect(reviewRepository.update).toHaveBeenCalledWith(existingReview);
    expect(result).toEqual(updatedReview);
  });

  test('addOrUpdateReview - throws when user not enrolled', async () => {
    enrollmentRepository.findEnrollment.mockReturnValue(null);

    await expect(service.addOrUpdateReview('u3', 'c3', { rating: 3, comment: 'x' })).rejects.toThrow();
    expect(reviewRepository.save).not.toHaveBeenCalled();
  });
});
