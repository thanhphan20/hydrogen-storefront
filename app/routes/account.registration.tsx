import type {CustomerFragment} from 'customer-accountapi.generated';
import {COMPANY_CREATE_MUTATION} from '~/graphql/admin/CompanyCreateMutation';
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type MetaFunction,
} from '@remix-run/react';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const {admin} = context;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const companyInput: Record<string, any> = {};
    const validInputKeys = ['name', 'externalId', 'mainContactEmail', 'mainContactFirstName', 'mainContactLastName'] as const;

    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        companyInput[key] = value;
      }
    }

    if (!companyInput.name) {
      throw new Error('Company name is required.');
    }

    const {data, errors} = await admin.request(
     COMPANY_CREATE_MUTATION,
      {
        variables: {
          input: {
            name: companyInput.name,
            externalId: companyInput.externalId || undefined,
            mainContact: {
              email: companyInput.mainContactEmail,
              firstName: companyInput.mainContactFirstName,
              lastName: companyInput.mainContactLastName,
            },
          },
        },
      },
    );

    if (errors) {
      throw new Error(errors.message);
    }

    const userErrors = data?.companyCreate?.userErrors;
    if (userErrors?.length) {
      throw new Error(userErrors[0].message);
    }

    if (!data?.companyCreate?.company) {
      throw new Error('Company creation failed.');
    }

    return json({
      error: null,
      company: data?.companyCreate?.company,
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
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  if (action?.error) {
    console.log('Error from action:', action.error);
  }
  return (
    <div className="account-registration">
      <h2>Register B2B Company</h2>
      <br />
      <Form method="POST">
        <fieldset>
          <label htmlFor="name">Company Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Company Name"
            aria-label="Company Name"
            required
          />

          <label htmlFor="externalId">External ID</label>
          <input
            id="externalId"
            name="externalId"
            type="text"
            placeholder="External ID"
            aria-label="External ID"
          />

          <label htmlFor="mainContactEmail">Main Contact Email</label>
          <input
            id="mainContactEmail"
            name="mainContactEmail"
            type="email"
            placeholder="Main Contact Email"
            aria-label="Main Contact Email"
            required
          />

          <label htmlFor="mainContactFirstName">Main Contact First Name</label>
          <input
            id="mainContactFirstName"
            name="mainContactFirstName"
            type="text"
            placeholder="First Name"
            aria-label="Main Contact First Name"
          />

          <label htmlFor="mainContactLastName">Main Contact Last Name</label>
          <input
            id="mainContactLastName"
            name="mainContactLastName"
            type="text"
            placeholder="Last Name"
            aria-label="Main Contact Last Name"
          />
        </fieldset>
        {action?.error ? (
          <p>
            <mark>
              <small>{action.error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <button type="submit" disabled={state !== 'idle'}>
          {state !== 'idle' ? 'Submitting' : 'Submit'}
        </button>
      </Form>
    </div>
  );
}
