
export type UserRole = 'admin' | 'observer' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
}

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  class: string;
  grade?: number;
  phoneNumber?: string;
  parentIds: string[];
  observerId?: string;
  profileImage?: string;
}

export interface Observer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  assignedChildIds: string[];
  profileImage?: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  childIds: string[];
  profileImage?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export type GrowthAreaType = 
  | 'Intellectual'
  | 'Emotional'
  | 'Social'
  | 'Creativity'
  | 'Physical'
  | 'Values'
  | 'Independence';

export type QuestionType =
  | 'Dynamic'
  | 'Curiosity'
  | GrowthAreaType;

export interface ReportSummary {
  id: string;
  childId: string;
  observerId: string;
  date: string;
  theme: string;
  curiositySeed: string;
  overallScore: string;
  curiosityResponseIndex: number;
}

export type GrowthAreaRating = 'excellent' | 'good' | 'fair' | 'needs-work';

export interface GrowthArea {
  area: GrowthAreaType;
  rating: GrowthAreaRating;
  observation: string;
  emoji: string;
}

export interface Report extends ReportSummary {
  growthAreas: GrowthArea[];
  activatedAreas: number;
  totalAreas: number;
  parentNote: string;
  audioId?: string;
  imageIds?: string[];
}

export interface Media {
  id: string;
  childId: string;
  type: 'audio' | 'image';
  url: string;
  dateCreated: string;
  description?: string;
  processedText?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  reportId?: string;
  isPinned: boolean;
}

export interface AIQuestion {
  id: string;
  childId: string;
  observerId: string;
  question: string;
  questionType: QuestionType;
  isAnswered: boolean;
  createdAt: string;
}

export type GoalStatus = 'not-started' | 'in-progress' | 'completed';

export interface Goal {
  id: string;
  childId: string;
  observerId: string;
  title: string;
  description: string;
  status: GoalStatus;
  dueDate?: string;
}

export interface MonthlyReport {
  id: string;
  childId: string;
  observerId: string;
  month: number;
  year: number;
  summary: string;
  growthSummary?: Record<GrowthAreaType, any>;
  adminReviewed: boolean;
  sentToParent: boolean;
}
