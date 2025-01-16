export const COMPANY_CREATE_MUTATION = `#graphql
# https://shopify.dev/docs/api/admin-graphql/2024-10/mutations/companyCreate
mutation CompanyCreate($input: Compa!) {
  companyCreate(input: $input) {
    company {
      id
      name
      externalId
      mainContact {
        id
        customer {
          id
          email
          firstName
          lastName
        }
      }
      contacts(first: 5) {
        edges {
          node {
            id
            customer {
              email
              firstName
              lastName
            }
          }
        }
      }
      contactRoles(first: 5) {
        edges {
          node {
            id
            name
          }
        }
      }
      locations(first: 5) {
        edges {
          node {
            id
            name
            shippingAddress {
              firstName
              lastName
              address1
              city
              province
              zip
              country
            }
          }
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
`
