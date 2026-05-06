import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from '~/components/CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {Minus, Plus, Trash2} from 'lucide-react';
import {ProductPrice} from './ProductPrice';
import {useAside} from './Aside';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';
import {Button} from '~/components/ui/button';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

/**
 * A single line item in the cart. It displays the product image, title, price.
 * It also provides controls to update the quantity or remove the line item.
 * If the line is a parent line that has child components (like warranties or gift wrapping), they are
 * rendered nested below the parent line.
 */
export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li key={id} className="flex flex-col py-6 border-b border-black/[0.03] last:border-0">
      <div className="flex gap-4">
        {image && (
          <Link
            to={lineItemUrl}
            onClick={() => layout === 'aside' && close()}
            className="flex-shrink-0"
          >
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={100}
              loading="lazy"
              width={100}
              className="rounded-lg object-cover bg-gray-50 border border-black/5"
            />
          </Link>
        )}

        <div className="flex-1 flex flex-col justify-between py-0.5">
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-2">
              <Link
                prefetch="intent"
                to={lineItemUrl}
                onClick={() => layout === 'aside' && close()}
                className="group"
              >
                <h3 className="font-bold text-sm leading-tight group-hover:underline decoration-1 underline-offset-2">
                  {product.title}
                </h3>
              </Link>
              <CartLineRemoveButton lineIds={[id]} disabled={!!line.isOptimistic} />
            </div>

            <div className="text-sm font-medium">
              <ProductPrice price={line?.cost?.totalAmount} />
            </div>

            <ul className="flex flex-wrap gap-x-2 gap-y-1">
              {selectedOptions.map((option) => (
                <li key={option.name} className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                  {option.name}: <span className="text-gray-600">{option.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <CartLineQuantity line={line} />
          </div>
        </div>
      </div>

      {lineItemChildren ? (
        <div className="mt-4 pl-8 border-l border-black/5 ml-12">
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="space-y-4">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-gray-50 border border-black/5 rounded-full p-0.5">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm transition-all"
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </CartLineUpdateButton>
        <span className="w-8 text-center text-[13px] font-bold">{quantity}</span>
        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full hover:bg-white hover:shadow-sm transition-all"
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </CartLineUpdateButton>
      </div>
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="text-gray-400 hover:text-red-500 transition-colors p-1"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
