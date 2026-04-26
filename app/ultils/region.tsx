import {useLocation} from 'react-router';

export function isRegionNA(): boolean {
  const { pathname } = useLocation();
  return pathname.startsWith('/na/');
}
