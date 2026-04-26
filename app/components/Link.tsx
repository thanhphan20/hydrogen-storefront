import {
  Link as RemixLink,
  NavLink as RemixNavLink,
  type NavLinkProps as RemixNavLinkProps,
  type LinkProps as RemixLinkProps,
} from 'react-router';
import {getRegion} from '~/lib/cookie';

type LinkProps = Omit<RemixLinkProps, 'className'> & {
  className?: RemixNavLinkProps['className'] | RemixLinkProps['className'];
};

export function Link(props: LinkProps) {
  const {to, className, ...resOfProps} = props;
  const selectedRegion = getRegion();

  let toWithRegion = to;
  if (typeof toWithRegion === 'string' && selectedRegion.pathPrefix) {
    if (!toWithRegion.toLowerCase().startsWith(selectedRegion.pathPrefix)) {
      toWithRegion = `/${selectedRegion.pathPrefix}${to}`;
    }
  }

  if (typeof className === 'function') {
    return (
      <RemixNavLink to={toWithRegion} className={className} {...resOfProps} />
    );
  }

  return <RemixLink to={toWithRegion} className={className} {...resOfProps} />;
}
