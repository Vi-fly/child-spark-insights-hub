
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FileText, Camera, Headphones, Plus, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ObserverDashboard = () => {
  const assignedStudents = [
    {
      id: "1",
      name: "Alex Chen",
      profileImage: "",
      age: "7 years",
      class: "Grade 2",
      lastReport: "2 days ago",
    },
    {
      id: "2",
      name: "Maya Patel",
      profileImage: "",
      age: "6 years",
      class: "Grade 1",
      lastReport: "Yesterday",
    },
    {
      id: "3",
      name: "Lucas Johnson",
      profileImage: "",
      age: "8 years",
      class: "Grade 3",
      lastReport: "1 week ago",
    },
    {
      id: "4",
      name: "Emma Thompson",
      profileImage: "",
      age: "6 years",
      class: "Grade 1",
      lastReport: "3 days ago",
    }
  ];

  const upcomingSessions = [
    {
      studentName: "Alex Chen",
      date: "Today",
      time: "3:30 PM",
      focus: "Language development",
    },
    {
      studentName: "Maya Patel",
      date: "Tomorrow",
      time: "2:00 PM",
      focus: "Social skills",
    },
    {
      studentName: "Lucas Johnson",
      date: "May 22, 2025",
      time: "4:15 PM",
      focus: "Math concepts",
    },
  ];

  const recentReports = [
    {
      id: "1",
      studentName: "Maya Patel",
      date: "May 18, 2025",
      theme: "Ocean Life",
      overallScore: "Good",
      curiosityIndex: 8.5,
    },
    {
      id: "2",
      studentName: "Alex Chen",
      date: "May 16, 2025",
      theme: "Space Exploration",
      overallScore: "Excellent",
      curiosityIndex: 9.2,
    },
    {
      id: "3",
      studentName: "Emma Thompson",
      date: "May 14, 2025",
      theme: "Animal Habitats",
      overallScore: "Fair",
      curiosityIndex: 6.3,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight">Observer Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your students and upcoming sessions.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assigned Students</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assignedStudents.map(student => (
              <Card key={student.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.profileImage} alt={student.name} />
                      <AvatarFallback className="bg-observer-primary text-white">
                        {student.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant="outline" className="bg-muted">
                      {student.class}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <h4 className="font-medium text-lg">{student.name}</h4>
                  <p className="text-sm text-muted-foreground">{student.age}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    <span>Last report: {student.lastReport}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    View profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Sessions</CardTitle>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
            <CardDescription>Your next sessions with students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className="emoji-circle bg-observer-primary/10">
                      <Clock className="h-5 w-5 text-observer-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{session.studentName}</p>
                      <p className="text-xs text-muted-foreground">Focus: {session.focus}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{session.date}</p>
                    <p className="text-xs text-muted-foreground">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reports</CardTitle>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                All Reports
              </Button>
            </div>
            <CardDescription>Recently generated child reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map(report => {
                let badgeColor = "bg-observer-accent text-white";
                if (report.overallScore === "Good") {
                  badgeColor = "bg-observer-light text-foreground";
                } else if (report.overallScore === "Fair") {
                  badgeColor = "bg-observer-secondary text-white";
                }
                
                return (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div>
                      <p className="font-medium">{report.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.date} • {report.theme}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Curiosity</p>
                        <p className="text-sm font-medium">{report.curiosityIndex}</p>
                      </div>
                      <Badge className={badgeColor}>
                        {report.overallScore}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5 text-observer-primary" />
              Capture Image
            </CardTitle>
            <CardDescription>Upload and analyze images</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload images to analyze a child's work, environment, or activities.
            </p>
            <Button className="w-full">
              Upload Images
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Headphones className="mr-2 h-5 w-5 text-observer-secondary" />
              Record Audio
            </CardTitle>
            <CardDescription>Record and transcribe sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Record audio from your sessions to automatically transcribe and analyze.
            </p>
            <Button variant="secondary" className="w-full">
              Start Recording
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-observer-accent" />
              Generate Report
            </CardTitle>
            <CardDescription>Create AI-powered growth reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate comprehensive growth reports based on your observations and data.
            </p>
            <Button variant="outline" className="w-full">
              Create New Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ObserverDashboard;
