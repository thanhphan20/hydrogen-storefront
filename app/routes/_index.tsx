import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  CollectionFragment,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {Button} from '~/components/ui/button';
import {Skeleton} from '~/components/ui/skeleton';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Hydrogen | Premium Mechanical Keyboards'}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections: carouselCollections}, {products: newArrivals}] =
    await Promise.all([
      context.storefront.query(HERO_CAROUSEL_QUERY),
      context.storefront.query(NEW_ARRIVALS_QUERY),
    ]);

  return {
    carouselCollections: carouselCollections.nodes,
    newArrivals: newArrivals.nodes,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const {carouselCollections, newArrivals, recommendedProducts} =
    useLoaderData<typeof loader>();
  const featuredCollection = carouselCollections[0];

  return (
    <div className="home flex flex-col gap-24 pb-24">
      <HeroCarousel collections={carouselCollections} />

      <section className="px-6 reveal">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            New arrivals
          </h2>
          <Link
            to="/collections/all"
            className="group text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all{' '}
            <span className="inline-block transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {newArrivals.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="px-6 reveal">
        <div className="max-w-7xl mx-auto rounded-xl border border-border bg-card overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="flex-1 flex flex-col justify-center gap-6 p-10 md:p-16">
            <span className="text-sm text-muted-foreground">
              Featured collection
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              {featuredCollection?.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              High-performance components engineered for enthusiasts. Limited
              availability.
            </p>
            <Button asChild variant="outline" className="w-fit mt-4">
              <Link to={`/collections/${featuredCollection?.handle}`}>
                Shop collection
              </Link>
            </Button>
          </div>
          <div className="flex-1 aspect-[4/5] md:aspect-auto overflow-hidden bg-secondary">
            {featuredCollection?.image && (
              <Image
                data={featuredCollection.image}
                className="w-full h-full object-cover"
                sizes="(min-width: 45em) 50vw, 100vw"
              />
            )}
          </div>
        </div>
      </section>

      <section className="px-6 reveal">
        <div className="flex items-end justify-between mb-10 border-b border-border pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recommended
          </h2>
          <span className="text-sm text-muted-foreground">
            Curated for you
          </span>
        </div>
        <Suspense fallback={<RecommendedSkeleton />}>
          <Await resolve={recommendedProducts}>
            {(response) => (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                {response?.products.nodes.map((product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </section>
    </div>
  );
}

import {
  Carousel as ShadcnCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';

function HeroCarousel({
  collections,
}: {
  collections: CollectionFragment[];
}) {
  return (
    <ShadcnCarousel opts={{loop: true}} className="w-full">
      <CarouselContent className="ml-0">
        {collections.map((collection) => (
          <CarouselItem key={collection.id} className="pl-0">
            <div className="relative h-[80vh] w-full overflow-hidden bg-card">
              {collection?.image && (
                <Image
                  data={collection.image}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="100vw"
                  loading="eager"
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent p-8 md:p-12">
                <div className="flex max-w-2xl flex-col gap-4">
                  <span className="text-sm text-white/70">Limited edition</span>
                  <h1 className="text-5xl font-semibold tracking-tighter text-white md:text-7xl">
                    {collection.title}
                  </h1>
                  <Button asChild className="mt-6 w-fit h-11 px-6">
                    <Link to={`/collections/${collection.handle}`}>
                      Explore collection
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute right-8 bottom-8 z-20 flex gap-3 md:right-12 md:bottom-12">
        <CarouselPrevious className="static size-10 translate-y-0 rounded-md border border-white/20 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-black" />
        <CarouselNext className="static size-10 translate-y-0 rounded-md border border-white/20 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white hover:text-black" />
      </div>
    </ShadcnCarousel>
  );
}
function RecommendedSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

const HERO_CAROUSEL_QUERY = `#graphql
  query HeroCarousel($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 3, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        image {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCT_FRAGMENT = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    variants(first: 1) {
      nodes {
        id
      }
    }
  }
` as const;

const NEW_ARRIVALS_QUERY = `#graphql
  ${RECOMMENDED_PRODUCT_FRAGMENT}
  query NewArrivals($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${RECOMMENDED_PRODUCT_FRAGMENT}
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: RELEVANCE) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
