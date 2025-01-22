import {useLocation} from '@remix-run/react';

export function isRegionNA(): boolean {
  const { pathname } = useLocation();
  return pathname.startsWith('/na/');
}
