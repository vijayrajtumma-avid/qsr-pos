import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MenuItem, OrderModifiers, useOrderStore } from '@/store/useOrderStore';

interface ModifierModalProps {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

export function ModifierModal({ item, open, onClose }: ModifierModalProps) {
  const addToOrder = useOrderStore((state) => state.addToOrder);
  
  const [modifiers, setModifiers] = useState<OrderModifiers>({
    sugarLevel: 'regular',
    size: 'medium',
    addOns: {
      extraGinger: false,
      extraElaichi: false,
    },
  });
  
  const [quantity, setQuantity] = useState(1);

  // Reset modifiers when modal opens with new item
  useEffect(() => {
    if (open && item) {
      setModifiers({
        sugarLevel: 'regular',
        size: 'medium',
        addOns: {
          extraGinger: false,
          extraElaichi: false,
        },
      });
      setQuantity(1);
    }
  }, [open, item]);

  if (!item) return null;

  const calculateTotal = () => {
    let price = item.price;
    
    if (modifiers.size === 'large') {
      price += 10;
    }
    
    if (modifiers.addOns.extraGinger) {
      price += 5;
    }
    
    if (modifiers.addOns.extraElaichi) {
      price += 3;
    }
    
    return price * quantity;
  };

  const handleAddToOrder = () => {
    addToOrder(item, modifiers, quantity);
    onClose();
  };

  const total = calculateTotal();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px] p-0 gap-0",
          "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
          "sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0"
        )}
        data-testid="modal-modifiers"
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl" data-testid="text-modal-item-name">
            {item.name}
          </DialogTitle>
          <p className="text-lg font-semibold text-primary" data-testid="text-modal-base-price">
            Base Price: ₹{item.price}
          </p>
        </DialogHeader>

        <Separator />

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Show modifiers only for hot_drinks and cold_drinks */}
          {(item.category === 'hot_drinks' || item.category === 'cold_drinks') && (
            <>
              {/* Sugar Level */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Sugar Level</Label>
                <RadioGroup
                  value={modifiers.sugarLevel}
                  onValueChange={(value) =>
                    setModifiers({ ...modifiers, sugarLevel: value as OrderModifiers['sugarLevel'] })
                  }
                  data-testid="radiogroup-sugar-level"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_sugar" id="no_sugar" data-testid="radio-no-sugar" />
                    <Label htmlFor="no_sugar" className="cursor-pointer font-normal">
                      No Sugar
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="less_sugar" id="less_sugar" data-testid="radio-less-sugar" />
                    <Label htmlFor="less_sugar" className="cursor-pointer font-normal">
                      Less Sugar
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="regular" data-testid="radio-regular-sugar" />
                    <Label htmlFor="regular" className="cursor-pointer font-normal">
                      Regular (Default)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extra_sugar" id="extra_sugar" data-testid="radio-extra-sugar" />
                    <Label htmlFor="extra_sugar" className="cursor-pointer font-normal">
                      Extra Sugar
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Size */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Size</Label>
                <RadioGroup
                  value={modifiers.size}
                  onValueChange={(value) =>
                    setModifiers({ ...modifiers, size: value as OrderModifiers['size'] })
                  }
                  data-testid="radiogroup-size"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" data-testid="radio-small" />
                    <Label htmlFor="small" className="cursor-pointer font-normal">
                      Small
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" data-testid="radio-medium" />
                    <Label htmlFor="medium" className="cursor-pointer font-normal">
                      Medium (Default)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" data-testid="radio-large" />
                    <Label htmlFor="large" className="cursor-pointer font-normal">
                      Large (+₹10)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* Add-ons */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Add-ons</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extra_ginger"
                      checked={modifiers.addOns.extraGinger === true}
                      onCheckedChange={(checked) =>
                        setModifiers({
                          ...modifiers,
                          addOns: { ...modifiers.addOns, extraGinger: Boolean(checked) },
                        })
                      }
                      data-testid="checkbox-extra-ginger"
                    />
                    <Label htmlFor="extra_ginger" className="cursor-pointer font-normal">
                      Extra Ginger (+₹5)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extra_elaichi"
                      checked={modifiers.addOns.extraElaichi === true}
                      onCheckedChange={(checked) =>
                        setModifiers({
                          ...modifiers,
                          addOns: { ...modifiers.addOns, extraElaichi: Boolean(checked) },
                        })
                      }
                      data-testid="checkbox-extra-elaichi"
                    />
                    <Label htmlFor="extra_elaichi" className="cursor-pointer font-normal">
                      Extra Elaichi (+₹3)
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Quantity - Always shown */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid="button-decrease-quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-bold w-12 text-center" data-testid="text-quantity">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-increase-quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-6 pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Price</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-modal-total">
              ₹{total}
            </span>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToOrder}
            data-testid="button-add-to-order"
          >
            Add to Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
