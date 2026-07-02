import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';

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
        {(footer) => (
          <footer className="bg-background border-t border-border pt-16 pb-8 px-6 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {header.shop.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Premium mechanical keyboard components for enthusiasts
                  worldwide.
                </p>
              </div>
              {footer?.menu && header.shop.primaryDomain?.url && (
                <FooterMenu
                  menu={footer.menu}
                  primaryDomainUrl={header.shop.primaryDomain.url}
                  publicStoreDomain={publicStoreDomain}
                />
              )}
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-medium text-foreground">Contact</h4>
                <p className="text-sm text-muted-foreground">
                  support@kbdfans.com
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-sm font-medium text-foreground">
                  Newsletter
                </h4>
                <div className="flex gap-2">
                  <Input type="email" placeholder="Email address" />
                  <Button variant="secondary" size="default">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <p>
                © {new Date().getFullYear()} {header.shop.name}. All rights
                reserved.
              </p>
              <div className="flex gap-4">
                <span>Visa</span>
                <span>Mastercard</span>
                <span>Amex</span>
                <span>PayPal</span>
              </div>
            </div>
          </footer>
        )}
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
    <nav className="flex flex-col gap-4" role="navigation">
      <h4 className="text-sm font-medium text-foreground">Quick links</h4>
      <div className="flex flex-col gap-2">
        {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
          if (!item.url) return null;

          let url = item.url;
          try {
            const parsedItemUrl = new URL(item.url);
            const primaryDomainHost = new URL(primaryDomainUrl).hostname;
            const itemHost = parsedItemUrl.hostname;
            const isMyshopifyHost =
              itemHost === 'myshopify.com' ||
              itemHost.endsWith('.myshopify.com');
            const isAllowedHost =
              isMyshopifyHost ||
              itemHost === publicStoreDomain ||
              itemHost === primaryDomainHost;

            if (isAllowedHost) {
              url =
                parsedItemUrl.pathname +
                parsedItemUrl.search +
                parsedItemUrl.hash;
            }
          } catch {
            url = item.url;
          }

          const isExternal = !url.startsWith('/');
          return isExternal ? (
            <a
              href={url}
              key={item.id}
              rel="noopener noreferrer"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.title}
            </a>
          ) : (
            <NavLink
              end
              key={item.id}
              prefetch="intent"
              to={url}
              className={({isActive}) =>
                `text-sm transition-colors ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {item.title}
            </NavLink>
          );
        })}
      </div>
    </nav>
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
