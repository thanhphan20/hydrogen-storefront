export const LOCALIZATIONS_QUERY = `#graphql
# https://shopify.dev/docs/api/storefront/2024-10/queries/localization
query AllLocalizations @inContext(language: EN) {
    localization {
        availableCountries {
            isoCode
            name
        }
        market{
            id
            handle
        }
    }
}
` as const;
