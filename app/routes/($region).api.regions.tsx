import {generateCacheControlHeader, CacheLong} from '@shopify/hydrogen';
import {json} from '@shopify/remix-oxygen';
import {regions} from '~/constants/regions'

export async function loader() {
  return json(
    {...regions},
    {headers: {'cache-control': generateCacheControlHeader(CacheLong())}},
  );
}

// no-op
export default function CountriesApiRoute() {
  return null;
}
