import { I18nLocale } from "./type";

export function parseAsCurrency(value: number, locale: I18nLocale) {
    return new Intl.NumberFormat(locale.language + '-' + locale.country, {
      style: 'currency',
      currency: locale.currency || "USD",
    }).format(value);
  }
