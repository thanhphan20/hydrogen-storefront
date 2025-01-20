export const METAFIELDS_SET_MUTATION = `#graphql
# https://shopify.dev/docs/api/admin-graphql/2025-01/mutations/metafieldsSet
mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields {
      key
      namespace
      value
      createdAt
      updatedAt
    }
    userErrors {
      field
      message
      code
    }
  }
}`
