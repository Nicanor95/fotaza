import assert from 'node:assert/strict';
import test from 'node:test';
import { paginateItems, WALL_PAGE_SIZE } from '../utils/pagination.js';

test('paginates items with 15 items per page', () => {
	const items = Array.from({ length: 31 }, (_, index) => index + 1);
	const firstPage = paginateItems(items, 1);
	const secondPage = paginateItems(items, 2);

	assert.equal(WALL_PAGE_SIZE, 15);
	assert.equal(firstPage.items.length, 15);
	assert.equal(secondPage.items.length, 15);
	assert.equal(secondPage.items[0], 16);
	assert.equal(firstPage.totalPages, 3);
});

test('clamps invalid and out-of-range pages', () => {
	const items = Array.from({ length: 20 }, (_, index) => index + 1);

	assert.equal(paginateItems(items, 'abc').page, 1);
	assert.equal(paginateItems(items, 0).page, 1);
	assert.equal(paginateItems(items, 99).page, 2);
	assert.equal(paginateItems([], 5).page, 1);
});
