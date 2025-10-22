import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [pin, setPin] = useState('');
  const [, setLocation] = useLocation();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(pin)) {
      toast({
        title: 'Login successful',
        description: 'Welcome to the admin panel',
      });
      setLocation('/admin');
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid PIN. Please try again.',
        variant: 'destructive',
      });
      setPin('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your PIN to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter your PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                data-testid="input-admin-pin"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              data-testid="button-login"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
