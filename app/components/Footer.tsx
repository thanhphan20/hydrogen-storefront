import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => {
          if (!footer?.menu) return null;
          return (
            <footer className={`footer min-h-[12rem] p-6`}>
              {footer.menu && header.shop.primaryDomain?.url && (
                <FooterMenu
                  menu={footer.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              )}
            </footer>
        )}}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="footer-menu" role="navigation">
      {(menu?.items || FALLBACK_FOOTER_MENU.items).map((item) => (
        <div key={item.id} className="flex items-start justify-start flex-col gap-3 w-1/3">
          <div>
            <FooterLink
              item={item}
              url={
                item.url!.includes('myshopify.com') ||
                item.url!.includes(publicStoreDomain) ||
                item.url!.includes(primaryDomainUrl)
                  ? new URL(item.url!).pathname
                  : item.url
              }
              isExternal={!item.url!.startsWith('/')}
            />
          </div>

          {/* Map through nested items if any */}
          {item.items && item.items.length > 0 && (
            <div className="flex items-start flex-col gap-1">
              {item.items.map((subItem) => (
                <FooterLink
                  key={subItem.id}
                  item={subItem}
                  url={
                    subItem.url!.includes('myshopify.com') ||
                    subItem.url!.includes(publicStoreDomain) ||
                    subItem.url!.includes(primaryDomainUrl)
                      ? new URL(subItem.url!).pathname
                      : subItem.url
                  }
                  isExternal={!subItem.url!.startsWith('/')}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

function FooterLink({
  item,
  url,
  isExternal,
}: {
  item: any;
  url: any;
  isExternal: boolean;
}) {
  return isExternal ? (
    <a href={url} rel="noopener noreferrer" target="_blank">
      {item.title}
    </a>
  ) : (
    <NavLink end prefetch="intent" style={activeLinkStyle} to={url}>
      {item.title}
    </NavLink>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    color: isPending ? 'grey' : 'white',
  };
}
