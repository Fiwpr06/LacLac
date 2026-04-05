import { applyContextRules } from './context-rules.util';

describe('applyContextRules', () => {
  it('should enforce lunch and non-soup for office context', () => {
    const query = applyContextRules('office', {});

    expect(query.mealTypes).toBe('lunch');
    expect(query.cookingStyle).toEqual({ $ne: 'soup' });
  });

  it('should set group context and minimum calories', () => {
    const query = applyContextRules('group', {});

    expect(query.contextTags).toBe('group');
    expect(query.calories).toEqual({ $gt: 400 });
  });
});
