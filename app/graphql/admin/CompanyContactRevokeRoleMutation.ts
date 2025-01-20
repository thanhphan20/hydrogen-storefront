export const COMPANY_CONTACT_REVOKE_ROLE_MUTATION = `#graphql
# https://shopify.dev/docs/api/admin-graphql/2025-01/mutations/companyContactRevokeRole
mutation companyContactRevokeRole($companyContactId: ID!, $companyContactRoleAssignmentId: ID!) {
    companyContactRevokeRole(companyContactId: $companyContactId, companyContactRoleAssignmentId: $companyContactRoleAssignmentId) {
      revokedCompanyContactRoleAssignmentId
      userErrors {
        field
        message
      }
    }
  }
` as const;
