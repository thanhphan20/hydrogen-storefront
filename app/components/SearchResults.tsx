import {Link} from 'react-router';
import {Image, Money, Pagination} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import {Button} from '~/components/ui/button';
import {Skeleton} from '~/components/ui/skeleton';
import {Search} from 'lucide-react';

type SearchItems = RegularSearchReturn['result']['items'];
type PartialSearchResult<ItemType extends keyof SearchItems> = Pick<
  SearchItems,
  ItemType
> &
  Pick<RegularSearchReturn, 'term'>;

type SearchResultsProps = RegularSearchReturn & {
  children: (args: SearchItems & {term: string}) => React.ReactNode;
};

export function SearchResults({
  term,
  result,
  children,
}: Omit<SearchResultsProps, 'error' | 'type'>) {
  if (!result?.total) {
    return null;
  }

  return children({...result.items, term});
}

SearchResults.Articles = SearchResultsArticles;
SearchResults.Pages = SearchResultsPages;
SearchResults.Products = SearchResultsProducts;
SearchResults.Empty = SearchResultsEmpty;

function SearchResultsArticles({
  term,
  articles,
}: PartialSearchResult<'articles'>) {
  if (!articles?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className="text-xl font-semibold tracking-tight">Articles</h2>
      <div className="space-y-2">
        {articles?.nodes?.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.handle}`,
            trackingParams: article.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={article.id}>
              <Link prefetch="intent" to={articleUrl}>
                {article.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsPages({term, pages}: PartialSearchResult<'pages'>) {
  if (!pages?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className="text-xl font-semibold tracking-tight">Pages</h2>
      <div className="space-y-2">
        {pages?.nodes?.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term,
          });

          return (
            <div className="search-results-item" key={page.id}>
              <Link prefetch="intent" to={pageUrl}>
                {page.title}
              </Link>
            </div>
          );
        })}
      </div>
      <br />
    </div>
  );
}

function SearchResultsProducts({
  term,
  products,
}: PartialSearchResult<'products'>) {
  if (!products?.nodes.length) {
    return null;
  }

  return (
    <div className="search-result">
      <h2 className="text-xl font-semibold tracking-tight">Products</h2>
      <Pagination connection={products}>
        {({nodes, isLoading, NextLink, PreviousLink}) => {
          const ItemsMarkup = nodes.map((product) => {
            const productUrl = urlWithTrackingParams({
              baseUrl: `/products/${product.handle}`,
              trackingParams: product.trackingParameters,
              term,
            });

            const price = product?.selectedOrFirstAvailableVariant?.price;
            const image = product?.selectedOrFirstAvailableVariant?.image;

            return (
              <div className="search-results-item" key={product.id}>
                <Link prefetch="intent" to={productUrl}>
                  {image && (
                    <Image
                      data={image}
                      alt={product.title}
                      width={64}
                      className="rounded-md border border-border bg-card"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{product.title}</p>
                    <small className="text-sm text-muted-foreground">
                      {price && <Money data={price} />}
                    </small>
                  </div>
                </Link>
              </div>
            );
          });

          return (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <PreviousLink>
                    {isLoading ? 'Loading...' : <span>Load previous</span>}
                  </PreviousLink>
                </Button>
              </div>
              <div className="space-y-2">
                {isLoading ? <SearchResultsSkeleton /> : ItemsMarkup}
              </div>
              <div className="flex justify-center">
                <Button asChild variant="outline" size="sm">
                  <NextLink>
                    {isLoading ? 'Loading...' : <span>Load more</span>}
                  </NextLink>
                </Button>
              </div>
            </div>
          );
        }}
      </Pagination>
      <br />
    </div>
  );
}

function SearchResultsSkeleton() {
  const skeletonRows = ['first', 'second', 'third', 'fourth'];

  return (
    <div className="space-y-2" aria-hidden="true">
      {skeletonRows.map((row) => (
        <div
          key={row}
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-3"
        >
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchResultsEmpty({term}: {term?: string}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">
        {term ? (
          <>
            No results for <q>{term}</q>
          </>
        ) : (
          'Search the store'
        )}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {term
          ? 'Try a different product name, collection, or keyword.'
          : 'Enter a product, collection, article, or page name to start.'}
      </p>
    </div>
  );
}
