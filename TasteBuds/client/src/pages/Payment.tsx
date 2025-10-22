import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Smartphone, CheckCircle2, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useOrderStore } from '@/store/useOrderStore';
import { useKitchenStore } from '@/store/useKitchenStore';

type PaymentMethod = 'cash' | 'upi' | 'card' | null;

const quickAmounts = [50, 100, 200, 500];

export default function Payment() {
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const subtotal = useOrderStore((state) => state.getSubtotal());
  const discount = useOrderStore((state) => state.getDiscount());
  const discountPercentage = useOrderStore((state) => state.discountPercentage);
  const gst = useOrderStore((state) => state.getGST());
  const total = useOrderStore((state) => state.getTotal());
  const order = useOrderStore((state) => state.order);
  const clearOrder = useOrderStore((state) => state.clearOrder);
  const addKitchenOrder = useKitchenStore((state) => state.addOrder);

  const change = cashAmount > 0 ? Math.max(0, cashAmount - total) : 0;

  const handleCompleteOrder = () => {
    if (!paymentMethod) return;
    
    if (paymentMethod === 'cash' && cashAmount < total) {
      alert('Insufficient cash amount');
      return;
    }

    // Store order in local array (will add persistence later)
    const completedOrder = {
      id: Date.now(),
      items: order,
      total,
      paymentMethod,
      timestamp: new Date().toISOString(),
    };
    
    // Store in localStorage for now
    const orders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    orders.push(completedOrder);
    localStorage.setItem('completedOrders', JSON.stringify(orders));

    // Add order to kitchen queue with discount info
    addKitchenOrder(order, subtotal, discountPercentage, discount, gst, total, paymentMethod);

    // Show success animation
    setShowSuccess(true);
    
    // Clear order and redirect after animation
    setTimeout(() => {
      clearOrder();
      setLocation('/billing');
    }, 2000);
  };

  if (total === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No items in order</p>
            <Button onClick={() => setLocation('/billing')} data-testid="button-back-to-billing">
              Back to Billing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="text-center"
              data-testid="success-animation"
            >
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold">Order Completed!</h2>
              <p className="text-muted-foreground mt-2">Redirecting...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-payment-title">
            Payment
          </h1>
          <p className="text-muted-foreground mt-1">Complete your order</p>
        </div>

        <div className="space-y-6">
          {/* Total Amount Display */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount ({discountPercentage}%)</span>
                    <span className="font-medium text-green-600" data-testid="text-discount-amount">
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span className="font-medium">₹{gst.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="text-center pt-2">
                  <p className="text-muted-foreground mb-2">Total Amount</p>
                  <p className="text-5xl font-bold text-primary" data-testid="text-total-amount">
                    ₹{total.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer hover-elevate active-elevate-2 ${
                  paymentMethod === 'cash' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setPaymentMethod('cash');
                  setCashAmount(0);
                }}
                data-testid="button-payment-cash"
              >
                <CardContent className="pt-6 text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <p className="font-semibold">Cash</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer hover-elevate active-elevate-2 ${
                  paymentMethod === 'upi' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setPaymentMethod('upi')}
                data-testid="button-payment-upi"
              >
                <CardContent className="pt-6 text-center">
                  <Smartphone className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <p className="font-semibold">UPI</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer hover-elevate active-elevate-2 ${
                  paymentMethod === 'card' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setPaymentMethod('card')}
                data-testid="button-payment-card"
              >
                <CardContent className="pt-6 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 text-primary" />
                  <p className="font-semibold">Card</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Quick Amount</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="lg"
                          onClick={() => setCashAmount(amount)}
                          data-testid={`button-quick-amount-${amount}`}
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cash Received</label>
                      <input
                        type="number"
                        value={cashAmount || ''}
                        onChange={(e) => setCashAmount(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-md bg-background"
                        placeholder="Enter amount"
                        data-testid="input-cash-amount"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Change to Return</label>
                      <div
                        className="w-full px-4 py-2 border rounded-md bg-muted text-2xl font-bold"
                        data-testid="text-change-amount"
                      >
                        ₹{change.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* UPI Payment Details */}
          {paymentMethod === 'upi' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-muted-foreground" data-testid="icon-qr-code" />
                    </div>
                    <p className="text-lg font-semibold" data-testid="text-scan-to-pay">
                      Scan to Pay
                    </p>
                    <p className="text-muted-foreground">
                      Use any UPI app to scan and complete payment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Card Payment Details */}
          {paymentMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CreditCard className="h-24 w-24 mx-auto text-muted-foreground" />
                    <p className="text-lg font-semibold">Card Payment</p>
                    <p className="text-muted-foreground">
                      Insert or tap your card on the payment terminal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Complete Order Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleCompleteOrder}
            disabled={!paymentMethod || (paymentMethod === 'cash' && cashAmount < total)}
            data-testid="button-complete-order"
          >
            Complete Order
          </Button>
        </div>
      </div>
    </div>
  );
}
