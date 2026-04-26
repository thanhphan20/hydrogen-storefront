import type {CreateCompanyDto} from "~/type/company";

export const DEFAULT_COMPANY: CreateCompanyDto = {
    name: '',
    firstName: '',
    lastName: '',
    streetAddress1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    emailAddress: '',
    phoneNumber: '',
    // Metafields
    businessType: '',
    businessWebsite: '',
    jobTitle: '',
    hearAboutUs: '',
    businessFocus: '',
    estimated: '',
}
