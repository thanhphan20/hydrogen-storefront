import {Link, useFetcher, type Fetcher} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import React, {useRef, useEffect} from 'react';
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '~/lib/search';
import {useAside} from './Aside';
import {Search, FileText, LayoutGrid, Layers} from 'lucide-react';

type PredictiveSearchItems = PredictiveSearchReturn['result']['items'];

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>;
  total: number;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  items: PredictiveSearchItems;
  fetcher: Fetcher<PredictiveSearchReturn>;
};

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state'];
  closeSearch: () => void;
};

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> &
  Pick<SearchResultsPredictiveArgs, ExtraProps>;

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode;
};

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({
  children,
}: SearchResultsPredictiveProps) {
  const aside = useAside();
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch();

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur();
      inputRef.current.value = '';
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput();
    aside.close();
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  });
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles;
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections;
SearchResultsPredictive.Pages = SearchResultsPredictivePages;
SearchResultsPredictive.Products = SearchResultsPredictiveProducts;
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries;
SearchResultsPredictive.Empty = SearchResultsPredictiveEmpty;

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  if (!articles.length) return null;

  return (
    <div className="space-y-4" key="articles">
      <div className="flex items-center gap-2 px-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <h5 className="m-0 text-xs font-medium text-muted-foreground">
          Articles
        </h5>
      </div>
      <ul className="grid grid-cols-1 gap-2">
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          });

          return (
            <li key={article.id}>
              <Link
                onClick={closeSearch}
                to={articleUrl}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent transition-colors group"
              >
                {article.image?.url ? (
                  <Image
                    alt={article.image.altText ?? ''}
                    src={article.image.url}
                    width={48}
                    height={48}
                    className="rounded-md object-cover bg-card border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm font-medium group-hover:underline decoration-1 underline-offset-4">
                  {article.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  if (!collections.length) return null;

  return (
    <div className="space-y-4" key="collections">
      <div className="flex items-center gap-2 px-2">
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        <h5 className="m-0 text-xs font-medium text-muted-foreground">
          Collections
        </h5>
      </div>
      <ul className="grid grid-cols-1 gap-2">
        {collections.map((collection) => {
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`,
            trackingParams: collection.trackingParameters,
            term: term.current,
          });

          return (
            <li key={collection.id}>
              <Link
                onClick={closeSearch}
                to={collectionUrl}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent transition-colors group"
              >
                {collection.image?.url ? (
                  <Image
                    alt={collection.image.altText ?? ''}
                    src={collection.image.url}
                    width={48}
                    height={48}
                    className="rounded-md object-cover bg-card border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm font-medium group-hover:underline decoration-1 underline-offset-4">
                  {collection.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  if (!pages.length) return null;

  return (
    <div className="space-y-4" key="pages">
      <div className="flex items-center gap-2 px-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <h5 className="m-0 text-xs font-medium text-muted-foreground">
          Pages
        </h5>
      </div>
      <ul className="grid grid-cols-1 gap-2">
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          });

          return (
            <li key={page.id}>
              <Link
                onClick={closeSearch}
                to={pageUrl}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium group-hover:underline decoration-1 underline-offset-4">
                  {page.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  if (!products.length) return null;

  return (
    <div className="space-y-4" key="products">
      <div className="flex items-center gap-2 px-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h5 className="m-0 text-xs font-medium text-muted-foreground">
          Products
        </h5>
      </div>
      <ul className="grid grid-cols-1 gap-4">
        {products.map((product) => {
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          });

          const price = product?.selectedOrFirstAvailableVariant?.price;
          const image = product?.selectedOrFirstAvailableVariant?.image;
          return (
            <li key={product.id}>
              <Link
                to={productUrl}
                onClick={closeSearch}
                className="flex gap-4 p-2 rounded-lg hover:bg-accent transition-colors group"
              >
                {image ? (
                  <Image
                    alt={image.altText ?? ''}
                    src={image.url}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover bg-card border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col justify-center py-1">
                  <h4 className="font-medium text-sm group-hover:underline decoration-1 underline-offset-4 leading-tight mb-1">
                    {product.title}
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    {price && <Money data={price} />}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string;
}) {
  if (!queries.length) return null;

  return (
    <datalist id={queriesDatalistId}>
      {queries.map((suggestion) => {
        if (!suggestion) return null;

        return <option key={suggestion.text} value={suggestion.text} />;
      })}
    </datalist>
  );
}

function SearchResultsPredictiveEmpty({
  term,
}: {
  term: React.MutableRefObject<string>;
}) {
  if (!term.current) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
      <div className="bg-secondary rounded-full p-4 mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">
        No results found for{' '}
        <q className="font-medium text-foreground">{term.current}</q>
      </p>
    </div>
  );
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const term = useRef<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '');
  }

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]');
    }
  }, []);

  const {items, total} =
    fetcher?.data?.result ?? getEmptyPredictiveSearchResult();

  return {items, total, inputRef, term, fetcher};
}
