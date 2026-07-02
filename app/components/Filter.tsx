import type {SyntheticEvent} from 'react';
import {useMemo, useState, useEffect} from 'react';
import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from 'react-router';
import {Plus, ChevronDown, X} from 'lucide-react';
import {FILTER_URL_PREFIX, PRICE_RANGE_FILTER_DEBOUNCE} from '~/constants/url';
import type {
  Filter,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';
import type {AppliedFilter, SortParam} from '~/type/params';
import {
  getAppliedFilterLink,
  getSortLink,
  getFilterLink,
  filterInputToParams,
} from '~/helpers/filterLink';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';

type Props = {
  filters: Filter[];
  appliedFilters?: AppliedFilter[];
  children: React.ReactNode;
  collections?: Array<{handle: string; title: string}>;
};

export function SortFilter({
  filters,
  appliedFilters = [],
  children,
  collections = [],
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="flex w-full items-center justify-between py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-8 w-8"
        >
          <Plus className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
        </Button>
        <SortMenu />
      </div>
      <div className="flex flex-col flex-wrap md:flex-row">
        <div
          className={`transition-all duration-200 ${
            isOpen
              ? 'max-h-full min-w-full opacity-100 md:w-[240px] md:min-w-[240px] md:pr-8'
              : 'max-h-0 pr-0 opacity-0 md:max-h-full md:w-[0px] md:min-w-[0px]'
          }`}
        >
          <FiltersDrawer filters={filters} appliedFilters={appliedFilters} />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </>
  );
}

export function FiltersDrawer({
  filters = [],
  appliedFilters = [],
}: Omit<Props, 'children'>) {
  const [params] = useSearchParams();
  const location = useLocation();

  const filterMarkup = (filter: Filter, option: Filter['values'][0]) => {
    switch (filter.type) {
      case 'PRICE_RANGE':
        const priceFilter = params.get(`${FILTER_URL_PREFIX}price`);
        const price = priceFilter
          ? (JSON.parse(priceFilter) as ProductFilter['price'])
          : undefined;
        const min = isNaN(Number(price?.min)) ? undefined : Number(price?.min);
        const max = isNaN(Number(price?.max)) ? undefined : Number(price?.max);

        return <PriceRangeFilter min={min} max={max} />;

      default:
        const to = getFilterLink(option.input as string, params, location);
        return (
          <Link
            className="hover:underline focus:underline"
            prefetch="intent"
            to={to}
          >
            {option.label}
          </Link>
        );
    }
  };

  return (
    <nav className="py-8">
      {appliedFilters.length > 0 ? (
        <div className="pb-8">
          <AppliedFilters filters={appliedFilters} />
        </div>
      ) : null}

      <h4 className="pb-4 text-sm font-medium">Filter by</h4>
      <Accordion type="multiple" className="w-full">
        {filters.map((filter: Filter) => (
          <AccordionItem key={filter.id} value={filter.id}>
            <AccordionTrigger className="py-4 text-left">
              {filter.label}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="py-2">
                {filter.values?.map((option) => (
                  <li key={option.id} className="pb-4">
                    {filterMarkup(filter, option)}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </nav>
  );
}

function AppliedFilters({filters = []}: {filters: AppliedFilter[]}) {
  const [params] = useSearchParams();
  const location = useLocation();
  return (
    <>
      <h4 className="pb-4 text-sm font-medium">Applied filters</h4>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter: AppliedFilter) => (
          <Link
            to={getAppliedFilterLink(filter, params, location)}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            key={`${filter.label}-${JSON.stringify(filter.filter)}`}
          >
            <span>{filter.label}</span>
            <X className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </>
  );
}

function PriceRangeFilter({max, min}: {max?: number; min?: number}) {
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const navigate = useNavigate();

  const [minPrice, setMinPrice] = useState(min);
  const [maxPrice, setMaxPrice] = useState(max);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (minPrice === undefined && maxPrice === undefined) {
        params.delete(`${FILTER_URL_PREFIX}price`);
        void navigate(`${location.pathname}?${params.toString()}`);
        return;
      }

      const price = {
        ...(minPrice === undefined ? {} : {min: minPrice}),
        ...(maxPrice === undefined ? {} : {max: maxPrice}),
      };
      const newParams = filterInputToParams({price}, params);
      void navigate(`${location.pathname}?${newParams.toString()}`);
    }, PRICE_RANGE_FILTER_DEBOUNCE);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice, params, location.pathname, navigate]);

  const onChangeMax = (event: SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const newMaxPrice = Number.isNaN(parseFloat(value))
      ? undefined
      : parseFloat(value);
    setMaxPrice(newMaxPrice);
  };

  const onChangeMin = (event: SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    const newMinPrice = Number.isNaN(parseFloat(value))
      ? undefined
      : parseFloat(value);
    setMinPrice(newMinPrice);
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">From</span>
        <Input
          name="minPrice"
          type="number"
          value={minPrice ?? ''}
          placeholder="$ Min"
          onChange={onChangeMin}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">To</span>
        <Input
          name="maxPrice"
          type="number"
          value={maxPrice ?? ''}
          placeholder="$ Max"
          onChange={onChangeMax}
        />
      </div>
    </div>
  );
}

export default function SortMenu() {
  const items: {label: string; key: SortParam}[] = [
    {label: 'Featured', key: 'featured'},
    {label: 'Price: Low - High', key: 'price-low-high'},
    {label: 'Price: High - Low', key: 'price-high-low'},
    {label: 'Best Selling', key: 'best-selling'},
    {label: 'Newest', key: 'newest'},
  ];
  const [params] = useSearchParams();
  const location = useLocation();
  const activeItem = items.find((item) => item.key === params.get('sort'));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground">Sort by:</span>
          <span>{(activeItem || items[0]).label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {items.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            <Link
              to={getSortLink(item.key, params, location)}
              className={`w-full cursor-pointer ${
                activeItem?.key === item.key ? 'font-medium text-foreground' : ''
              }`}
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
