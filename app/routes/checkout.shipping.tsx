import {Form, useNavigate} from 'react-router';
import {Button} from '~/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/components/ui/card';
import {Label} from '~/components/ui/label';
import {RadioGroup, RadioGroupItem} from '~/components/ui/radio-group';

export default function CheckoutShipping() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Shipping Method</h2>
        <p className="text-muted-foreground">Select how you want your order delivered.</p>
      </div>

      <Form method="post" className="space-y-6">
        <RadioGroup defaultValue="standard" name="shippingMethod" className="grid gap-4">
          <Label
            htmlFor="standard"
            className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="standard" id="standard" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Standard Shipping</p>
                  <p className="text-sm text-muted-foreground">Delivered in 3-5 business days</p>
                </div>
              </div>
              <span className="font-bold">$5.00</span>
            </div>
          </Label>

          <Label
            htmlFor="express"
            className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="express" id="express" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Express Shipping</p>
                  <p className="text-sm text-muted-foreground">Delivered in 1-2 business days</p>
                </div>
              </div>
              <span className="font-bold">$15.00</span>
            </div>
          </Label>

          <Label
            htmlFor="overnight"
            className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="overnight" id="overnight" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Overnight Shipping</p>
                  <p className="text-sm text-muted-foreground">Delivered next business day</p>
                </div>
              </div>
              <span className="font-bold">$30.00</span>
            </div>
          </Label>
        </RadioGroup>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void navigate('/checkout/information');
            }}
            className="w-full sm:w-auto"
          >
            Back to Information
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            Continue to Payment
          </Button>
        </div>
      </Form>
    </div>
  );
}
