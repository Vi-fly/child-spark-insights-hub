
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, FileText, Camera, Headphones } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  description,
  icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  colorClass: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full ${colorClass}`}>{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const RecentActivity = () => (
  <div className="space-y-4">
    {[
      {
        title: 'New report generated',
        user: 'Emma Thompson',
        time: '10 minutes ago',
        action: 'generated a report for',
        subject: 'Alex Chen',
      },
      {
        title: 'New observer assigned',
        user: 'Admin',
        time: '1 hour ago',
        action: 'assigned',
        subject: 'David Wilson to 3 students',
      },
      {
        title: 'Media uploaded',
        user: 'Sarah Johnson',
        time: '2 hours ago',
        action: 'uploaded 5 new images for',
        subject: 'Maya Patel',
      },
    ].map((activity, index) => (
      <div
        key={index}
        className="flex items-center p-3 border rounded-lg bg-card"
      >
        <div className="w-2 h-2 rounded-full bg-observer-primary mr-4"></div>
        <div>
          <p className="text-sm font-medium">{activity.title}</p>
          <p className="text-xs text-muted-foreground">
            {activity.user} {activity.action}{' '}
            <span className="font-medium text-foreground">{activity.subject}</span>
            <span className="mx-1">•</span>
            {activity.time}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const UpcomingTask = () => (
  <div className="space-y-4">
    {[
      {
        title: 'Review reports',
        description: '5 reports pending review',
        dueDate: 'Today',
        priority: 'high',
      },
      {
        title: 'Assign new observer',
        description: '2 students need assignment',
        dueDate: 'Tomorrow',
        priority: 'medium',
      },
      {
        title: 'Parent meeting preparation',
        description: 'Prepare documents for quarterly review',
        dueDate: 'Next week',
        priority: 'low',
      },
    ].map((task, index) => {
      const priorityColors = {
        high: 'bg-red-100 text-red-800 border-red-200',
        medium: 'bg-amber-100 text-amber-800 border-amber-200',
        low: 'bg-green-100 text-green-800 border-green-200',
      };
      
      return (
        <div
          key={index}
          className="flex justify-between items-center p-3 border rounded-lg bg-card"
        >
          <div>
            <p className="text-sm font-medium">{task.title}</p>
            <p className="text-xs text-muted-foreground">{task.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">{task.dueDate}</span>
            <span 
              className={`text-xs px-2 py-1 rounded-full uppercase ${priorityColors[task.priority as keyof typeof priorityColors]}`}
            >
              {task.priority}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your Observer AI system.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="48"
          description="+2 from last week"
          icon={<Users className="h-4 w-4" />}
          colorClass="bg-blue-100 text-blue-800"
        />
        <StatsCard
          title="Active Observers"
          value="12"
          icon={<Users className="h-4 w-4" />}
          colorClass="bg-green-100 text-green-800"
        />
        <StatsCard
          title="Reports Generated"
          value="183"
          description="This month"
          icon={<FileText className="h-4 w-4" />}
          colorClass="bg-amber-100 text-amber-800"
        />
        <StatsCard
          title="Media Uploaded"
          value="57"
          description="This week"
          icon={<Camera className="h-4 w-4" />}
          colorClass="bg-purple-100 text-purple-800"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              The latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Tasks that require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingTask />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Performance of the Observer AI system</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center space-y-2">
            <BarChart3 className="h-16 w-16 mx-auto text-observer-primary" />
            <p className="text-sm text-muted-foreground">
              Analytics visualization will be generated here with real data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
