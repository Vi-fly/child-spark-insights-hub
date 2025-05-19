
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, ArrowRight, Calendar, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const ParentDashboard = () => {
  const children = [
    {
      id: "1",
      name: "Maya Patel",
      age: "6 years",
      class: "Grade 1",
      observer: "Ms. Johnson",
      profileImage: "",
    }
  ];

  const recentReports = [
    {
      id: "1",
      date: "May 18, 2025",
      theme: "Ocean Life",
      curiositySeed: "Deep Sea Creatures",
      overallScore: "Good",
      growthAreas: {
        intellectual: "excellent",
        emotional: "good",
        social: "fair",
        creativity: "good",
        physical: "needs-work",
        values: "excellent",
        independence: "good"
      },
      activatedAreas: 5,
      totalAreas: 7
    },
    {
      id: "2",
      date: "May 14, 2025",
      theme: "Space Exploration",
      curiositySeed: "Black Holes",
      overallScore: "Excellent",
      growthAreas: {
        intellectual: "excellent",
        emotional: "excellent",
        social: "good",
        creativity: "excellent",
        physical: "good",
        values: "good",
        independence: "excellent"
      },
      activatedAreas: 7,
      totalAreas: 7
    },
    {
      id: "3",
      date: "May 10, 2025",
      theme: "Animal Habitats",
      curiositySeed: "Rainforest Animals",
      overallScore: "Good",
      growthAreas: {
        intellectual: "good",
        emotional: "fair",
        social: "excellent",
        creativity: "good",
        physical: "good",
        values: "good",
        independence: "fair"
      },
      activatedAreas: 6,
      totalAreas: 7
    },
  ];

  const upcomingEvents = [
    {
      title: "Parent-Observer Meeting",
      date: "May 25, 2025",
      time: "4:30 PM",
      type: "virtual"
    },
    {
      title: "Growth Assessment",
      date: "June 5, 2025",
      time: "3:00 PM",
      type: "in-person"
    }
  ];

  const messages = [
    {
      id: "1",
      from: "Ms. Johnson",
      content: "Maya showed great improvement in her reading skills today!",
      time: "1 hour ago",
      read: false
    },
    {
      id: "2",
      from: "Admin",
      content: "New monthly report available for review",
      time: "Yesterday",
      read: true
    }
  ];

  const renderGrowthAreaBadge = (rating: string) => {
    const badgeStyles = {
      'excellent': 'bg-observer-accent text-white',
      'good': 'bg-observer-light text-foreground',
      'fair': 'bg-observer-secondary text-white',
      'needs-work': 'bg-destructive text-destructive-foreground'
    };
    
    return badgeStyles[rating as keyof typeof badgeStyles];
  };

  const getOverallBadgeColor = (score: string) => {
    switch (score) {
      case "Excellent":
        return "bg-observer-accent text-white";
      case "Good":
        return "bg-observer-light text-foreground";
      case "Fair":
        return "bg-observer-secondary text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's the latest on your child's development journey.
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>My Children</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {children.map(child => (
              <div key={child.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={child.profileImage} alt={child.name} />
                  <AvatarFallback className="bg-observer-primary text-white text-lg">
                    {child.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{child.name}</h4>
                  <p className="text-sm text-muted-foreground">{child.age} • {child.class}</p>
                  <p className="text-sm mt-1">Observer: {child.observer}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Reports
                    </Button>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Growth Reports</CardTitle>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  All Reports
                </Button>
              </div>
              <CardDescription>Latest development assessments for Maya</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map(report => (
                  <div key={report.id} className={`report-card ${report.overallScore.toLowerCase()}`}>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{report.date}</h4>
                          <p className="text-sm text-muted-foreground">
                            Theme: {report.theme}
                          </p>
                        </div>
                        <Badge className={getOverallBadgeColor(report.overallScore)}>
                          {report.overallScore}
                        </Badge>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Growth Areas Activated</span>
                          <span>{report.activatedAreas}/{report.totalAreas}</span>
                        </div>
                        <Progress value={report.activatedAreas / report.totalAreas * 100} className="h-2" />
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(report.growthAreas).map(([area, rating]) => (
                          <Badge key={area} className={renderGrowthAreaBadge(rating)}>
                            {area.charAt(0).toUpperCase() + area.slice(1)}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex items-center">
                        <Star className="h-4 w-4 text-observer-light mr-1" />
                        <span className="text-sm">Curiosity Seed: {report.curiositySeed}</span>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="mt-4 w-full justify-center">
                        View Full Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Scheduled meetings and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                    <div className="emoji-circle">
                      <Calendar className="h-5 w-5 text-observer-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date} at {event.time}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Messages</CardTitle>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map(message => (
                  <div key={message.id} className="p-3 border rounded-lg bg-card relative">
                    {!message.read && (
                      <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-observer-primary"></div>
                    )}
                    <p className="font-medium text-sm">{message.from}</p>
                    <p className="text-sm mt-1">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{message.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full justify-center">
                Send Message
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
