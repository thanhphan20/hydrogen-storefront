import type {Locale} from "~/type/locale";

export function parseAsCurrency(value: number, locale: Locale) {
    return new Intl.NumberFormat(locale.language + '-' + locale.country, {
      style: 'currency',
      currency: locale.currency || "USD",
    }).format(value);
  }
