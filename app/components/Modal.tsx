import {X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

export function Modal({
  heading,
  open = false,
  onClose,
  children,
}: {
  heading?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md bg-white p-12">
        <DialogHeader className="flex flex-row items-center justify-between">
          {heading && (
            <DialogTitle className="text-xl font-medium">{heading}</DialogTitle>
          )}
          <button
            type="button"
            className="p-4 -m-4 transition text-primary hover:text-primary/50 cursor-pointer"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </DialogHeader>
        <div className="mt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
