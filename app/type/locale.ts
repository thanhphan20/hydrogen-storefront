import type {
  CountryCode,
  CurrencyCode,
  LanguageCode,
} from '@shopify/hydrogen/storefront-api-types';
  
export type Locale = {
  language: LanguageCode;
  country: CountryCode;
  label?: string;
  currency?: CurrencyCode;
};

export type I18nLocale = Locale & {
  pathPrefix: string;
};

export type Region = {
  label: string;
  pathPrefix: string;
  region: string;
}

export type Localizations = Record<string, Locale>;

export type Regions = Record<string, Region>;
