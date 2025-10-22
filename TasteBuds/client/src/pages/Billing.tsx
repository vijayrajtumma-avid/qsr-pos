import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { MenuItem, useOrderStore } from '@/store/useOrderStore';
import { ModifierModal } from '@/components/ModifierModal';
import { firebaseMenuService, MenuItem as FirebaseMenuItem } from '@/services/firebaseMenu';

// Default menu items as fallback
const defaultMenuItems: MenuItem[] = [
  { id: 1, name: "Chai", price: 20, category: "hot_drinks", image: "" },
  { id: 2, name: "Coffee", price: 30, category: "hot_drinks", image: "" },
  { id: 3, name: "Cappuccino", price: 45, category: "hot_drinks", image: "" },
  { id: 4, name: "Hot Chocolate", price: 50, category: "hot_drinks", image: "" },
  { id: 5, name: "Green Tea", price: 25, category: "hot_drinks", image: "" },
  { id: 6, name: "Masala Chai", price: 25, category: "hot_drinks", image: "" },
  
  { id: 7, name: "Cold Coffee", price: 60, category: "cold_drinks", image: "" },
  { id: 8, name: "Mango Shake", price: 70, category: "cold_drinks", image: "" },
  { id: 9, name: "Lemonade", price: 40, category: "cold_drinks", image: "" },
  { id: 10, name: "Iced Tea", price: 45, category: "cold_drinks", image: "" },
  { id: 11, name: "Chocolate Shake", price: 75, category: "cold_drinks", image: "" },
  { id: 12, name: "Fresh Juice", price: 55, category: "cold_drinks", image: "" },
  
  { id: 13, name: "Samosa", price: 15, category: "snacks", image: "" },
  { id: 14, name: "Spring Roll", price: 25, category: "snacks", image: "" },
  { id: 15, name: "Vada Pav", price: 20, category: "snacks", image: "" },
  { id: 16, name: "Pakora", price: 30, category: "snacks", image: "" },
  { id: 17, name: "Sandwich", price: 40, category: "snacks", image: "" },
  { id: 18, name: "French Fries", price: 35, category: "snacks", image: "" },
  
  { id: 19, name: "Chai + Samosa", price: 30, category: "combos", image: "" },
  { id: 20, name: "Coffee + Sandwich", price: 65, category: "combos", image: "" },
  { id: 21, name: "Cold Coffee + Fries", price: 90, category: "combos", image: "" },
  { id: 22, name: "Tea + Pakora", price: 45, category: "combos", image: "" },
];

const categories = [
  { id: 'hot_drinks', label: 'Hot Drinks' },
  { id: 'cold_drinks', label: 'Cold Drinks' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'combos', label: 'Combos' },
];

const sugarLevelLabels = {
  no_sugar: 'No Sugar',
  less_sugar: 'Less Sugar',
  regular: 'Regular',
  extra_sugar: 'Extra Sugar',
};

const sizeLabels = {
  small: 'S',
  medium: 'M',
  large: 'L',
};

export default function Billing() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('hot_drinks');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  
  const order = useOrderStore((state) => state.order);
  const updateQuantity = useOrderStore((state) => state.updateQuantity);
  const removeItem = useOrderStore((state) => state.removeItem);
  const discountPercentage = useOrderStore((state) => state.discountPercentage);
  const setDiscountPercentage = useOrderStore((state) => state.setDiscountPercentage);
  const getSubtotal = useOrderStore((state) => state.getSubtotal);
  const getDiscount = useOrderStore((state) => state.getDiscount);
  const getGST = useOrderStore((state) => state.getGST);
  const getTotal = useOrderStore((state) => state.getTotal);

  // Load menu items from Firebase
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const items = await firebaseMenuService.getAllMenuItems();
        if (items.length > 0) {
          // Convert Firebase menu items to app MenuItem format
          const convertedItems: MenuItem[] = items.map((item) => ({
            id: parseInt(item.id) || Date.now(),
            name: item.name,
            price: item.price,
            category: item.category,
            image: '',
          }));
          setMenuItems(convertedItems);
        }
      } catch (error) {
        console.error('Failed to load menu from Firebase, using default menu', error);
      }
    };

    loadMenu();
  }, []);

  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const createModifiersKey = (modifiers: any): string => {
    return JSON.stringify(modifiers);
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const gst = getGST();
  const total = getTotal();
  const totalItems = order.reduce((sum, item) => sum + item.quantity, 0);

  const handleDiscountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setDiscountPercentage(numValue);
    } else if (value === '') {
      setDiscountPercentage(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-pos-title">Point of Sale</h1>
          <p className="text-muted-foreground mt-1" data-testid="text-pos-description">
            Select items to create an order
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-[70%]">
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                  data-testid={`button-category-${category.id}`}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card
                    className="hover-elevate active-elevate-2 cursor-pointer h-full"
                    onClick={() => handleItemClick(item)}
                    data-testid={`card-menu-item-${item.id}`}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center h-full min-h-[150px] justify-between">
                      <div className="w-full h-20 bg-muted rounded-md mb-3 flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-base mb-1" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </h3>
                        <p className="text-lg font-bold text-primary" data-testid={`text-item-price-${item.id}`}>
                          ₹{item.price}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:w-[30%]">
            <Card className="sticky top-20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" data-testid="text-order-summary-title">Order Summary</h2>
                  <Badge variant="outline" data-testid="badge-item-count">
                    {totalItems} items
                  </Badge>
                </div>

                <Separator className="mb-4" />

                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto" data-testid="container-order-items">
                  {order.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No items in order</p>
                    </div>
                  ) : (
                    order.map((item, index) => {
                      const modifiersKey = createModifiersKey(item.modifiers);
                      const hasModifiers = 
                        item.modifiers.size !== 'medium' ||
                        item.modifiers.sugarLevel !== 'regular' ||
                        item.modifiers.addOns.extraGinger ||
                        item.modifiers.addOns.extraElaichi;
                      
                      return (
                        <div
                          key={`${item.id}-${modifiersKey}`}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          data-testid={`order-item-${index}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" data-testid={`text-order-item-name-${index}`}>
                              {item.name}
                            </p>
                            {hasModifiers && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.modifiers.size !== 'medium' && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0 h-auto">
                                    {sizeLabels[item.modifiers.size]}
                                  </Badge>
                                )}
                                {item.modifiers.sugarLevel !== 'regular' && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0 h-auto">
                                    {sugarLevelLabels[item.modifiers.sugarLevel]}
                                  </Badge>
                                )}
                                {item.modifiers.addOns.extraGinger && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0 h-auto">
                                    +Ginger
                                  </Badge>
                                )}
                                {item.modifiers.addOns.extraElaichi && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0 h-auto">
                                    +Elaichi
                                  </Badge>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              ₹{item.itemTotal / item.quantity} × {item.quantity} = ₹{item.itemTotal}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, modifiersKey, -1)}
                              data-testid={`button-decrease-${index}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold w-6 text-center" data-testid={`text-quantity-${index}`}>
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.id, modifiersKey, 1)}
                              data-testid={`button-increase-${index}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => removeItem(item.id, modifiersKey)}
                              data-testid={`button-remove-${index}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Separator className="mb-4" />

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium" data-testid="text-subtotal">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Discount
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={discountPercentage || ''}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                        placeholder="0"
                        className="w-16 h-8 text-sm text-right"
                        data-testid="input-discount-percentage"
                      />
                      <span className="text-sm font-medium w-12 text-right" data-testid="text-discount-amount">
                        -₹{discount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span className="font-medium" data-testid="text-gst">₹{gst.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="text-total">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={order.length === 0}
                  onClick={() => setLocation('/payment')}
                  data-testid="button-payment"
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Payment
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ModifierModal
        item={selectedItem}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
