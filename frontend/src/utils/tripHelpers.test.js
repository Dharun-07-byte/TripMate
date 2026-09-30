import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTripDays,
  calculateBudgetSplit,
  formatCurrency,
  truncateText
} from './tripHelpers.js';

describe('Trip Helper Utilities Unit Tests', () => {
  test('calculateTripDays correctly computes difference between dates', () => {
    assert.equal(calculateTripDays('2026-10-01', '2026-10-05'), 4);
    assert.equal(calculateTripDays('2026-12-01', '2026-12-01'), 1);
    assert.equal(calculateTripDays(null, null), 1);
  });

  test('calculateBudgetSplit divides amount according to percentage splits', () => {
    const split = calculateBudgetSplit(1000, [
      { category: 'Hotels', percent: 50 },
      { category: 'Food', percent: 50 }
    ]);

    assert.equal(split.length, 2);
    assert.equal(split[0].amount, 500);
    assert.equal(split[1].amount, 500);
  });

  test('formatCurrency handles currency formatting cleanly', () => {
    const formatted = formatCurrency(1250.5, 'USD', 'en-US');
    assert.ok(formatted.includes('1,250.50') || formatted.includes('$1,250.50'));

    const zero = formatCurrency(0, 'EUR');
    assert.ok(typeof zero === 'string');
  });

  test('truncateText truncates longer strings and appends ellipsis', () => {
    const longString = 'Explore the ancient temples and vibrant modern skyline of Tokyo';
    assert.equal(truncateText(longString, 20), 'Explore the ancient...');
    assert.equal(truncateText('Short text', 50), 'Short text');
    assert.equal(truncateText('', 10), '');
  });
});
