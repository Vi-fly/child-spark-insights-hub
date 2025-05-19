
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Users, Palette, Activity, Compass, GraduationCap, Download, Printer, Star } from 'lucide-react';
import { Report, GrowthArea } from '@/types';

interface ReportDetailProps {
  report: Report;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report }) => {
  const getGrowthAreaIcon = (area: string) => {
    switch (area) {
      case 'intellectual':
        return <Brain className="h-5 w-5" />;
      case 'emotional':
        return <Heart className="h-5 w-5" />;
      case 'social':
        return <Users className="h-5 w-5" />;
      case 'creativity':
        return <Palette className="h-5 w-5" />;
      case 'physical':
        return <Activity className="h-5 w-5" />;
      case 'values':
        return <Compass className="h-5 w-5" />;
      case 'independence':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getRatingSymbol = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '✅';
      case 'good':
        return '✅';
      case 'fair':
        return '⚠️';
      case 'needs-work':
        return '❌';
      default:
        return '';
    }
  };

  const getRatingLabel = (rating: string) => {
    return rating.charAt(0).toUpperCase() + rating.slice(1).replace('-', ' ');
  };

  const getOverallScoreBadge = (score: string) => {
    if (score.includes('Good')) return 'bg-observer-light text-foreground';
    if (score.includes('Balanced')) return 'bg-observer-accent text-white';
    if (score.includes('Moderate')) return 'bg-observer-secondary text-white';
    if (score.includes('Needs')) return 'bg-destructive text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Growth Report</h1>
          <p className="text-muted-foreground">
            For {report.date}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
          <CardDescription>Overview of today's developmental progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Theme of the Day</p>
                <p className="font-medium">{report.theme}</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Curiosity Seed Explored</p>
                <p className="font-medium">{report.curiositySeed}</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Overall Growth Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getOverallScoreBadge(report.overallScore)}>
                    {report.overallScore}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Growth Areas Activated</span>
                <span>{report.activatedAreas}/{report.totalAreas}</span>
              </div>
              <Progress value={(report.activatedAreas / report.totalAreas) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-observer-light" />
                <h3 className="font-semibold">Curiosity Response Index: {report.curiosityResponseIndex} / 10</h3>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth Metrics & Observations</CardTitle>
          <CardDescription>Detailed assessment of each developmental area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.growthAreas.map((area, index) => (
              <div 
                key={index} 
                className={`report-card ${area.rating} p-4`}
              >
                <div className="flex items-start gap-4">
                  <div className="emoji-circle">
                    {getGrowthAreaIcon(area.area.toLowerCase())}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <span>{area.emoji}</span>
                        <span>{area.area}</span>
                      </h3>
                      <Badge className={`report-card ${area.rating}`}>
                        {getRatingSymbol(area.rating)} {getRatingLabel(area.rating)}
                      </Badge>
                    </div>
                    <p className="mt-2">{area.observation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent Note</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-muted/20">
            <p className="italic">{report.parentNote}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="font-medium mb-2">Rating Scale</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>✅</span> Excellent: Clear growth with evidence
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span> Good: Positive engagement observed
                </li>
                <li className="flex items-center gap-2">
                  <span>⚠️</span> Fair: Some engagement, needs encouragement
                </li>
                <li className="flex items-center gap-2">
                  <span>❌</span> Needs Work: Area not activated today
                </li>
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Overall Score</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge className="bg-observer-accent text-white">🟢</Badge> Good (6–7 active areas)
                </li>
                <li className="flex items-center gap-2">
                  <Badge className="bg-observer-secondary text-white">🟡</Badge> Moderate (3–5 areas)
                </li>
                <li className="flex items-center gap-2">
                  <Badge className="bg-destructive text-white">🔴</Badge> Needs Encouragement (1–2 areas)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDetail;
