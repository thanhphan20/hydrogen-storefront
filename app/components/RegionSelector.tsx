import {useFetcher, useLocation, useNavigate} from 'react-router';
import type {Region, Regions} from '~/type/locale';
import {useEffect, useState} from 'react';
import {getRegion, setRegion} from '~/lib/cookie';

export function RegionSelector() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const {pathname, search} = useLocation();
  const [regions, setRegions] = useState<Regions>({});
  const selectedRegion = getRegion();

  useEffect(() => {
    if (!fetcher.data) {
      fetcher.load('/api/regions');
      return;
    }
    setRegions(fetcher.data as Regions);
  }, [fetcher.data]);

  const pathWithoutRegion = `${pathname.replace(
    (selectedRegion as Region)?.pathPrefix || '',
    '',
  )}${search}`.replace(/\/{2,}/g, '/');

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pathPrefix = event.target.value;
    const regionLocale = regions[pathPrefix];

    if (regionLocale) {
      const regionUrlPath = getRegionUrlPath({
        regionLocale,
        pathWithoutRegion,
      });
      setRegion(regionLocale);
      navigate(regionUrlPath);
    }
  };

  return (
    <section
      className="grid w-full gap-4"
    >
      <h3 className="cursor-default">
        Region
      </h3>
      <div className="relative">
        <div className="w-full overflow-auto border-t border-contrast/30 dark:border-white bg-contrast/30 max-h-36">
        <select
          value={(selectedRegion as Region)?.pathPrefix || ''}
          onChange={handleRegionChange}
          className="w-full p-2 border rounded"
        >
          {Object.keys(regions).map((regionKey) => {
            const region = regions[regionKey];
            return (
              <option key={regionKey} value={region.pathPrefix}>
                {region.label}
              </option>
            );
          })}
        </select>
        </div>
      </div>
    </section>
  );
}

function getRegionUrlPath({
  regionLocale,
  pathWithoutRegion,
}: {
  regionLocale: Region;
  pathWithoutRegion: string;
}) {
  let regionPrefixPath = '';

  if (regionLocale.region === 'NA') {
    regionPrefixPath = `/na`;
  }

  return `${regionPrefixPath}${pathWithoutRegion}`.replace(/\/{2,}/g, '/');
}

