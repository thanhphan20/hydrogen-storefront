import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';

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
        className="relative aspect-square overflow-hidden bg-[#F4F4F4]"
      >
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {isSale && (
            <span className="bg-[#FF4D4D] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter">
              Sale
            </span>
          )}
          <span className="bg-white text-black text-[9px] font-black px-2 py-0.5 uppercase tracking-tighter border border-black/10">
            🟢 In Stock
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/10 backdrop-blur-sm hidden md:block">
          {firstVariant && (
            <AddToCartButton
              lines={[{merchandiseId: firstVariant.id, quantity: 1}]}
              className="w-full bg-black text-white text-[10px] font-bold py-2 uppercase tracking-widest hover:bg-black/80"
            >
              Add to cart
            </AddToCartButton>
          )}
        </div>
      </Link>
      <div className="flex flex-col gap-1 px-1">
        <Link to={variantUrl} prefetch="intent">
          <h4 className="text-[12px] font-bold uppercase tracking-tight leading-tight hover:text-black/60 transition-colors">
            {product.title}
          </h4>
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-black/50 uppercase tracking-widest">
            From <Money data={product.priceRange.minVariantPrice} as="span" className="text-black font-bold ml-1" />
          </span>
        </div>
        <div className="md:hidden mt-2">
          {firstVariant && (
            <AddToCartButton
              lines={[{merchandiseId: firstVariant.id, quantity: 1}]}
              className="w-full bg-black text-white text-[10px] font-bold py-2 uppercase tracking-widest"
            >
              Add to cart
            </AddToCartButton>
          )}
        </div>
      </div>
    </div>
  );
}
