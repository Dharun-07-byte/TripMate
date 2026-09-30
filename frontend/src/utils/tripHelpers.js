/**
 * TripMate Helper Utilities
 */

/**
 * Calculates number of full calendar days between two ISO date strings.
 * @param {string} startDate 
 * @param {string} endDate 
 * @returns {number}
 */
export function calculateTripDays(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, days);
}

/**
 * Calculates budget allocation across trip categories.
 * @param {number} totalAmount 
 * @param {Array<{category: string, percent: number}>} categories 
 * @returns {Array<{category: string, percent: number, amount: number}>}
 */
export function calculateBudgetSplit(totalAmount, categories = []) {
  if (!totalAmount || totalAmount <= 0) return [];
  const safeCategories = categories.length > 0 ? categories : [
    { category: 'Flights & Transit', percent: 35 },
    { category: 'Stays & Hotels', percent: 35 },
    { category: 'Food & Dining', percent: 15 },
    { category: 'Activities & Tours', percent: 15 }
  ];

  return safeCategories.map(cat => ({
    category: cat.category,
    percent: cat.percent,
    amount: Math.round((totalAmount * (cat.percent / 100)) * 100) / 100
  }));
}

/**
 * Formats a numeric value with currency code and locale formatting.
 * @param {number} amount 
 * @param {string} currencyCode 
 * @param {string} [locale='en-US'] 
 * @returns {string}
 */
export function formatCurrency(amount, currencyCode = 'USD', locale = 'en-US') {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${currencyCode} ${Number(amount).toFixed(2)}`;
  }
}

/**
 * Truncates string with ellipsis if exceeds maximum length.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export function truncateText(text, maxLength = 80) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}
