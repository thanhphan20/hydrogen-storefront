import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed';
type AsideContextValue = {
  type: AsideType;
  open: (mode: AsideType) => void;
  close: () => void;
};

/**
 * A side bar component with Overlay using Sheet UI
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  type,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;

  return (
    <Sheet open={expanded} onOpenChange={(open) => !open && close()}>
      <SheetContent
        side={type === 'search' ? 'top' : 'right'}
        className="flex flex-col p-0 w-full sm:max-w-[450px] h-full"
      >
        <SheetHeader className="px-6 py-6 border-b border-black/5 flex-shrink-0">
          <SheetTitle className="text-[12px] font-black uppercase tracking-[0.2em]">
            {heading}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
