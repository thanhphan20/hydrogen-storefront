import {Link} from "~/components/Link";
import {Drawer} from "~/components/Drawer";
import {HeaderProps} from '~/components/Header';

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
              <Link
                className="header-menu-item"
                key={item.id}
                onClick={onClose}
                prefetch="intent"
                to={url}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </Drawer>
  );
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
