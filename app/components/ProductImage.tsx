import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';
import {Skeleton} from '~/components/ui/skeleton';

export function ProductImage({
  image,
}: {
  image: ProductVariantFragment['image'];
}) {
  if (!image) {
    return <Skeleton className="aspect-square w-full rounded-lg" />;
  }
  return (
    <div className="product-image overflow-hidden rounded-lg">
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
