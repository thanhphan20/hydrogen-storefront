export const COMPANY_CREATE_MUTATION = `#graphql
# https://shopify.dev/docs/api/admin-graphql/2024-10/mutations/companyCreate
mutation CompanyCreate($input: CompanyCreateInput!) {
  companyCreate(input: $input) {
    company {
      id
      name
      externalId
      contacts(first: 1) {
        edges {
          node {
            id
            customer {
              id
              displayName
            }
            roleAssignments(first: 11) {
              edges {
                node {
                  id
                  role{
                    id
                    name
                  }
                }
              }
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
` as const
