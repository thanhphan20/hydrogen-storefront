import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {Button} from '~/components/ui/button';
import {cn} from '~/lib/utils';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  return (
    <div className="product-form flex flex-col gap-6">
      {productOptions.map((option) => {
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5 className="mb-2 font-medium">{option.name}</h5>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  return (
                    <Button
                      key={option.name + name}
                      variant="outline"
                      asChild
                      className={cn(
                        'h-auto rounded-md px-4 py-2',
                        selected &&
                          'border-border-strong bg-secondary text-foreground',
                        !available && 'opacity-40 line-through',
                      )}
                    >
                      <Link
                        prefetch="intent"
                        preventScrollReset
                        replace
                        to={`/products/${handle}?${variantUriQuery}`}
                      >
                        <ProductOptionSwatch swatch={swatch} name={name} />
                      </Link>
                    </Button>
                  );
                } else {
                  return (
                    <Button
                      key={option.name + name}
                      type="button"
                      variant="outline"
                      disabled={!exists}
                      className={cn(
                        'h-auto rounded-md px-4 py-2',
                        selected &&
                          'border-border-strong bg-secondary text-foreground',
                        !available && 'opacity-40 line-through',
                      )}
                      onClick={() => {
                        if (!selected) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      <AddToCartButton
        className="h-11 w-full"
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          open('cart');
        }}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div className="flex items-center gap-2">
      <div
        aria-label={name}
        className="h-4 w-4 rounded-full border border-border overflow-hidden"
        style={{
          backgroundColor: color || 'transparent',
        }}
      >
        {!!image && <img src={image} alt={name} className="h-full w-full object-cover" />}
      </div>
      <span>{name}</span>
    </div>
  );
}
