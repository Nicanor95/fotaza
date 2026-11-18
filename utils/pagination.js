export const WALL_PAGE_SIZE = 15;

// Paginates a list and calculates the current page and available range.
export function paginateItems(items, page, pageSize = WALL_PAGE_SIZE) {
	const totalItems = items.length;
	const totalPages = Math.ceil(totalItems / pageSize);
	const requestedPage = Number.parseInt(page, 10);
	const safePage = Number.isInteger(requestedPage) && requestedPage > 0
		? requestedPage
		: 1;
	const currentPage = totalPages > 0
		? Math.min(safePage, totalPages)
		: 1;
	const offset = (currentPage - 1) * pageSize;

	return {
		items: items.slice(offset, offset + pageSize),
		page: currentPage,
		pageSize,
		totalPages,
		totalItems
	};
}
