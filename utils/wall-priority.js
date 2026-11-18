const RATING_THRESHOLD = 4;

export function sortPostsByRating(posts, ratings) {
	const ratingsByImageId = new Map(
		ratings.map(({ img_id, rating_count, average_rating }) => [
			String(img_id),
			{
				count: Number(rating_count),
				average: Number(average_rating)
			}
		])
	);

	return posts
		.map((post, index) => ({
			post,
			index,
			...(ratingsByImageId.get(String(post.id)) ?? { count: 0, average: 0 })
		}))
		.sort((left, right) => {
			// Four or more ratings make average the primary signal; below that, count leads.
			const leftMeetsThreshold = left.count >= RATING_THRESHOLD;
			const rightMeetsThreshold = right.count >= RATING_THRESHOLD;

			if (leftMeetsThreshold !== rightMeetsThreshold) {
				return leftMeetsThreshold ? -1 : 1;
			}

			const primaryDifference = leftMeetsThreshold
				? right.average - left.average
				: right.count - left.count;

			if (primaryDifference !== 0) {
				return primaryDifference;
			}

			const secondaryDifference = leftMeetsThreshold
				? right.count - left.count
				: right.average - left.average;

			// Keep the incoming order when both ranking criteria tie.
			return secondaryDifference || left.index - right.index;
		})
		.map(({ post }) => post);
}
