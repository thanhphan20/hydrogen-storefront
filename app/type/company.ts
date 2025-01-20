export type CreateCompanyDto = {
    name: string;
    firstName: string;
    lastName: string;
    streetAddress1: string;
    streetAddress2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    emailAddress: string;
    phoneNumber: string;
    // Metafields
    businessType: string;
    businessWebsite: string;
    taxId?: string;
    jobTitle: string;
    hearAboutUs: string;
    businessFocus: string;
    estimated: string;
};
