import {X} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';

export function Drawer({
  heading,
  open = false,
  onClose,
  openFrom = 'right',
  size = 'lg',
  children,
}: {
  heading?: string;
  open: boolean;
  onClose: () => void;
  openFrom: 'right' | 'left' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side={openFrom}
        className="w-screen p-12 sm:max-w-lg"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          {heading && (
            <SheetTitle className="text-xl font-medium">{heading}</SheetTitle>
          )}
          <button
            type="button"
            className="p-4 -m-4 transition text-primary hover:text-primary/50 cursor-pointer"
            onClick={onClose}
            data-test="close-drawer"
          >
            <X className="h-6 w-6" />
          </button>
        </SheetHeader>
        <div className="mt-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
