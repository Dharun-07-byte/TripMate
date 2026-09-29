import React, { createContext, useContext, useState, useEffect } from 'react';

export const COUNTRIES_CURRENCIES = [
  { country: 'India', code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToINR: 1, flag: '🇮🇳', unitLabel: 'Rupees' },
  { country: 'United States', code: 'USD', symbol: '$', name: 'US Dollar', rateToINR: 83.5, flag: '🇺🇸', unitLabel: 'Dollars' },
  { country: 'United Arab Emirates', code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToINR: 22.7, flag: '🇦🇪', unitLabel: 'Dirhams' },
  { country: 'United Kingdom', code: 'GBP', symbol: '£', name: 'British Pound', rateToINR: 106.2, flag: '🇬🇧', unitLabel: 'Pounds' },
  { country: 'European Union (Germany/France/Italy)', code: 'EUR', symbol: '€', name: 'Euro', rateToINR: 90.5, flag: '🇪🇺', unitLabel: 'Euros' },
  { country: 'Switzerland', code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToINR: 92.8, flag: '🇨🇭', unitLabel: 'Francs' },
  { country: 'Canada', code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToINR: 61.2, flag: '🇨🇦', unitLabel: 'Dollars' },
  { country: 'Australia', code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToINR: 54.8, flag: '🇦🇺', unitLabel: 'Dollars' },
  { country: 'Singapore', code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToINR: 62.1, flag: '🇸🇬', unitLabel: 'Dollars' },
  { country: 'Saudi Arabia', code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', rateToINR: 22.2, flag: '🇸🇦', unitLabel: 'Riyals' },
  { country: 'Qatar', code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', rateToINR: 22.9, flag: '🇶🇦', unitLabel: 'Riyals' },
  { country: 'Kuwait', code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', rateToINR: 271.5, flag: '🇰🇼', unitLabel: 'Dinars' },
  { country: 'Oman', code: 'OMR', symbol: 'OMR', name: 'Omani Rial', rateToINR: 216.8, flag: '🇴🇲', unitLabel: 'Rials' },
  { country: 'Japan', code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToINR: 0.55, flag: '🇯🇵', unitLabel: 'Yen' },
  { country: 'Malaysia', code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateToINR: 17.8, flag: '🇲🇾', unitLabel: 'Ringgits' },
  { country: 'Thailand', code: 'THB', symbol: '฿', name: 'Thai Baht', rateToINR: 2.3, flag: '🇹🇭', unitLabel: 'Baht' },
  { country: 'Indonesia', code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateToINR: 0.0052, flag: '🇮🇩', unitLabel: 'Rupiah' },
  { country: 'New Zealand', code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rateToINR: 50.4, flag: '🇳🇿', unitLabel: 'Dollars' },
  { country: 'South Africa', code: 'ZAR', symbol: 'R', name: 'South African Rand', rateToINR: 4.5, flag: '🇿🇦', unitLabel: 'Rand' }
];

export const getCountryCurrency = (countryName) => {
  if (!countryName) return COUNTRIES_CURRENCIES[0];
  const found = COUNTRIES_CURRENCIES.find(
    c => c.country.toLowerCase() === countryName.toLowerCase() ||
         c.code.toLowerCase() === countryName.toLowerCase()
  );
  return found || COUNTRIES_CURRENCIES[0];
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children, initialCountry = 'India' }) {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('tripmate_country') || initialCountry;
  });

  const currencyInfo = getCountryCurrency(selectedCountry);

  const setCountry = (countryName) => {
    setSelectedCountry(countryName);
    localStorage.setItem('tripmate_country', countryName);
  };

  /**
   * Convert base INR amount to selected currency value
   */
  const convertFromINR = (inrAmount) => {
    const num = Number(inrAmount) || 0;
    if (currencyInfo.code === 'INR') return num;
    const rate = currencyInfo.rateToINR || 1;
    const converted = num / rate;
    // Round to 2 decimals or whole number if JPY/IDR
    if (currencyInfo.code === 'JPY' || currencyInfo.code === 'IDR') {
      return Math.round(converted);
    }
    return Math.round(converted * 100) / 100;
  };

  /**
   * Convert user input in selected currency back to base INR for database consistency
   */
  const convertToINR = (localAmount) => {
    const num = Number(localAmount) || 0;
    if (currencyInfo.code === 'INR') return num;
    const rate = currencyInfo.rateToINR || 1;
    return Math.round(num * rate);
  };

  /**
   * Formats a base INR amount into a localized string with proper symbol
   * e.g.:
   * India -> ₹85,000
   * UAE -> AED 3,744 (Dirhams)
   * US -> $1,018 (Dollars)
   * UK -> £800 (Pounds)
   */
  const formatAmount = (inrAmount, options = {}) => {
    const { showCode = false, compact = false } = options;
    const converted = convertFromINR(inrAmount);

    let formattedNum;
    if (currencyInfo.code === 'INR') {
      formattedNum = Number(converted).toLocaleString('en-IN', {
        maximumFractionDigits: 0
      });
    } else if (currencyInfo.code === 'JPY' || currencyInfo.code === 'IDR') {
      formattedNum = Number(converted).toLocaleString('en-US', {
        maximumFractionDigits: 0
      });
    } else {
      formattedNum = Number(converted).toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(converted) ? 0 : 2,
        maximumFractionDigits: 2
      });
    }

    if (currencyInfo.code === 'AED' || currencyInfo.code === 'SAR' || currencyInfo.code === 'QAR' || currencyInfo.code === 'KWD' || currencyInfo.code === 'OMR') {
      return `${currencyInfo.symbol} ${formattedNum}`;
    }

    if (showCode) {
      return `${currencyInfo.symbol}${formattedNum} ${currencyInfo.code}`;
    }

    return `${currencyInfo.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCountry,
      currencyInfo,
      setCountry,
      convertFromINR,
      convertToINR,
      formatAmount,
      availableCountries: COUNTRIES_CURRENCIES
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Graceful fallback if called outside provider
    const defaultInfo = COUNTRIES_CURRENCIES[0];
    return {
      selectedCountry: 'India',
      currencyInfo: defaultInfo,
      setCountry: () => {},
      convertFromINR: (amt) => Number(amt) || 0,
      convertToINR: (amt) => Number(amt) || 0,
      formatAmount: (amt) => `₹${Number(amt || 0).toLocaleString('en-IN')}`,
      availableCountries: COUNTRIES_CURRENCIES
    };
  }
  return context;
}
