const RATING_THRESHOLD = 4;

// Sorts wall posts using rating averages and count thresholds.
export function sortPostsByRating(posts, ratings) {
	/**
	 * Mapeamos los posts usando el id como key
	 * quedaría algo como "3" => { count: 23, average: 4.1 }
	 */
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
		// Para cada post en posts, creamos un objeto con el post, la posicion original y los valores
		.map((post, index) => ({
			post,
			index,
			...(ratingsByImageId.get(String(post.id)) ?? { count: 0, average: 0 })
		}))
		.sort((left, right) => {
			// Four or more ratings make average the primary signal; below that, count leads.
			const leftMeetsThreshold = left.count >= RATING_THRESHOLD;
			const rightMeetsThreshold = right.count >= RATING_THRESHOLD;

			// Si uno de ellos ellos alcanza RATING_THRESHOLD y el otro no, va primero.
			if (leftMeetsThreshold !== rightMeetsThreshold) {
				return leftMeetsThreshold ? -1 : 1;
			}

			/*
			 * Elegimos la comparación
			 * Si ambos posts alcanzan RATING_THRESHOLD, el que tiene promedio mas alto va primero
			 * Si ninguno alcanza, el que tiene mas ratings va primero, seria el que tiene mas engagement
			 */
			const primaryDifference = leftMeetsThreshold
				? right.average - left.average
				: right.count - left.count;

			if (primaryDifference !== 0) {
				return primaryDifference;
			} // else it is a tie.

			// Si la diferencia de arriba es 0, el empate se rompe con el conteo de valoraciones
			const secondaryDifference = leftMeetsThreshold
				? right.count - left.count
				: right.average - left.average;

			// Keep the incoming order when both ranking criteria tie.
			return secondaryDifference || left.index - right.index;
		})
		// Sacamos los datos extra para solo regresar posts, luego de ordenar.
		.map(({ post }) => post);
}
