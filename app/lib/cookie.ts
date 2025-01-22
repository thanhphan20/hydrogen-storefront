import Cookies from 'js-cookie';
import {Region} from '~/type/locale';

export interface CookieOptions {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

export function setRegion(region: Region) {
  Cookies.set('region', JSON.stringify(region), { expires: 7, path: '/' });
}

export function getRegion() : Region {
    const region = Cookies.get('region');
    return region ? JSON.parse(region) as Region : {} as Region;
}

export function clearRegion() {
  Cookies.remove('region', { path: '/' });
}

export const setCookie = (name: string, value: string, options?: CookieOptions) => {
  Cookies.set(name, value, options);
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string, options?: CookieOptions) => {
  Cookies.remove(name, options);
};
