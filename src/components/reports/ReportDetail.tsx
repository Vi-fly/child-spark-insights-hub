
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Heart, Users, Palette, Activity, Compass, GraduationCap, Download, Printer, Star } from 'lucide-react';
import { Report, GrowthArea, GrowthAreaType, GrowthAreaRating } from '@/types';

interface ReportDetailProps {
  report: Report;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report }) => {
  const getGrowthAreaIcon = (area: GrowthAreaType) => {
    switch (area) {
      case 'Intellectual':
        return <Brain className="h-5 w-5" />;
      case 'Emotional':
        return <Heart className="h-5 w-5" />;
      case 'Social':
        return <Users className="h-5 w-5" />;
      case 'Creativity':
        return <Palette className="h-5 w-5" />;
      case 'Physical':
        return <Activity className="h-5 w-5" />;
      case 'Values':
        return <Compass className="h-5 w-5" />;
      case 'Independence':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getRatingSymbol = (rating: GrowthAreaRating) => {
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

  const getRatingLabel = (rating: GrowthAreaRating) => {
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
                <p className="text-sm text-muted-foreground">🧒 Child's Name</p>
                <p className="font-medium">Arnav</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">📅 Date</p>
                <p className="font-medium">{report.date}</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">🎯 Theme of the Day</p>
                <p className="font-medium">{report.theme}</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">🌱 Curiosity Seed Explored</p>
                <p className="font-medium">{report.curiositySeed}</p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">🧠 Overall Growth Score</p>
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
                <h3 className="font-semibold">🌈 Curiosity Response Index: {report.curiosityResponseIndex} / 10</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Arnav showed moderate interest in today's curiosity seed ({report.curiositySeed}), asking follow-up questions and showing openness to underwater experiences. Potential area of future interest.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Growth Metrics & Observations</CardTitle>
          <CardDescription>Detailed assessment of each developmental area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Growth Area</th>
                  <th className="py-3 px-4 text-left">Rating</th>
                  <th className="py-3 px-4 text-left">Observation Summary</th>
                </tr>
              </thead>
              <tbody>
                {report.growthAreas.map((area, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{area.emoji}</span>
                        <span>{area.area}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span>{getRatingSymbol(area.rating)}</span>
                        <span className="ml-2">{getRatingLabel(area.rating)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{area.observation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📣 Parent Note</CardTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
