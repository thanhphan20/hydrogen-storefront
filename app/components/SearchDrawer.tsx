import {useId} from 'react';
import {Link} from '@remix-run/react';
import { Drawer } from "~/components/Drawer";
import {SEARCH_ENDPOINT,SearchFormPredictive} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';

export function SearchDrawer({
    isOpen,
    onClose,
  }:  {
    isOpen: boolean;
    onClose: () => void;
  }) {
    const queriesDatalistId = useId();
    
    return (
      <Drawer open={isOpen} onClose={onClose} openFrom='top' size='full' heading='SEARCH PRODUCTS'>
       <div className="predictive-search w-full">
          <br />
          <SearchFormPredictive>
            {({fetchResults, goToSearch, inputRef}) => (
              <>
                <input
                  name="q"
                  onChange={fetchResults}
                  onFocus={fetchResults}
                  placeholder="Search"
                  ref={inputRef}
                  type="search"
                  list={queriesDatalistId}
                />
                &nbsp;
                <button onClick={goToSearch}>Search</button>
              </>
            )}
          </SearchFormPredictive>
  
          <SearchResultsPredictive>
            {({items, total, term, state, closeSearch}) => {
              const {articles, collections, pages, products, queries} = items;
  
              if (state === 'loading' && term.current) {
                return <div>Loading...</div>;
              }
  
              if (!total) {
                return <SearchResultsPredictive.Empty term={term} />;
              }
  
              return (
                <>
                  <SearchResultsPredictive.Queries
                    queries={queries}
                    queriesDatalistId={queriesDatalistId}
                  />
                  <SearchResultsPredictive.Products
                    products={products}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Collections
                    collections={collections}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Pages
                    pages={pages}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  <SearchResultsPredictive.Articles
                    articles={articles}
                    closeSearch={closeSearch}
                    term={term}
                  />
                  {term.current && total ? (
                    <Link
                      onClick={closeSearch}
                      to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                    >
                      <p>
                        View all results for <q>{term.current}</q>
                        &nbsp; →
                      </p>
                    </Link>
                  ) : null}
                </>
              );
            }}
          </SearchResultsPredictive>
        </div>
      </Drawer>
    )
  }
