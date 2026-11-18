import assert from 'node:assert/strict';
import test from 'node:test';
import { sortPostsByRating } from '../utils/wall-priority.js';

test('ranks images with at least four ratings before images with higher averages but fewer ratings', () => {
	const posts = [{ id: 1 }, { id: 2 }];
	const ratings = [
		{ img_id: 1, rating_count: '3', average_rating: '5' },
		{ img_id: 2, rating_count: '4', average_rating: '3' }
	];

	assert.deepEqual(sortPostsByRating(posts, ratings), [{ id: 2 }, { id: 1 }]);
});

test('uses average then rating count for qualified images, and count then average for the rest', () => {
	const posts = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
	const ratings = [
		{ img_id: 1, rating_count: '5', average_rating: '4' },
		{ img_id: 2, rating_count: '4', average_rating: '4.5' },
		{ img_id: 3, rating_count: '2', average_rating: '5' },
		{ img_id: 4, rating_count: '3', average_rating: '2' }
	];

	assert.deepEqual(sortPostsByRating(posts, ratings), [{ id: 2 }, { id: 1 }, { id: 4 }, { id: 3 }]);
});

test('keeps unrated images and preserves their original order at the bottom', () => {
	const posts = [{ id: 1 }, { id: 2 }, { id: 3 }];
	const ratings = [
		{ img_id: 2, rating_count: '1', average_rating: '3' }
	];

	assert.deepEqual(sortPostsByRating(posts, ratings), [{ id: 2 }, { id: 1 }, { id: 3 }]);
});
