import { Link } from 'wouter';
import { Receipt, Clock, TrendingUp, DollarSign, ChefHat, Timer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-chart-3'
    },
    {
      title: 'Pending Orders',
      value: '24',
      change: '+3 from yesterday',
      icon: Clock,
      color: 'text-primary'
    },
    {
      title: 'Active Tables',
      value: '18',
      change: 'Peak hours',
      icon: ChefHat,
      color: 'text-secondary'
    },
    {
      title: 'Avg. Prep Time',
      value: '12 min',
      change: '-2 min today',
      icon: Timer,
      color: 'text-chart-4'
    }
  ];

  const quickActions = [
    {
      title: 'Billing Management',
      description: 'Manage invoices, payments, and revenue tracking',
      icon: Receipt,
      to: '/billing',
      color: 'bg-primary/10 text-primary',
      testId: 'card-billing'
    },
    {
      title: 'Kitchen Operations',
      description: 'Track orders, manage queue, and monitor prep times',
      icon: Clock,
      to: '/kitchen',
      color: 'bg-secondary/10 text-secondary',
      testId: 'card-kitchen'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-secondary py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl" data-testid="text-hero-title">
              Kitchen & Billing Management
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90" data-testid="text-hero-description">
              Streamline your restaurant operations with our modern, efficient management system. 
              Track orders, manage billing, and optimize your workflow.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-get-started">
                <Link to="/kitchen">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white backdrop-blur-sm" asChild data-testid="button-learn-more">
                <Link to="/billing">View Billing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.title} variants={item}>
              <Card className="relative overflow-hidden" data-testid={`card-stat-${index}`}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid={`text-stat-value-${index}`}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1" data-testid={`text-stat-change-${index}`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-16 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight" data-testid="text-quick-actions-title">Quick Actions</h2>
            <p className="mt-2 text-muted-foreground" data-testid="text-quick-actions-description">
              Access your most-used features instantly
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto"
          >
            {quickActions.map((action) => (
              <motion.div key={action.title} variants={item}>
                <Link to={action.to} data-testid={`link-${action.testId}`}>
                  <Card className="hover-elevate active-elevate-2 transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <CardTitle data-testid={`text-${action.testId}-title`}>{action.title}</CardTitle>
                      <CardDescription data-testid={`text-${action.testId}-description`}>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
