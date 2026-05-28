import {data, Form, redirect, useActionData, useNavigation} from 'react-router';
import type {ActionFunctionArgs, LoaderFunctionArgs} from 'react-router';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';

interface FormErrors {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

interface FormValues {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function loader({context}: LoaderFunctionArgs) {
  const session = context.session as {get: (k: string) => unknown} | undefined;
  const saved = session?.get('checkoutInformation') as FormValues | undefined;
  return data({savedValues: saved ?? null});
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();

  const values: FormValues = {
    email: String(formData.get('email') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
    firstName: String(formData.get('firstName') ?? '').trim(),
    lastName: String(formData.get('lastName') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    state: String(formData.get('state') ?? '').trim(),
    zip: String(formData.get('zip') ?? '').trim(),
    country: String(formData.get('country') ?? '').trim(),
  };

  const errors: FormErrors = {};

  if (!values.email) errors.email = 'Email is required.';
  else if (!validateEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.firstName) errors.firstName = 'First name is required.';
  if (!values.lastName) errors.lastName = 'Last name is required.';
  if (!values.address) errors.address = 'Address is required.';
  if (!values.city) errors.city = 'City is required.';
  if (!values.state) errors.state = 'State / Province is required.';
  if (!values.zip) errors.zip = 'ZIP / Postal code is required.';
  if (!values.country) errors.country = 'Country is required.';

  if (Object.keys(errors).length > 0) {
    return data({errors, values}, {status: 422});
  }

  const session = context.session as {set: (k: string, v: unknown) => void} | undefined;
  session?.set('checkoutInformation', values);

  return redirect('/checkout/shipping');
}

export default function CheckoutInformation() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const errors: FormErrors = (actionData as {errors?: FormErrors} | undefined)?.errors ?? {};
  const values: Partial<FormValues> =
    (actionData as {values?: Partial<FormValues>} | undefined)?.values ?? {};

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <Form method="post" noValidate className="space-y-8">
        <section aria-labelledby="contact-heading">
          <h2
            id="contact-heading"
            className="text-lg font-semibold tracking-tight border-b pb-2 mb-4"
          >
            Contact Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 grid gap-1.5">
              <Label htmlFor="email">
                Email <span aria-hidden>*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={values.email}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 grid gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={values.phone}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="shipping-heading">
          <h2
            id="shipping-heading"
            className="text-lg font-semibold tracking-tight border-b pb-2 mb-4"
          >
            Shipping Address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="firstName">
                First name <span aria-hidden>*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                defaultValue={values.firstName}
                aria-invalid={errors.firstName ? true : undefined}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-xs text-destructive" role="alert">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="lastName">
                Last name <span aria-hidden>*</span>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                defaultValue={values.lastName}
                aria-invalid={errors.lastName ? true : undefined}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <p id="lastName-error" className="text-xs text-destructive" role="alert">
                  {errors.lastName}
                </p>
              )}
            </div>

            <div className="sm:col-span-2 grid gap-1.5">
              <Label htmlFor="address">
                Address <span aria-hidden>*</span>
              </Label>
              <Input
                id="address"
                name="address"
                type="text"
                autoComplete="street-address"
                defaultValue={values.address}
                aria-invalid={errors.address ? true : undefined}
                aria-describedby={errors.address ? 'address-error' : undefined}
                placeholder="123 Main St"
              />
              {errors.address && (
                <p id="address-error" className="text-xs text-destructive" role="alert">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="city">
                City <span aria-hidden>*</span>
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                defaultValue={values.city}
                aria-invalid={errors.city ? true : undefined}
                aria-describedby={errors.city ? 'city-error' : undefined}
              />
              {errors.city && (
                <p id="city-error" className="text-xs text-destructive" role="alert">
                  {errors.city}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="state">
                State / Province <span aria-hidden>*</span>
              </Label>
              <Input
                id="state"
                name="state"
                type="text"
                autoComplete="address-level1"
                defaultValue={values.state}
                aria-invalid={errors.state ? true : undefined}
                aria-describedby={errors.state ? 'state-error' : undefined}
              />
              {errors.state && (
                <p id="state-error" className="text-xs text-destructive" role="alert">
                  {errors.state}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="zip">
                ZIP / Postal code <span aria-hidden>*</span>
              </Label>
              <Input
                id="zip"
                name="zip"
                type="text"
                autoComplete="postal-code"
                defaultValue={values.zip}
                aria-invalid={errors.zip ? true : undefined}
                aria-describedby={errors.zip ? 'zip-error' : undefined}
              />
              {errors.zip && (
                <p id="zip-error" className="text-xs text-destructive" role="alert">
                  {errors.zip}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="country">
                Country <span aria-hidden>*</span>
              </Label>
              <Input
                id="country"
                name="country"
                type="text"
                autoComplete="country-name"
                defaultValue={values.country}
                aria-invalid={errors.country ? true : undefined}
                aria-describedby={errors.country ? 'country-error' : undefined}
                placeholder="United States"
              />
              {errors.country && (
                <p id="country-error" className="text-xs text-destructive" role="alert">
                  {errors.country}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-2">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Saving...' : 'Continue to Shipping'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
