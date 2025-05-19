
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'observer' | 'parent') => {
    let demoEmail = '';
    
    switch (role) {
      case 'admin':
        demoEmail = 'admin@observerai.com';
        break;
      case 'observer':
        demoEmail = 'observer@observerai.com';
        break;
      case 'parent':
        demoEmail = 'parent@observerai.com';
        break;
    }
    
    setIsLoading(true);
    try {
      await login(demoEmail, 'password');
      navigate('/');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Could not log in with demo account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <BookOpen className="h-8 w-8 text-observer-primary mr-2" />
          <h1 className="text-2xl font-bold text-foreground">Observer AI</h1>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: 'Password reset',
                        description: 'This feature is not implemented in the demo',
                      });
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  Demo Accounts
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => handleDemoLogin('admin')}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => handleDemoLogin('observer')}
              >
                Observer
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => handleDemoLogin('parent')}
              >
                Parent
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
