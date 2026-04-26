import type {Region} from "~/type/locale"
import {getRegion} from '~/lib/cookie';

export function usePrefixPathWithRegion(path: string) {
    const selectedRegion = getRegion();

    return `${(selectedRegion as Region).pathPrefix}${
      path.startsWith('/') ? path : '/' + path
    }`;
  }
