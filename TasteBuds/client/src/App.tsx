import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Navigation } from '@/components/Navigation';
import Home from '@/pages/Home';
import Billing from '@/pages/Billing';
import Kitchen from '@/pages/Kitchen';
import Payment from '@/pages/Payment';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/admin" component={Admin} />
            <Route path="*">
              {() => (
                <>
                  <Navigation />
                  <Switch>
                    <Route path="/" component={Home} />
                    <Route path="/billing" component={Billing} />
                    <Route path="/kitchen" component={Kitchen} />
                    <Route path="/payment" component={Payment} />
                  </Switch>
                </>
              )}
            </Route>
          </Switch>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
