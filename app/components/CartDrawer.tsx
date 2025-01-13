import {Suspense} from 'react';
import {Await} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import { Drawer } from "~/components/Drawer";
import { CartMain } from '~/components/CartMain';

export function CartDrawer({
  isOpen,
  onClose,
  cart,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: Promise<CartApiQueryFragment | null>;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom='right' heading='MY CART'>
      <div className="grid">
        <Suspense fallback="Cart loading...">
          <Await resolve={cart}>
            {(cart) => <CartMain layout="aside" cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  )
}
