import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {PackageOpen} from 'lucide-react';

const paginationLinkClass =
  'mx-auto my-6 flex w-fit items-center gap-2 rounded-md border border-border-strong bg-transparent px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        if (nodes.length === 0) {
          return (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-20 text-center">
              <PackageOpen className="size-10 text-muted-foreground" />
              <p className="text-base font-medium text-foreground">
                Nothing here yet
              </p>
              <p className="text-sm text-muted-foreground">
                This collection has no products at the moment. Check back soon.
              </p>
            </div>
          );
        }

        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            <PreviousLink className={paginationLinkClass}>
              {isLoading ? (
                'Loading…'
              ) : (
                <span>
                  <span aria-hidden="true">↑</span> Load previous
                </span>
              )}
            </PreviousLink>
            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}
            <NextLink className={paginationLinkClass}>
              {isLoading ? (
                'Loading…'
              ) : (
                <span>
                  Load more <span aria-hidden="true">↓</span>
                </span>
              )}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
