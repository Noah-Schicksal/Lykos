
import { CourseRepository } from '../repositories/courseRepository';

const repo = new CourseRepository();

try {
    console.log('Testing CourseRepository.findAll...');
    const result = repo.findAll({
        page: 1,
        limit: 10,
        includeInactive: true
    });
    console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
    console.error('Error:', error);
}
