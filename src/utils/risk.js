// Central place for score -> color/label so the map pins and the
// route comparison cards always agree with each other.

export function riskInfo(safety_score, insufficient_data) {
  if (insufficient_data) {
    return { color: '#8A8F98', label: 'Not enough reports yet', tailwind: 'bg-unknown' };
  }
  if (safety_score >= 70) {
    return { color: '#1E8E5A', label: 'Low risk', tailwind: 'bg-safe' };
  }
  if (safety_score >= 40) {
    return { color: '#D9A404', label: 'Medium risk', tailwind: 'bg-caution' };
  }
  return { color: '#D14343', label: 'High risk', tailwind: 'bg-risk' };
}
