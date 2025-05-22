"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const CURRENCIES = ['USD', 'EUR', 'PLN'] as const;
type Currency = typeof CURRENCIES[number];

const EXCHANGE_RATE_HOST_URL = 'https://api.exchangerate.host/latest?base=USD&symbols=USD,EUR,PLN';
const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=USD&to=EUR,PLN';
const IPAPI_URL = 'https://ipapi.co/json/';
const EU_COUNTRIES = [
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PT','RO','SK','SI','ES','SE'
];
const FALLBACK_RATES: Record<Currency, number> = { USD: 1, EUR: 0.92, PLN: 4.0 };

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};

async function fetchRates(): Promise<Record<Currency, number>> {
  try {
    const res = await fetch(EXCHANGE_RATE_HOST_URL);
    const data = await res.json();
    if (data.rates && typeof data.rates.EUR === 'number' && typeof data.rates.PLN === 'number') {
      return { USD: 1, EUR: data.rates.EUR, PLN: data.rates.PLN };
    }
    throw new Error('Rates API response missing EUR or PLN');
  } catch {
    try {
      const res2 = await fetch(FRANKFURTER_URL);
      const data2 = await res2.json();
      if (data2.rates && typeof data2.rates.EUR === 'number' && typeof data2.rates.PLN === 'number') {
        return { USD: 1, EUR: data2.rates.EUR, PLN: data2.rates.PLN };
      }
      throw new Error('Frankfurter API response missing EUR or PLN');
    } catch {
      return FALLBACK_RATES;
    }
  }
}

async function fetchCountryCode(): Promise<string> {
  try {
    const res = await fetch(IPAPI_URL);
    const data = await res.json();
    return data.country_code || '';
  } catch {
    return '';
  }
}

function getDefaultCurrency(countryCode: string): Currency {
  if (countryCode === 'PL') return 'PLN';
  if (EU_COUNTRIES.includes(countryCode)) return 'EUR';
  return 'USD';
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      let ratesObj = FALLBACK_RATES;
      let cookieRates = Cookies.get('currency_rates');
      let cookieCurrency = Cookies.get('currency_selected');
      let cookieCountry = Cookies.get('currency_country');

      // Rates
      if (!cookieRates) {
        ratesObj = await fetchRates();
        setRates(ratesObj);
        Cookies.set('currency_rates', JSON.stringify(ratesObj), { expires: 1 });
      } else {
        try {
          ratesObj = JSON.parse(cookieRates);
          setRates(ratesObj);
        } catch {
          setRates(ratesObj);
        }
      }

      // Currency selection
      if (!cookieCurrency) {
        let defaultCurrency: Currency = 'USD';
        let countryCode = cookieCountry || '';
        if (!countryCode) {
          countryCode = await fetchCountryCode();
          if (countryCode) {
            Cookies.set('currency_country', countryCode, { expires: 1 });
          }
        }
        defaultCurrency = getDefaultCurrency(countryCode);
        setCurrency(defaultCurrency);
        Cookies.set('currency_selected', defaultCurrency, { expires: 1 });
      } else {
        setCurrency(cookieCurrency as Currency);
      }
      setInitialized(true);
    };
    init();
  }, []);

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
    Cookies.set('currency_selected', c, { expires: 1 });
  };

  if (!initialized) return null;

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="flex gap-2">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          className={`px-3 py-1 rounded font-semibold border ${currency === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border-gray-300 hover:bg-blue-50'}`}
          onClick={() => setCurrency(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}; 