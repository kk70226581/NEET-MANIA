const { retentionProbability, nextReviewDate, updateStrength } = require('../retentionEngine');

describe('retentionEngine', () => {
  test('retention falls as elapsed time increases', () => {
    const reviewed = new Date('2026-07-01T00:00:00.000Z');
    const early = retentionProbability(reviewed, 4, new Date('2026-07-02T00:00:00.000Z'));
    const late = retentionProbability(reviewed, 4, new Date('2026-07-05T00:00:00.000Z'));
    expect(early).toBeGreaterThan(late);
    expect(early).toBeLessThanOrEqual(1);
    expect(late).toBeGreaterThanOrEqual(0);
  });

  test('strong retrieval increases stability and weak retrieval shortens it', () => {
    expect(updateStrength(4, 5)).toBeGreaterThan(4);
    expect(updateStrength(4, 2)).toBeLessThan(4);
  });

  test('the next review is scheduled after the review time', () => {
    const reviewed = new Date('2026-07-01T00:00:00.000Z');
    expect(nextReviewDate(reviewed, 4).getTime()).toBeGreaterThan(reviewed.getTime());
  });
});
