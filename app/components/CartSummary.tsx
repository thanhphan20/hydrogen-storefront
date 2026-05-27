import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher, Link} from 'react-router';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Ticket, Gift, ArrowRight, X} from 'lucide-react';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const summaryId = useId();
  const discountsHeadingId = useId();
  const discountCodeInputId = useId();
  const giftCardHeadingId = useId();
  const giftCardInputId = useId();

  return (
    <div aria-labelledby={summaryId} className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-bold text-lg">
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart?.cost?.subtotalAmount} />
            ) : (
              '-'
            )}
          </span>
        </div>
        
        <div className="space-y-3">
          <CartDiscounts
            discountCodes={cart?.discountCodes}
            discountsHeadingId={discountsHeadingId}
            discountCodeInputId={discountCodeInputId}
          />
          <CartGiftCard
            giftCardCodes={cart?.appliedGiftCards}
            giftCardHeadingId={giftCardHeadingId}
            giftCardInputId={giftCardInputId}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-black/5">
        <CartCheckoutActions />
        <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider mt-4 font-semibold">
          Shipping & taxes calculated at checkout
        </p>
      </div>
    </div>
  );
}

function CartCheckoutActions() {
  return (
    <Button asChild className="w-full h-12 text-base font-bold uppercase tracking-widest mb-4">
      <Link to="/checkout" className="flex items-center justify-center gap-2 text-white">
        Checkout
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

function CartDiscounts({
  discountCodes,
  discountsHeadingId,
  discountCodeInputId,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  discountsHeadingId: string;
  discountCodeInputId: string;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="space-y-2">
      {/* Have existing discount, display it with a remove option */}
      {codes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {codes.map((code) => (
            <UpdateDiscountForm key={code} discountCodes={[]}>
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">
                <Ticket className="h-3 w-3" />
                <span>{code}</span>
                <button type="submit" className="ml-1 hover:text-green-900 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            </UpdateDiscountForm>
          ))}
        </div>
      )}

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              id={discountCodeInputId}
              type="text"
              name="discountCode"
              placeholder="Discount code"
              className="pl-9 h-10 text-sm"
            />
          </div>
          <Button type="submit" variant="outline" className="h-10 px-4 text-xs font-bold uppercase tracking-wider">
            Apply
          </Button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
  giftCardHeadingId,
  giftCardInputId,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
  giftCardHeadingId: string;
  giftCardInputId: string;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  useEffect(() => {
    if (giftCardAddFetcher.data && giftCardCodeInput.current) {
      giftCardCodeInput.current.value = '';
    }
  }, [giftCardAddFetcher.data]);

  return (
    <div className="space-y-2">
      {giftCardCodes && giftCardCodes.length > 0 && (
        <div className="space-y-2">
          {giftCardCodes.map((giftCard) => (
            <div key={giftCard.id} className="flex justify-between items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs font-bold border border-blue-100">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                <span>Ending in {giftCard.lastCharacters}</span>
                <span className="text-blue-500">•</span>
                <Money data={giftCard.amountUsed} />
              </div>
              <RemoveGiftCardForm giftCardId={giftCard.id}>
                <button type="submit" className="hover:text-blue-900 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </RemoveGiftCardForm>
            </div>
          ))}
        </div>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              id={giftCardInputId}
              type="text"
              name="giftCardCode"
              placeholder="Gift card"
              ref={giftCardCodeInput}
              className="pl-9 h-10 text-sm"
            />
          </div>
          <Button 
            type="submit" 
            variant="outline" 
            className="h-10 px-4 text-xs font-bold uppercase tracking-wider"
            disabled={giftCardAddFetcher.state !== 'idle'}
          >
            Add
          </Button>
        </div>
      </AddGiftCardForm>
    </div>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
