/**
 * Barbell Plate Calculator
 * Greedy change-making algorithm to calculate exact plate breakdown per sleeve side.
 */

export const PLATE_COLORS = {
  25: { bg: '#dc2626', text: '#ffffff', label: '25' }, // Red
  20: { bg: '#2563eb', text: '#ffffff', label: '20' }, // Blue
  15: { bg: '#eab308', text: '#000000', label: '15' }, // Yellow
  10: { bg: '#16a34a', text: '#ffffff', label: '10' }, // Green
  5:  { bg: '#f8fafc', text: '#0f172a', label: '5' },  // White
  2.5: { bg: '#475569', text: '#ffffff', label: '2.5' }, // Silver/Grey
  1.25: { bg: '#94a3b8', text: '#0f172a', label: '1.25' } // Micro
};

// Imperial plate colors
export const LB_PLATE_COLORS = {
  45: { bg: '#2563eb', text: '#ffffff', label: '45' },
  35: { bg: '#eab308', text: '#000000', label: '35' },
  25: { bg: '#16a34a', text: '#ffffff', label: '25' },
  10: { bg: '#f8fafc', text: '#0f172a', label: '10' },
  5:  { bg: '#475569', text: '#ffffff', label: '5' },
  2.5: { bg: '#94a3b8', text: '#0f172a', label: '2.5' }
};

export function calculatePlates(
  targetWeight,
  barWeight = 20,
  availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]
) {
  const target = Number(targetWeight) || 0;
  const bar = Number(barWeight) || 20;

  if (target <= bar) {
    return {
      perSideLoad: 0,
      barWeight: bar,
      plates: [],
      remainder: 0,
      totalAchieved: bar,
      exactMatch: target === bar
    };
  }

  const perSideTarget = (target - bar) / 2;
  const sortedPlates = [...availablePlates].sort((a, b) => b - a);

  let remaining = perSideTarget;
  const plateCounts = [];

  for (const plate of sortedPlates) {
    if (plate <= 0) continue;
    if (remaining >= plate - 0.001) {
      const count = Math.floor((remaining + 0.0001) / plate);
      if (count > 0) {
        plateCounts.push({ plate, count });
        remaining = Math.round((remaining - count * plate) * 100) / 100;
      }
    }
  }

  const perSideAchieved = perSideTarget - remaining;
  const totalAchieved = bar + perSideAchieved * 2;

  return {
    perSideTarget,
    perSideLoad: perSideAchieved,
    barWeight: bar,
    plates: plateCounts,
    remainder: Math.round(remaining * 2 * 100) / 100,
    totalAchieved,
    exactMatch: Math.abs(remaining) < 0.01
  };
}
