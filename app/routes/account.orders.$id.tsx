import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  await customerAccount.handleAuthStatus();
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<
          typeof firstDiscount,
          {__typename: 'MoneyV2'}
        >)
      : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (
          firstDiscount as Extract<
            typeof firstDiscount,
            {__typename: 'PricingPercentageValue'}
          >
        ).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  return (
    <div className="account-order">
      <h2 className="text-2xl font-semibold tracking-tight">
        Order {order.name}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Placed on {new Date(order.processedAt!).toDateString()}
      </p>
      {order.confirmationNumber && (
        <p className="text-sm text-muted-foreground">
          Confirmation: {order.confirmationNumber}
        </p>
      )}
      <div className="mt-8 space-y-8">
        <table className="w-full overflow-hidden rounded-lg border border-border bg-card text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3 font-medium" scope="col">Product</th>
              <th className="p-3 font-medium" scope="col">Price</th>
              <th className="p-3 font-medium" scope="col">Quantity</th>
              <th className="p-3 font-medium" scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot>
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr className="border-t border-border">
                <th className="p-3 text-left font-medium" scope="row" colSpan={3}>
                  <p>Discounts</p>
                </th>
                <th className="sr-only" scope="row">
                  <p>Discounts</p>
                </th>
                <td className="p-3">
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && <Money data={discountValue!} />
                  )}
                </td>
              </tr>
            )}
            <tr className="border-t border-border">
              <th className="p-3 text-left font-medium" scope="row" colSpan={3}>
                <p>Subtotal</p>
              </th>
              <th className="sr-only" scope="row">
                <p>Subtotal</p>
              </th>
              <td className="p-3">
                <Money data={order.subtotal!} />
              </td>
            </tr>
            <tr className="border-t border-border">
              <th className="p-3 text-left font-medium" scope="row" colSpan={3}>
                Tax
              </th>
              <th className="sr-only" scope="row">
                <p>Tax</p>
              </th>
              <td className="p-3">
                <Money data={order.totalTax!} />
              </td>
            </tr>
            <tr className="border-t border-border">
              <th className="p-3 text-left font-semibold" scope="row" colSpan={3}>
                Total
              </th>
              <th className="sr-only" scope="row">
                <p>Total</p>
              </th>
              <td className="p-3 font-semibold">
                <Money data={order.totalPrice!} />
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-lg font-semibold tracking-tight">Shipping address</h3>
          {order?.shippingAddress ? (
            <address className="mt-3 text-sm not-italic text-muted-foreground">
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : (
                ''
              )}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : (
                ''
              )}
            </address>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No shipping address defined
            </p>
          )}
          <h3 className="mt-6 text-lg font-semibold tracking-tight">Status</h3>
          <div className="mt-2 text-sm text-muted-foreground">
            <p>{fulfillmentStatus}</p>
          </div>
        </div>
      </div>
      <p className="mt-8">
        <a target="_blank" href={order.statusPageUrl} rel="noreferrer">
          View order status →
        </a>
      </p>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr key={lineItem.id} className="border-b border-border last:border-b-0">
      <td className="p-3">
        <div className="flex items-center gap-3">
          {lineItem?.image && (
            <div>
              <Image
                data={lineItem.image}
                width={96}
                height={96}
                className="rounded-md border border-border bg-card"
              />
            </div>
          )}
          <div>
            <p className="font-medium">{lineItem.title}</p>
            <small className="text-muted-foreground">{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td className="p-3">
        <Money data={lineItem.price!} />
      </td>
      <td className="p-3">{lineItem.quantity}</td>
      <td className="p-3">
        <Money data={lineItem.totalDiscount!} />
      </td>
    </tr>
  );
}
