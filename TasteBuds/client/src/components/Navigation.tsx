import { Link, useLocation } from 'wouter';
import { ChefHat, Home, Receipt, Clock, Wifi, WifiOff, CloudUpload, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useAuthStore } from '@/store/useAuthStore';

export function Navigation() {
  const [location] = useLocation();
  const isOnlineFirebase = useFirebaseConnection();
  const { pendingCount, isOnline } = useSyncStatus();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const isActive = (path: string) => location === path;
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2 transition-all"
            data-testid="link-home-logo"
          >
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Kitchen & Billing</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              asChild
              data-testid="button-nav-home"
            >
              <Link to="/" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive('/billing') ? 'default' : 'ghost'}
              size="sm"
              asChild
              data-testid="button-nav-billing"
            >
              <Link to="/billing" className="gap-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </Link>
            </Button>
            
            <Button
              variant={isActive('/kitchen') ? 'default' : 'ghost'}
              size="sm"
              asChild
              data-testid="button-nav-kitchen"
            >
              <Link to="/kitchen" className="gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Kitchen</span>
              </Link>
            </Button>

            {isAuthenticated && (
              <Button
                variant={isActive('/admin') ? 'default' : 'ghost'}
                size="sm"
                asChild
                data-testid="button-nav-admin"
              >
                <Link to="/admin" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}

            {pendingCount > 0 && (
              <Badge 
                variant="outline"
                className="gap-1"
                data-testid="badge-sync-pending"
              >
                <CloudUpload className="h-3 w-3" />
                <span className="hidden sm:inline">{pendingCount} pending</span>
                <span className="sm:hidden">{pendingCount}</span>
              </Badge>
            )}

            <Badge 
              variant={isOnlineFirebase ? 'default' : 'destructive'}
              className="gap-1"
              data-testid="badge-connection-status"
            >
              {isOnlineFirebase ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
}
