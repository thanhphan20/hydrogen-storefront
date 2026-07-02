import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Badge} from '~/components/ui/badge';

export function ProductItem({
  product: baseProduct,
  loading,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const product = baseProduct;
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const isSale = false; // TODO: Update fragment to include compareAtPrice
  const firstVariant = product.variants?.nodes?.[0];

  return (
    <div className="product-item group flex flex-col gap-3 relative">
      <Link
        key={product.id}
        prefetch="intent"
        to={variantUrl}
        className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border-strong"
      >
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isSale && (
            <Badge variant="destructive" className="text-xs">
              Sale
            </Badge>
          )}
          <Badge
            variant="outline"
            className="gap-1.5 bg-black/60 text-xs text-foreground backdrop-blur"
          >
            <span className="size-1.5 rounded-full bg-success motion-safe:animate-pulse" />
            In stock
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-border bg-black/60 backdrop-blur hidden md:block">
          {firstVariant && (
            <AddToCartButton
              lines={[{merchandiseId: firstVariant.id, quantity: 1}]}
              className="w-full rounded-md bg-secondary py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              Add to cart
            </AddToCartButton>
          )}
        </div>
      </Link>
      <div className="flex flex-col gap-1 px-1">
        <Link to={variantUrl} prefetch="intent">
          <h4 className="text-sm font-medium leading-tight text-foreground transition-colors hover:text-muted-foreground">
            {product.title}
          </h4>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            From{' '}
            <Money
              data={product.priceRange.minVariantPrice}
              as="span"
              className="text-foreground"
            />
          </span>
        </div>
        <div className="md:hidden mt-2">
          {firstVariant && (
            <AddToCartButton
              lines={[{merchandiseId: firstVariant.id, quantity: 1}]}
              className="w-full rounded-md bg-secondary py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              Add to cart
            </AddToCartButton>
          )}
        </div>
      </div>
    </div>
  );
}
