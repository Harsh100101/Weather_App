export const convertUtcToIstTime = (utcDateTime) => {
	if (!utcDateTime) return "--";

	const date = new Date(`${utcDateTime}Z`);
	const istDate = new Date(date.getTime() + 330 * 60 * 1000);

	return istDate.toISOString().slice(11, 16);
};

export const differenceInDays = (start, end) => {
	if (!start || !end) return 0;
	return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
};

export const groupHourlyToDailyAverage = (time = [], values = []) => {
	const buckets = {};

	time.forEach((isoDate, index) => {
		const day = isoDate.slice(0, 10);
		if (!buckets[day]) {
			buckets[day] = { sum: 0, count: 0 };
		}

		const value = values[index];
		if (typeof value === "number" && !Number.isNaN(value)) {
			buckets[day].sum += value;
			buckets[day].count += 1;
		}
	});

	return Object.entries(buckets).map(([day, stats]) => ({
		day,
		value: stats.count ? Number((stats.sum / stats.count).toFixed(2)) : null,
	}));
};
