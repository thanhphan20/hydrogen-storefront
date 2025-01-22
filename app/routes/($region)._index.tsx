import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
  CategoryProductsQuery,
} from 'storefrontapi.generated';
import {Tab} from '@headlessui/react';
import {Carousel} from '~/components/Carousel';
import {HotSpot} from '~/components/Hotspot';
import {Link} from '~/components/Link';
import {MEDIA_FRAGMENT} from '~/graphql/fragment-query/media-query';
import {PRODUCT_FRAGMENT} from '~/graphql/fragment-query/product-query';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // context.storefront.query(HERO_SECTION_QUERY, {
    //   variables: {handle: 'freestyle'},
    // })
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes,
    // hero
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  const categoriesWithProducts = context.storefront
    .query(CATEGORIES_WITH_PRODUCTS_QUERY)
    .catch((error) => {
      console.error(error);
      return null;
  });

  return {
    recommendedProducts,
    categoriesWithProducts
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  // const mappedData = {
  //   banner: {
  //     image: {
  //       url: data.hero.spread.reference.image.url,
  //       altText: data.hero.spread.reference.alt
  //     },
  //     title: data.hero.title,
  //     byline: data.hero.byline.value
  //   },
  //   hotspots: data.hero.products.nodes.map((product: any, index: number) => ({
  //     id: product.id,
  //     title: product.title,
  //     imageUrl: product.images.nodes[0].url,
  //     price: `${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`,
  //     descriptionHtml: data.hero.descriptionHtml,
  //     position: {
  //       x: index === 0 ? 30 : index === 1 ? 60 : 40,
  //       y: index === 0 ? 50 : index === 1 ? 30 : 60,
  //     }
  //   }))
  // };

  return (
    <div className="home">
      <FeaturedCollection collection={data.featuredCollection} />
      <CategoriesWithProducts categories={data.categoriesWithProducts}/>
      {/* <HotSpot banner={mappedData.banner} hotspots={mappedData.hotspots}/> */}
      <RecommendedProducts products={data.recommendedProducts} />
    </div>
  );
}

function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment[];
}) {
  if (!collection || collection.length === 0) return null;

  return (
    <Carousel
      slides={collection}
      renderSlide={(slide) => (
        <Link
          className="featured-collection flex flex-row items-center w-full"
          to={`/collections/${slide.handle}`}
          key={slide.id}
        >
          {slide.image && (
            <div className="featured-collection-image flex items-center justify-center">
              <Image data={slide.image} sizes="(min-width: 45em) 50vw, 50vw" />
            </div>
          )}
          <h1>{slide.title}</h1>
        </Link>
      )}
    />
  );
}

function CategoriesWithProducts({
  categories,
}: {
  categories: Promise<CategoryProductsQuery | null>;
}) {
  return (
    <div className="categories-with-products">
      <h2 className="text-2xl font-semibold mb-4">Categories</h2>
      
      <Suspense fallback={<div>Loading categories...</div>}>
        <Await resolve={categories}>
          {(data) => {
            if (!data?.collections?.nodes) {
              return <p>No categories available.</p>;
            }

            const categories = data.collections.nodes;

            return (
              <>
                <Tab.Group>
                  <Tab.List className="flex gap-4 pb-2">
                    {categories.map((category) => (
                      <Tab
                        key={category.id}
                        className={({ selected }) => `rounded-full py-1 px-3 text-sm/6 font-semibold focus:outline-none hover:bg-black/5 focus:outline-1 focus:outline-black ${selected ? 'bg-black/10' : ''}`}
                      >
                        {category.title}
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels className="mt-3">
                    {categories.map((category) => (
                      <Tab.Panel key={category.id} className="rounded-xl bg-white/5 p-3">
                        <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                          {category.products.nodes.length > 0 ? (
                            category.products.nodes.map((product) => (
                              <Link
                                key={product.id}
                                className="recommended-product bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                to={`/products/${product.handle}`}
                              >
                                <Image
                                  data={product.images.nodes[0]}
                                  aspectRatio="1/1"
                                  sizes="(min-width: 45em) 20vw, 50vw"
                                  className="rounded-md mb-4"
                                />
                                <h4 className="font-semibold text-lg">{product.title}</h4>
                                <small className="text-gray-500">
                                  <Money data={product.priceRange.minVariantPrice} />
                                </small>
                              </Link>
                            ))
                          ) : (
                            <p>No products available for this category.</p>
                          )}
                        </div>
                      </Tab.Panel>
                    ))}
                  </Tab.Panels>
                </Tab.Group>
              </>
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <div className="recommended-products">
      <h2>Recommended Products</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={products}>
          {(response) => (
            <div className="recommended-products-grid">
              {response
                ? response.products.nodes.map((product) => (
                    <Link
                      key={product.id}
                      className="recommended-product"
                      to={`/products/${product.handle}`}
                    >
                      <Image
                        data={product.images.nodes[0]}
                        aspectRatio="1/1"
                        sizes="(min-width: 45em) 20vw, 50vw"
                      />
                      <h4>{product.title}</h4>
                      <small>
                        <Money data={product.priceRange.minVariantPrice} />
                      </small>
                    </Link>
                  ))
                : null}
            </div>
          )}
        </Await>
      </Suspense>
      <br />
    </div>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 3, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...Product
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const CATEGORIES_WITH_PRODUCTS_QUERY = `#graphql
  query CategoriesWithProducts($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 4) {
      nodes {
        id
        title
        handle
        products(first: 3) {
          nodes {
            ...Product
          }
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
    products(first: 3){
      nodes {
        ...Product
      }
    }
  }
  ${MEDIA_FRAGMENT}, ${PRODUCT_FRAGMENT}
` as const;

const HERO_SECTION_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
` as const;
