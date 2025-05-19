
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, 
  BarChart3, 
  FileText, 
  Home, 
  Settings, 
  LogOut,
  MessageSquare,
  Camera,
  Headphones,
  BookOpen,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        icon: <Home className="w-5 h-5" />,
        path: '/',
        roles: ['admin', 'observer', 'parent'],
      },
    ];

    const adminItems = [
      {
        title: 'Students',
        icon: <Users className="w-5 h-5" />,
        path: '/students',
        roles: ['admin', 'observer'],
      },
      {
        title: 'Observers',
        icon: <Users className="w-5 h-5" />,
        path: '/observers',
        roles: ['admin'],
      },
      {
        title: 'Parents',
        icon: <Users className="w-5 h-5" />,
        path: '/parents',
        roles: ['admin'],
      },
      {
        title: 'Media',
        icon: <Camera className="w-5 h-5" />,
        path: '/media',
        roles: ['admin', 'observer'],
      },
      {
        title: 'Recordings',
        icon: <Headphones className="w-5 h-5" />,
        path: '/recordings',
        roles: ['admin', 'observer'],
      },
    ];

    const observerItems = [
      {
        title: 'Reports',
        icon: <FileText className="w-5 h-5" />,
        path: '/reports',
        roles: ['admin', 'observer', 'parent'],
      },
      {
        title: 'Growth Tracker',
        icon: <Activity className="w-5 h-5" />,
        path: '/growth-tracker',
        roles: ['observer'],
      },
    ];

    const parentItems = [
      {
        title: 'My Children',
        icon: <Users className="w-5 h-5" />,
        path: '/my-children',
        roles: ['parent'],
      },
      {
        title: 'Messages',
        icon: <MessageSquare className="w-5 h-5" />,
        path: '/messages',
        roles: ['admin', 'observer', 'parent'],
      },
    ];

    const settingsItems = [
      {
        title: 'Settings',
        icon: <Settings className="w-5 h-5" />,
        path: '/settings',
        roles: ['admin', 'observer', 'parent'],
      },
    ];

    const allItems = [...baseItems];

    if (user?.role === 'admin') {
      allItems.push(...adminItems, ...observerItems);
    } else if (user?.role === 'observer') {
      allItems.push(...adminItems.filter(item => item.roles.includes('observer')), ...observerItems);
    } else if (user?.role === 'parent') {
      allItems.push(...parentItems);
    }

    allItems.push(...settingsItems);

    return allItems.filter(item => item.roles.includes(user?.role || ''));
  };

  const navItems = getNavItems();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 border-r bg-sidebar">
      <div className="px-4 py-6">
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-observer-primary" />
            <span className="text-lg font-bold text-foreground">Observer AI</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4 py-6 border-t">
        {user && (
          <div className="flex items-center gap-3 mb-6">
            <Avatar>
              <AvatarImage src={user.profileImage} />
              <AvatarFallback className="bg-observer-primary text-white">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
