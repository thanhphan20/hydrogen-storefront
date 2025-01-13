import {Suspense, useState, useId} from 'react';
import {Await, NavLink, useAsyncValue, Link} from '@remix-run/react';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import { HiMiniBars3, HiMagnifyingGlass } from "react-icons/hi2";
import { FaShoppingCart } from "react-icons/fa"; 
import { Drawer } from "~/components/Drawer";
import { CartMain } from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

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
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <strong>{shop.name}</strong>
      </NavLink>
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} openCart={() => setIsCartOpen(true)} openSearch={() => setIsSearchOpen(true)}/>
    </header>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {

  return (
    <Drawer open={isOpen} onClose={onClose} openFrom='left'>
      <div className="grid">
        <nav className="grid gap-4" role="navigation">
          {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
            if (!item.url) return null;

            // if the url is internal, we strip the domain
            const url =
              item.url.includes('myshopify.com') ||
              item.url.includes(publicStoreDomain) ||
              item.url.includes(primaryDomainUrl)
                ? new URL(item.url).pathname
                : item.url;
            return (
              <NavLink
                className="header-menu-item"
                end
                key={item.id}
                onClick={onClose}
                prefetch="intent"
                style={activeLinkStyle}
                to={url}
              >
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </Drawer>
  );
}

function CartDrawer({
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

function SearchDrawer({
  isOpen,
  onClose,
}:  {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queriesDatalistId = useId();
  
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom='top' size='full' heading='SEARCH PRODUCTS'>
     <div className="predictive-search w-full">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <button onClick={goToSearch}>Search</button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Drawer>
  )
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
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
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

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
