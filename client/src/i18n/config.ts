import { FormatFunction } from 'i18next';

/**
 * Format a specific translation literal.
 * @example "The price for this sample item is {price, currency}" (usage of currency formatter in doku.json)
 * @param {string|number} value
 * @param {string} [format]
 * @param {string} [lng]
 */
const formatters: FormatFunction = (value, format, lng) => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat(lng, {
        style: 'currency',
        currency: 'EUR',
      }).format(value);
    case 'date':
      return new Intl.DateTimeFormat(lng).format(value);
    case 'number':
      return new Intl.NumberFormat(lng).format(value);
    default:
      return value;
  }
};

export const i18nOptions = {
  ns: ['translation'],
  defaultNS: 'translation',
  lng: 'de',
  fallbackLng: 'de',
  interpolation: {
    format: formatters,
    escapeValue: false,
  },
  // backend: {
  //   loadPath: `${process.env.REACT_APP_BASE_URL || process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`,
  // }
};
