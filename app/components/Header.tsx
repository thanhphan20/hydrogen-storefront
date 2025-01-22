import {Suspense, useState} from 'react';
import {Await, useAsyncValue} from '@remix-run/react';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import { HiMiniBars3, HiMagnifyingGlass } from "react-icons/hi2";
import { FaShoppingCart } from "react-icons/fa"; 
import { MenuDrawer } from '~/components/MenuDrawer';
import { CartDrawer } from '~/components/CartDrawer';
import { SearchDrawer } from '~/components/SearchDrawer';
import {Link} from '~/components/Link';

export interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const {shop, menu} = header;
  return (
    <header className="header justify-between">
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart}/>
      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <button className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMenuOpen(true)}>
        <HiMiniBars3/> Menu
      </button>
      <MenuDrawer
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        menu={menu}
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <Link prefetch="intent" to="/">
        <strong>{shop.name}</strong>
      </Link>
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} openCart={() => setIsCartOpen(true)} openSearch={() => setIsSearchOpen(true)}/>
    </header>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
  openCart,
  openSearch,
}: {
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  openCart: () => void;
  openSearch: () => void;
}) {
  return (
    <nav className="flex items-center gap-2" role="navigation">
      <Link prefetch="intent" to="/account">
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </Link>
      <SearchToggle openSearch={openSearch} />
      <CartToggle cart={cart} openCart={openCart}/>
    </nav>
  );
}

function SearchToggle({openSearch} : {openSearch: () => void}) {
  return (
    <button className="flex items-center gap-2 cursor-pointer" onClick={openSearch}>
      <HiMagnifyingGlass/> Search
    </button>
  );
}

function CartBadge({
  count, 
  openCart
}: {
  count: number | null;
  openCart: () => void;
}) {
  return (
    <button className="flex items-center gap-2 cursor-pointer" onClick={openCart}>
      <FaShoppingCart/> {count === null ? <span>&nbsp;</span> : `(${count})`}
    </button>
  );
}

function CartToggle({cart, openCart}: {
  cart: Promise<CartApiQueryFragment | null>;
  openCart: () => void;
}) {
  return (
    <Suspense fallback={<CartBadge count={null} openCart={openCart}/>}>
      <Await resolve={cart}>
        <CartBanner openCart={openCart}/>
      </Await>
    </Suspense>
  );
}

function CartBanner({openCart}: {openCart: () => void}) {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} openCart={openCart} />;
}
