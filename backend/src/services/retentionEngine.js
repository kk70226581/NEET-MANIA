const DAY_MS = 24 * 60 * 60 * 1000;
const RETRIEVAL_THRESHOLD = 0.78;

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

function retentionProbability(lastReviewedAt, strengthDays, now = new Date()) {
  const elapsedDays = Math.max(0, (now.getTime() - new Date(lastReviewedAt).getTime()) / DAY_MS);
  return clamp(Math.exp(-elapsedDays / Math.max(0.5, strengthDays || 2.5)), 0, 1);
}

function nextReviewDate(reviewedAt, strengthDays) {
  const delayDays = Math.max(0.25, -Math.log(RETRIEVAL_THRESHOLD) * strengthDays);
  return new Date(new Date(reviewedAt).getTime() + delayDays * DAY_MS);
}

function updateStrength(currentStrength, score) {
  const strength = Math.max(0.5, currentStrength || 2.5);
  if (score === 5) return clamp(strength * 2.4, 0.5, 90);
  if (score === 4) return clamp(strength * 1.9, 0.5, 90);
  if (score === 3) return clamp(strength * 1.25, 0.5, 90);
  return clamp(strength * 0.65, 0.5, 90);
}

module.exports = { DAY_MS, RETRIEVAL_THRESHOLD, retentionProbability, nextReviewDate, updateStrength };
