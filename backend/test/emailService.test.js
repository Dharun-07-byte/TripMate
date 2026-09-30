const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { buildReceiptHtml } = require('../emailService');

describe('Email Service Unit Tests', () => {
  test('buildReceiptHtml generates valid HTML containing trip details', () => {
    const mockTrip = {
      destination: 'Tokyo, Japan',
      startDate: '2026-10-01',
      endDate: '2026-10-10'
    };
    const mockSplit = [
      { category: 'Flights', percent: 40, amount: 20000 },
      { category: 'Hotels', percent: 35, amount: 17500 },
      { category: 'Activities', percent: 25, amount: 12500 }
    ];

    const html = buildReceiptHtml({
      recipientEmail: 'traveler@example.com',
      trip: mockTrip,
      paymentMethod: 'UPI',
      split: mockSplit,
      transactionId: 'TXN-TEST-12345',
      totalAmount: 50000
    });

    assert.ok(typeof html === 'string', 'Generated receipt must be a string');
    assert.ok(html.includes('Tokyo, Japan'), 'Receipt HTML should include the destination');
    assert.ok(html.includes('TXN-TEST-12345'), 'Receipt HTML should include transaction ID');
    assert.ok(html.includes('traveler@example.com'), 'Receipt HTML should include recipient email');
    assert.ok(html.includes('UPI'), 'Receipt HTML should include payment method');
  });

  test('buildReceiptHtml handles missing optional split gracefully', () => {
    const mockTrip = {
      destination: 'Paris, France'
    };

    const html = buildReceiptHtml({
      recipientEmail: 'paris@example.com',
      trip: mockTrip,
      paymentMethod: 'Credit Card',
      split: [],
      transactionId: 'TXN-PARIS-999',
      totalAmount: 32000
    });

    assert.ok(html.includes('Paris, France'), 'Receipt should render destination');
    assert.ok(html.includes('TXN-PARIS-999'), 'Receipt should render transaction ID');
  });
});
