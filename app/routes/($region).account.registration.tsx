import {useState} from "react";
import {COMPANY_CREATE_MUTATION} from '~/graphql/admin/CompanyMutation';
import {COMPANY_CONTACT_REVOKE_ROLE_MUTATION} from "~/graphql/admin/CompanyContactRevokeRoleMutation";
import {METAFIELDS_SET_MUTATION} from "~/graphql/admin/MetafieldsSetMutation";
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useLoaderData,
  type MetaFunction,
} from '@remix-run/react';
import {Description, Field, Fieldset, Input, Label, Legend, Select, Checkbox, RadioGroup, Radio, Button } from '@headlessui/react'
import {HiCheck} from "react-icons/hi2";
import {CreateCompanyDto} from "~/type/company";
import {DEFAULT_COMPANY} from "~/constants/company";

export type ActionResponse = {
  errors?: any;
  error: string | null;
  company: any;
  metafieldData: any;
};

export const meta: MetaFunction = () => {
  return [{title: 'Registration'}];
};

const validInputKeys = new Set<keyof CreateCompanyDto>(
  Object.keys(DEFAULT_COMPANY as CreateCompanyDto) as Array<keyof CreateCompanyDto>
);

export async function loader({context}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return json(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export async function action({request, context}: ActionFunctionArgs) {
  const {admin} = context;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const errorsInput: Record<string, string> = {};
    const companyInput: Record<string, any> = {};

    for (const [key, value] of form.entries()) {
      if (!validInputKeys.has(key as keyof CreateCompanyDto)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        companyInput[key] = value;
      }
    }

    const requiredFields: (keyof CreateCompanyDto)[] = Object.keys(DEFAULT_COMPANY) as (keyof CreateCompanyDto)[];
    for (const field of requiredFields) {
      if (!companyInput[field]) {
        errorsInput[field] = `${field} is required.`;
      }
    }

    if (Object.keys(errorsInput).length > 0) {
      return json({ errors: errorsInput }, { status: 400 });
    }

    const {data, errors} = await admin.request(
     COMPANY_CREATE_MUTATION,
      {
        variables: {
          input: {
            company: {
              name: companyInput.name,
            },
            companyLocation: {
              name: companyInput.name,
              shippingAddress: {
                firstName: companyInput.firstName,
                lastName: companyInput.lastName,
                address1: companyInput.streetAddress1,
                address2: companyInput.streetAddress2,
                city: companyInput.city,
                zoneCode: companyInput.state,
                zip: companyInput.postalCode,
                countryCode: companyInput.country
              },
              billingSameAsShipping: true
            },
            companyContact: {
              email: companyInput.emailAddress,
              firstName: companyInput.firstName,
              lastName: companyInput.lastName,
              phone: companyInput.phoneNumber
            }
          },
        },
      },
    );

    if (errors) {
      throw new Error(JSON.stringify(errors));
    }

    const userErrors = data?.companyCreate?.userErrors;
    if (userErrors?.length) {
      throw new Error(userErrors[0].message);
    }

    if (!data?.companyCreate?.company) {
      throw new Error('Company creation failed.');
    }

    const company = data.companyCreate.company;
    let metaData;
    // Add set custom metafield value, metafield define in shopify cms
    if (company) {
      const payload = {
        metafields: [
          {
            key: "business_website",
            namespace: "custom",
            ownerId: company.id,
            type: "single_line_text_field",
            value: companyInput.businessWebsite
          },
          {
            key: "business_type",
            namespace: "custom",
            ownerId: company.id,
            type: "single_line_text_field",
            value: companyInput.businessType
          },
          {
            key: "how_did_you_hear_about_us",
            namespace: "custom",
            ownerId: company.id,
            type: "single_line_text_field",
            value: companyInput.hearAboutUs
          },
          {
            key: "primary_business_focus",
            namespace: "custom",
            ownerId: company.id,
            type: "single_line_text_field",
            value: companyInput.businessFocus
          },
          {
            key: "estimated",
            namespace: "custom",
            ownerId: company.id,
            type: "single_line_text_field",
            value: companyInput.estimated
          },
        ]
      }
      const {data: metafieldData, errors: metafieldErrors} = await admin.request(
        METAFIELDS_SET_MUTATION,
        {
          variables: payload
        }
      )
      metaData = metafieldData;
    }

    const companyContact = company.contacts.edges[0]?.node;
    const companyContactRoleAssignment = companyContact?.roleAssignments?.edges[0]?.node;

    // Revoke permission order, admin must approved form
    if (companyContact && companyContactRoleAssignment) {
      const {data: revokeData, errors: revokeErrors} = await admin.request(
        COMPANY_CONTACT_REVOKE_ROLE_MUTATION,
        {
          variables: {
            companyContactId: companyContact.id,
            companyContactRoleAssignmentId: companyContactRoleAssignment.id,
          }
        }
      )
    }
    return json({
      error: null,
      company: data?.companyCreate?.company,
      metafieldData: metaData || null,
    });
  } catch (error: any) {
    return json(
      {error: error.message, company: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountRegistration() {
  const [enabled, setEnabled] = useState(true)

  const {customer} = useLoaderData<typeof loader>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  if (action?.error) {
    console.log('Error from action:', action.error);
  }
  if (action?.errors) {
    console.log('Errors validate:', action.errors);
  }

  return (
    <div className="account-registration flex flex-col justify-center items-center">
      <h2>Register B2B Company</h2>
      <br />
      <Form method="POST" className="w-full">
        <Fieldset >
          <Legend>Business Information</Legend>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="name">Company Name</Label>
            <Input id="name" name="name" type="text" placeholder="Company Name" aria-label="Company Name" />
            {action?.errors?.name ? (
              <em className="text-red-500 text-sm">{action?.errors.name}</em>
            ) : null}          
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" name="businessType" type="text" placeholder="e.g., Interior Design, Architecture" aria-label="Business Type" />
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="businessWebsite">Business Website</Label>
            <Input id="businessWebsite" name="businessWebsite" type="url" placeholder="https://" aria-label="Business Website" />
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="taxId">Tax ID (Optional)</Label>
            <Input id="taxId" name="taxId" type="text" placeholder="Tax ID" aria-label="Tax ID" />
          </Field>
        </Fieldset>

        <Fieldset>
          <Legend>Contact Information</Legend>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" type="text" placeholder="First Name" aria-label="First Name" />
            {action?.errors?.firstName ? (
              <em className="text-red-500 text-sm">{action?.errors.firstName}</em>
            ) : null}   
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" type="text" placeholder="Last Name" aria-label="Last Name" />
            {action?.errors?.lastName ? (
              <em className="text-red-500 text-sm">{action?.errors.lastName}</em>
            ) : null}   
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input id="jobTitle" name="jobTitle" type="text" placeholder="Job Title" aria-label="Job Title" />
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="emailAddress">Email Address</Label>
            <Input id="emailAddress" name="emailAddress" type="email" placeholder="Email Address" aria-label="Email Address" />
            {action?.errors?.emailAddress ? (
              <em className="text-red-500 text-sm">{action?.errors.emailAddress}</em>
            ) : null}   
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="Phone Number" aria-label="Phone Number" />
            {action?.errors?.phoneNumber ? (
              <em className="text-red-500 text-sm">{action?.errors.phoneNumber}</em>
            ) : null}   
          </Field>
        </Fieldset>

        <Fieldset>
          <Legend>Business Address</Legend>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="streetAddress1">Street Address 1</Label>
            <Input id="streetAddress1" name="streetAddress1" type="text" placeholder="Street Address" aria-label="Street Address" />
            {action?.errors?.streetAddress1 ? (
              <em className="text-red-500 text-sm">{action?.errors.streetAddress1}</em>
            ) : null}   
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="streetAddress2">Street Address 2</Label>
            <Input id="streetAddress2" name="streetAddress2" type="text" placeholder="Street Address" aria-label="Street Address" />
            {action?.errors?.streetAddress2 ? (
              <em className="text-red-500 text-sm">{action?.errors.streetAddress2}</em>
            ) : null}   
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" type="text" placeholder="City" aria-label="City" />
            {action?.errors?.city ? (
              <em className="text-red-500 text-sm">{action?.errors.city}</em>
            ) : null} 
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="state">State/Province</Label>
            <Input id="state" name="state" type="text" placeholder="State/Province" aria-label="State" />
            {action?.errors?.state ? (
              <em className="text-red-500 text-sm">{action?.errors.state}</em>
            ) : null} 
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" name="postalCode" type="text" placeholder="Postal Code" aria-label="Postal Code" />
            {action?.errors?.postalCode ? (
              <em className="text-red-500 text-sm">{action?.errors.postalCode}</em>
            ) : null} 
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" type="text" placeholder="Country" aria-label="Country" />
            {action?.errors?.country ? (
              <em className="text-red-500 text-sm">{action?.errors.country}</em>
            ) : null} 
          </Field>
        </Fieldset>

        <Fieldset>
          <Legend>Business Details</Legend>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
            <Select className="block w-full rounded-md" id="hearAboutUs" name="hearAboutUs">
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Website">Website</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="businessFocus">Primary Business Focus</Label>
            <Select className="block w-full rounded-md" id="businessFocus" name="businessFocus">
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Retail">Retail</option>
              <option value="Hospitality">Hospitality</option>
              <option value="Other">Other</option>
            </Select>
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="purchaseFurniture">Do you specify or purchase furniture regularly for retail?</Label>
            <RadioGroup className="flex items-center gap-2">
              <Field className="flex items-center gap-2">
                <Radio
                  value="no"
                  className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-400"
                >
                  <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
                </Radio>
                <Label>No</Label>
              </Field>
              <Field className="flex items-center gap-2">
                <Radio
                  value="yes"
                  className="group flex size-5 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-400"
                >
                  <span className="invisible size-2 rounded-full bg-white group-data-[checked]:visible" />
                </Radio>
                <Label>Yes</Label>
              </Field>
            </RadioGroup>
          </Field>
          <Field className="flex flex-col gap-1 relative">
            <Label htmlFor="estimated">Estimated Annual Furniture Purchases</Label>
            <Select className="block w-full rounded-md" id="estimated" name="estimated">
              <option value="<$50,000">&lt;$50,000</option>
              <option value="$50,000–$100,000">$50,000–$100,000</option>
              <option value="$100,000+">$100,000+</option>
            </Select>
          </Field>
        </Fieldset>

        <Fieldset>
          <Field className="flex flex-col gap-1 relative">
            <Legend>Terms & Conditions</Legend>
            <Description>
              By submitting this form, you agree to District Eight’s trade program terms and conditions. You also confirm that all information provided is accurate and current.
            </Description>
            <div className="flex gap-2">
              <Checkbox
                as="div"
                checked={enabled}
                onChange={setEnabled}
                className={`relative flex items-center justify-center w-6 h-6 rounded border-2 transition duration-200 ${
                  enabled ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'
                }`}
              >
              {enabled && <HiCheck className="text-white w-4 h-4" />}
              <Input
                type="checkbox"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="terms"
                name="terms"
              />
              </Checkbox>
              <Label htmlFor="terms" className="cursor-pointer">
                I agree to the terms and conditions.
              </Label>
            </div>
          </Field>
        </Fieldset>
        <input type="hidden" name="customerId" value={customer.id} />
        {action?.error ? (
          <p>
            <mark>
              <small className="text-red-500 text-sm">{action.error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <Button 
          type="submit" 
          disabled={state !== 'idle'}
          className="inline-flex items-center gap-2 rounded-md bg-gray-700 py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
        >
          {state !== 'idle' ? 'Submitting' : 'Submit'}
        </Button>
      </Form>
    </div>
  );
}
