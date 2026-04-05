import { computePopularityScore } from './actions.service';

describe('computePopularityScore', () => {
  it('should compute weighted popularity score correctly', () => {
    const score = computePopularityScore({
      swipeRight: 10,
      viewDetail: 5,
      favoriteAdd: 3,
      reviewSubmit: 2,
    });

    expect(score).toBe(42);
  });
});
