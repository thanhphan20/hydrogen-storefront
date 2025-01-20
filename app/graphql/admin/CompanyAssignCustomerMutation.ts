export const COMPANY_ASSIGN_CUSTOMER_MUTATION = `#graphql
# https://shopify.dev/docs/api/admin-graphql/2025-01/mutations/companyAssignCustomerAsContact
mutation companyAssignCustomerAsContact($companyId: ID!, $customerId: ID!) {
  companyAssignCustomerAsContact(companyId: $companyId, customerId: $customerId) {
    companyContact {
      id
      title
      isMainContact
      customer {
        firstName
        lastName
      }
    }
    userErrors {
      field
      message
    }
  }
}
` as const;
