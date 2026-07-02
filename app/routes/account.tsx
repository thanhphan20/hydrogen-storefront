import {
  data as routerData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import type {Route} from './+types/account';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {Button} from '~/components/ui/button';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  await customerAccount.handleAuthStatus();
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return routerData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';

  return (
    <div className="account mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
      <div className="mt-6" />
      <AccountMenu />
      <div className="mt-8" />
      <Outlet context={{customer}} />
    </div>
  );
}

function AccountMenu() {
  function linkClassName({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return [
      'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-foreground',
      isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground',
      isPending ? 'opacity-70' : '',
    ].join(' ');
  }

  return (
    <nav className="flex flex-wrap items-center gap-2" role="navigation">
      <NavLink to="/account/orders" className={linkClassName}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={linkClassName}>
        Profile
      </NavLink>
      <NavLink to="/account/addresses" className={linkClassName}>
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </Form>
  );
}
