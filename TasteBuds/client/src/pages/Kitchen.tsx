import { useEffect } from 'react';
import { Clock, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useKitchenStore, OrderStatus } from '@/store/useKitchenStore';
import { formatDistanceToNow } from 'date-fns';
import { firebaseOrdersService } from '@/services/firebaseOrders';
import { offlineSyncService } from '@/services/offlineSync';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';

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

export default function Kitchen() {
  const setOrders = useKitchenStore((state) => state.setOrders);
  const updateOrderStatus = useKitchenStore((state) => state.updateOrderStatus);

  // Use IndexedDB as primary data source with live queries
  const orders = useLiveQuery(
    () => db.orders.orderBy('timestamp').reverse().toArray(),
    []
  );

  useEffect(() => {
    // Subscribe to Firebase real-time updates and merge with IndexedDB
    const unsubscribe = firebaseOrdersService.subscribeToOrders(async (firebaseOrders) => {
      // Sync Firebase orders to IndexedDB
      await offlineSyncService.syncFromFirebase(firebaseOrders);
      // Update store for compatibility
      setOrders(firebaseOrders);
    });

    // Load initial data from IndexedDB
    offlineSyncService.getAllOrdersFromLocal().then((localOrders) => {
      if (localOrders.length > 0) {
        setOrders(localOrders);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setOrders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'preparing':
        return 'bg-blue-500/20 border-blue-500/30';
      case 'ready':
        return 'bg-green-500/20 border-green-500/30';
      default:
        return 'bg-muted';
    }
  };

  const getStatusButtonColor = (status: OrderStatus) => {
    switch (status) {
      case 'preparing':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'ready':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return '';
    }
  };

  const handleStartPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-kitchen-title">
            Kitchen Display
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="text-kitchen-description">
            Manage incoming orders and track preparation
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No orders yet</p>
              <p className="text-muted-foreground">
                Orders from the billing screen will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders?.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card
                  className={`h-full ${getStatusColor(order.status)}`}
                  data-testid={`card-kitchen-order-${index}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold" data-testid={`text-order-number-${index}`}>
                          Order #{order.orderNumber}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground" data-testid={`text-order-time-${index}`}>
                            {getTimeAgo(order.timestamp)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={order.status === 'new' ? 'bg-yellow-500 text-white border-yellow-600' : 
                                   order.status === 'preparing' ? 'bg-blue-500 text-white border-blue-600' : 
                                   'bg-green-500 text-white border-green-600'}
                        data-testid={`badge-order-status-${index}`}
                      >
                        {order.status === 'new' ? 'New' : 
                         order.status === 'preparing' ? 'Preparing' : 'Ready'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground">Items:</h4>
                      {order.items.map((item, itemIndex) => {
                        const hasModifiers = 
                          item.modifiers.size !== 'medium' ||
                          item.modifiers.sugarLevel !== 'regular' ||
                          item.modifiers.addOns.extraGinger ||
                          item.modifiers.addOns.extraElaichi;

                        return (
                          <div
                            key={`${item.id}-${itemIndex}`}
                            className="p-2 rounded-md bg-background/50"
                            data-testid={`order-item-${index}-${itemIndex}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm" data-testid={`text-item-name-${index}-${itemIndex}`}>
                                {item.name}
                              </span>
                              <span className="text-sm font-semibold" data-testid={`text-item-quantity-${index}-${itemIndex}`}>
                                ×{item.quantity}
                              </span>
                            </div>
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
                          </div>
                        );
                      })}
                    </div>

                    <Separator className="my-3" />
                    
                    <div className="space-y-1 text-sm">
                      {order.subtotal !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                        </div>
                      )}
                      {order.discountPercentage !== undefined && order.discountPercentage > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Discount ({order.discountPercentage}%)</span>
                          <span className="font-medium text-green-600" data-testid={`text-discount-${index}`}>
                            -₹{(order.discountAmount || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {order.gst !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GST (5%)</span>
                          <span className="font-medium">₹{order.gst.toFixed(2)}</span>
                        </div>
                      )}
                      {(order.subtotal !== undefined || order.gst !== undefined) && <Separator className="my-2" />}
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-primary" data-testid={`text-order-total-${index}`}>₹{order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Payment</span>
                        <span className="capitalize">{order.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      {order.status === 'new' && (
                        <Button
                          className="w-full"
                          onClick={() => handleStartPreparing(order.id)}
                          data-testid={`button-start-preparing-${index}`}
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button
                          className={`w-full ${getStatusButtonColor('preparing')}`}
                          onClick={() => handleMarkReady(order.id)}
                          data-testid={`button-mark-ready-${index}`}
                        >
                          Mark Ready
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <div className="text-center py-2">
                          <Badge className={`${getStatusButtonColor('ready')} text-white`}>
                            Ready for Pickup
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
