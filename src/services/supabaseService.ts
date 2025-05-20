
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import {
  User,
  UserRole,
  Child,
  Observer,
  Parent,
  Admin,
  Report,
  ReportSummary,
  GrowthArea,
  Message,
  AIQuestion,
  Goal,
  GoalStatus,
  MonthlyReport,
  GrowthAreaType,
  GrowthAreaRating,
  QuestionType,
  Media
} from '@/types';

// Authentication
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  if (!data.user) throw new Error('No user returned from auth');
  
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  if (!profileData) throw new Error('No profile found');
  
  // Ensure the role is a valid UserRole type
  const role = profileData.role as UserRole;
  if (!['admin', 'observer', 'parent'].includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  const user: User = {
    id: profileData.id,
    name: profileData.name,
    email: profileData.email,
    role: role,
    profileImage: profileData.profile_image_url || undefined,
  };
  
  return user;
};

// User management
export const fetchUserProfile = async (userId: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  if (!data) throw new Error('No profile found');
  
  // Validate that the role is a valid UserRole
  const role = data.role as UserRole;
  if (!['admin', 'observer', 'parent'].includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: role,
    profileImage: data.profile_image_url || undefined,
  };
};

// Admin
export const fetchAllAdmins = async (): Promise<Admin[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin');
  
  if (error) throw error;
  
  return data.map(admin => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    profileImage: admin.profile_image_url || undefined,
  }));
};

// Observers
export const fetchAllObservers = async (): Promise<Observer[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      observer_child_mappings!inner(child_id)
    `)
    .eq('role', 'observer');
  
  if (error) throw error;
  
  return data.map(observer => {
    // Extract assigned child IDs
    const assignedChildIds = Array.isArray(observer.observer_child_mappings) 
      ? observer.observer_child_mappings.map((mapping: any) => mapping.child_id)
      : [];
    
    return {
      id: observer.id,
      name: observer.name,
      email: observer.email,
      phone: observer.phone || undefined,
      specialization: observer.specialization || undefined,
      assignedChildIds,
      profileImage: observer.profile_image_url || undefined,
    };
  });
};

// Parents
export const fetchAllParents = async (): Promise<Parent[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      parent_child_mappings!inner(child_id)
    `)
    .eq('role', 'parent');
  
  if (error) throw error;
  
  return data.map(parent => {
    // Extract child IDs
    const childIds = Array.isArray(parent.parent_child_mappings) 
      ? parent.parent_child_mappings.map((mapping: any) => mapping.child_id)
      : [];
    
    return {
      id: parent.id,
      name: parent.name,
      email: parent.email,
      phone: parent.phone || undefined,
      childIds,
      profileImage: parent.profile_image_url || undefined,
    };
  });
};

// Children
export const fetchAllChildren = async (): Promise<Child[]> => {
  const { data, error } = await supabase
    .from('children')
    .select(`
      *,
      parent_child_mappings(parent_id),
      observer_child_mappings(observer_id)
    `);
  
  if (error) throw error;
  
  return data.map(child => {
    // Extract parent IDs
    const parentIds = Array.isArray(child.parent_child_mappings) 
      ? child.parent_child_mappings.map((mapping: any) => mapping.parent_id)
      : [];
    
    // Extract observer ID if available
    const observerId = Array.isArray(child.observer_child_mappings) && child.observer_child_mappings.length > 0
      ? child.observer_child_mappings[0].observer_id
      : undefined;
    
    return {
      id: child.id,
      name: child.name,
      dateOfBirth: child.date_of_birth,
      class: child.class,
      parentIds,
      observerId,
      profileImage: child.profile_image_url || undefined,
    };
  });
};

// Reports
export const fetchReportSummaries = async (childId?: string): Promise<ReportSummary[]> => {
  let query = supabase
    .from('reports')
    .select('id, child_id, observer_id, date, theme, curiosity_seed, overall_score, curiosity_response_index');
  
  if (childId) {
    query = query.eq('child_id', childId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data.map(report => ({
    id: report.id,
    childId: report.child_id,
    observerId: report.observer_id,
    date: report.date,
    theme: report.theme,
    curiositySeed: report.curiosity_seed,
    overallScore: report.overall_score,
    curiosityResponseIndex: report.curiosity_response_index,
  }));
};

export const fetchReportDetails = async (reportId: string): Promise<Report> => {
  // Fetch report data
  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();
  
  if (reportError) throw reportError;
  if (!reportData) throw new Error('Report not found');
  
  // Fetch growth areas for this report
  const { data: growthAreasData, error: growthAreasError } = await supabase
    .from('growth_areas')
    .select('*')
    .eq('report_id', reportId);
  
  if (growthAreasError) throw growthAreasError;
  
  // Transform growth areas data to match our type
  const growthAreas: GrowthArea[] = growthAreasData.map(area => ({
    area: area.area as GrowthAreaType,
    rating: area.rating as GrowthAreaRating,
    observation: area.observation,
    emoji: area.emoji || '',
  }));
  
  // Calculate activated areas
  const activatedAreas = growthAreas.filter(area => 
    area.rating !== 'needs-work'
  ).length;
  
  return {
    id: reportData.id,
    childId: reportData.child_id,
    observerId: reportData.observer_id,
    date: reportData.date,
    theme: reportData.theme,
    curiositySeed: reportData.curiosity_seed,
    overallScore: reportData.overall_score,
    curiosityResponseIndex: reportData.curiosity_response_index,
    growthAreas,
    activatedAreas,
    totalAreas: growthAreas.length,
    parentNote: reportData.parent_note || '',
  };
};

// AI Questions
export const fetchAIQuestions = async (childId: string): Promise<AIQuestion[]> => {
  const { data, error } = await supabase
    .from('ai_questions')
    .select('*')
    .eq('child_id', childId);
  
  if (error) throw error;
  
  return data.map(question => ({
    id: question.id,
    childId: question.child_id,
    observerId: question.observer_id,
    question: question.question,
    questionType: question.question_type as QuestionType,
    isAnswered: question.is_answered,
    createdAt: question.created_at,
  }));
};

// Goals
export const fetchGoals = async (childId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('child_id', childId);
  
  if (error) throw error;
  
  return data.map(goal => ({
    id: goal.id,
    childId: goal.child_id,
    observerId: goal.observer_id,
    title: goal.title,
    description: goal.description,
    status: goal.status as GoalStatus,
    dueDate: goal.due_date || undefined,
  }));
};

export const createGoal = async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      child_id: goal.childId,
      observer_id: goal.observerId,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      due_date: goal.dueDate,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    childId: data.child_id,
    observerId: data.observer_id,
    title: data.title,
    description: data.description,
    status: data.status as GoalStatus,
    dueDate: data.due_date || undefined,
  };
};

// Monthly Reports
export const fetchMonthlyReports = async (childId: string): Promise<MonthlyReport[]> => {
  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('child_id', childId);
  
  if (error) throw error;
  
  return data.map(report => {
    // Transform the JSON growth summary into a Record<GrowthAreaType, any>
    let growthSummary: Record<GrowthAreaType, any> = {} as Record<GrowthAreaType, any>;
    
    if (report.growth_summary) {
      const summaryObj = report.growth_summary as Record<string, any>;
      // Only include valid GrowthAreaType keys
      const validGrowthAreas: GrowthAreaType[] = [
        'Intellectual', 'Emotional', 'Social', 'Creativity', 
        'Physical', 'Values', 'Independence'
      ];
      
      validGrowthAreas.forEach(area => {
        if (summaryObj[area]) {
          growthSummary[area] = summaryObj[area];
        }
      });
    }
    
    return {
      id: report.id,
      childId: report.child_id,
      observerId: report.observer_id,
      month: report.month,
      year: report.year,
      summary: report.summary,
      growthSummary,
      adminReviewed: report.admin_reviewed,
      sentToParent: report.sent_to_parent,
    };
  });
};

// Media resources
export const fetchMediaForChild = async (childId: string): Promise<Media[]> => {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('child_id', childId);
  
  if (error) throw error;
  
  return data.map(media => ({
    id: media.id,
    childId: media.child_id,
    type: media.type,
    url: media.url,
    dateCreated: media.date_created,
    description: media.description || undefined,
    processedText: media.processed_text || undefined,
  }));
};

// Messages
export const fetchMessagesForUser = async (userId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  
  if (error) throw error;
  
  return data.map(message => ({
    id: message.id,
    senderId: message.sender_id,
    receiverId: message.receiver_id,
    content: message.content,
    timestamp: message.created_at,
    read: message.read,
    reportId: message.report_id || undefined,
    isPinned: message.is_pinned,
  }));
};
