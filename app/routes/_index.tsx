import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  CollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';
import {Button} from '~/components/ui/button';

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

      <section className="px-6">
        <div className="flex items-end justify-between mb-10 border-b border-black pb-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            New Arrivals
          </h2>
          <Link
            to="/collections/all"
            className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-black/50 transition-colors"
          >
            View All —&gt;
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {newArrivals.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-black text-white py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Featured Collection
            </span>
            <h2 className="text-6xl font-black uppercase tracking-tighter leading-[0.9] italic">
              {featuredCollection?.title}
            </h2>
            <p className="text-sm uppercase tracking-widest text-white/60 max-w-md">
              High-performance components engineered for enthusiasts. limited
              availability.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-fit border-white text-white hover:bg-white hover:text-black mt-4"
            >
              <Link to={`/collections/${featuredCollection?.handle}`}>
                Shop Collection
              </Link>
            </Button>
          </div>
          <div className="flex-1 aspect-[4/5] overflow-hidden bg-white/5">
            {featuredCollection?.image && (
              <Image
                data={featuredCollection.image}
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                sizes="(min-width: 45em) 50vw, 100vw"
              />
            )}
          </div>
        </div>
      </section>

      <section className="px-6">
        <div className="flex items-end justify-between mb-10 border-b border-black pb-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">
            Recommended
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
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
            <div className="relative h-[80vh] w-full overflow-hidden bg-gray-100">
              {collection?.image && (
                <Image
                  data={collection.image}
                  className="absolute inset-0 h-full w-full object-cover"
                  sizes="100vw"
                  loading="eager"
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-12">
                <div className="flex max-w-2xl flex-col gap-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
                    Limited Edition
                  </span>
                  <h1 className="text-7xl font-black italic leading-[0.8] uppercase tracking-tighter text-white md:text-9xl">
                    {collection.title.split(' ').map((word: string, i: number) => (
                      <span key={i} className="block">
                        {word}
                      </span>
                    ))}
                  </h1>
                  <Button
                    asChild
                    size="lg"
                    className="mt-6 w-fit bg-white text-black hover:bg-white/90"
                  >
                    <Link to={`/collections/${collection.handle}`}>
                      Explore Collection
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="absolute right-12 bottom-12 z-20 flex gap-4">
        <CarouselPrevious className="static h-12 w-12 translate-y-0 rounded-none border-white/20 bg-white/10 text-white hover:bg-white hover:text-black" />
        <CarouselNext className="static h-12 w-12 translate-y-0 rounded-none border-white/20 bg-white/10 text-white hover:bg-white hover:text-black" />
      </div>
    </ShadcnCarousel>
  );
}
function RecommendedSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-square bg-gray-100 animate-pulse" />
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
