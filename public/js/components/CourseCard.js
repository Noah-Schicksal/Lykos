import { createElement } from '../utils.js';

export function CourseCard(course) {
    const card = createElement('div', { className: 'course-card' });

    // Image Section with Tag
    const imageDiv = createElement('div', { className: 'card-image' });
    const img = createElement('img', { alt: course.title, src: course.image });
    imageDiv.appendChild(img);

    if (course.tag) {
        const tagClass = course.tagType ? `tag-${course.tagType}` : 'tag-glass';
        const tag = createElement('span', { className: `tag ${tagClass}` }, course.tag);
        imageDiv.appendChild(tag);
    }

    // Content Section
    const contentDiv = createElement('div', { className: 'card-content' });

    const title = createElement('h3', {}, course.title);

    const instructor = createElement('p', { className: 'instructor' },
        createElement('span', { className: `material-symbols-outlined icon-sm` }, course.instructorIcon || 'person'),
        ` ${course.instructor}`
    );

    // Rating
    const ratingDiv = createElement('div', { className: 'rating' });
    const score = createElement('span', { className: 'rating-score' }, course.rating.toString());

    const starsDiv = createElement('div', { className: 'stars' });
    // Simple 5 star logic
    for (let i = 0; i < 5; i++) {
        const iconName = i < Math.floor(course.rating) ? 'star' : (i < course.rating ? 'star_half' : 'star');
        const starClass = i < Math.floor(course.rating) ? 'material-symbols-outlined filled' : 'material-symbols-outlined';
        starsDiv.appendChild(createElement('span', { className: starClass }, iconName));
    }

    const count = createElement('span', { className: 'rating-count' }, `(${course.reviews.toLocaleString()})`);
    ratingDiv.append(score, starsDiv, count);

    // Price
    const priceRow = createElement('div', { className: 'price-row' });
    const priceGroup = createElement('div', { className: 'price-group' });
    const currentPrice = createElement('span', { className: 'current-price' }, `$${course.price}`);
    const originalPrice = createElement('span', { className: 'original-price' }, `$${course.originalPrice}`);
    priceGroup.append(currentPrice, originalPrice);
    priceRow.appendChild(priceGroup);

    contentDiv.append(title, instructor, ratingDiv, priceRow);

    card.append(imageDiv, contentDiv);
    return card;
}
