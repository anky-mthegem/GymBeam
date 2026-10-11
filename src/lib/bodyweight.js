/**
 * Bodyweight Moving Average Smoothing Engine
 * Exponential 7-Day Moving Average (EMA) & rolling analysis
 * Filters daily sodium and hydration fluctuations to reveal true body tissue changes.
 */

/**
 * Calculates 7-day Exponential Moving Average (EMA) for chronological weight entries.
 * alpha = 2 / (N + 1) = 2 / (7 + 1) = 0.25
 * @param {Array<{date: string, weight: number}>} logs
 */
export function calculateWeightEma(logs = []) {
  if (!logs || !logs.length) return [];

  // Sort chronologically ascending
  const sorted = [...logs]
    .filter(l => l.weight > 0 && l.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!sorted.length) return [];

  const alpha = 0.25; // Standard 7-day EMA smoothing factor
  let currentEma = sorted[0].weight;

  return sorted.map((entry, index) => {
    if (index === 0) {
      currentEma = entry.weight;
    } else {
      currentEma = alpha * entry.weight + (1 - alpha) * currentEma;
    }

    return {
      date: entry.date,
      rawWeight: entry.weight,
      smoothedWeight: Math.round(currentEma * 100) / 100
    };
  });
}

/**
 * Calculates weekly trend statistics:
 * - Current 7-day smoothed average
 * - Previous 7-day smoothed average
 * - Weekly delta (kg/week)
 * - Trajectory: 'losing' | 'gaining' | 'maintaining'
 */
export function calculateWeightTrend(logs = []) {
  const smoothed = calculateWeightEma(logs);
  if (!smoothed.length) {
    return {
      currentAverage: null,
      previousAverage: null,
      weeklyChange: 0,
      trend: 'none',
      message: 'No weigh-ins logged yet.'
    };
  }

  const latest = smoothed[smoothed.length - 1];

  // Compare with entry from ~7 days ago
  const weekAgoIndex = Math.max(0, smoothed.length - 8);
  const weekAgo = smoothed[weekAgoIndex];

  const weeklyChange = Math.round((latest.smoothedWeight - weekAgo.smoothedWeight) * 100) / 100;

  let trend = 'maintaining';
  let message = 'Weight is stable within maintenance range.';

  if (weeklyChange <= -0.2) {
    trend = 'losing';
    message = `Trending down at ${Math.abs(weeklyChange)} kg/week (Fat loss phase).`;
  } else if (weeklyChange >= 0.2) {
    trend = 'gaining';
    message = `Trending up at +${weeklyChange} kg/week (Muscle building / surplus).`;
  }

  return {
    currentAverage: latest.smoothedWeight,
    previousAverage: weekAgo.smoothedWeight,
    latestRaw: latest.rawWeight,
    weeklyChange,
    trend,
    message
  };
}
