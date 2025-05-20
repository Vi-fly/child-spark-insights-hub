
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Child, 
  Report, 
  GrowthArea, 
  AIQuestion, 
  Goal, 
  MonthlyReport,
  Message,
  QuestionType,
  GrowthAreaType
} from '@/types';

// Auth functions
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    profileImage: data.profile_image_url
  };
};

// Children functions
export const getChildren = async (filterByUser = true): Promise<Child[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  // Get user role
  const { data: userData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (!userData) return [];
  
  let query = supabase.from('children').select(`
    *,
    parent_child_mappings!inner(parent_id),
    observer_child_mappings(observer_id)
  `);
  
  // Apply filters based on user role
  if (filterByUser) {
    if (userData.role === 'parent') {
      query = query.eq('parent_child_mappings.parent_id', user.id);
    } else if (userData.role === 'observer') {
      query = query.eq('observer_child_mappings.observer_id', user.id);
    }
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error('Error fetching children:', error);
    return [];
  }
  
  return data.map(child => ({
    id: child.id,
    name: child.name,
    dateOfBirth: child.date_of_birth,
    class: child.class,
    parentIds: child.parent_child_mappings.map((m: any) => m.parent_id),
    observerId: child.observer_child_mappings[0]?.observer_id,
    profileImage: child.profile_image_url
  }));
};

// Reports functions
export const getReports = async (childId?: string): Promise<Report[]> => {
  let query = supabase.from('reports').select(`
    *,
    growth_areas(*)
  `);
  
  if (childId) {
    query = query.eq('child_id', childId);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error('Error fetching reports:', error);
    return [];
  }
  
  return data.map(report => ({
    id: report.id,
    childId: report.child_id,
    observerId: report.observer_id,
    date: report.date,
    theme: report.theme,
    curiositySeed: report.curiosity_seed,
    overallScore: report.overall_score,
    curiosityResponseIndex: report.curiosity_response_index,
    growthAreas: report.growth_areas.map((area: any) => ({
      area: area.area as GrowthAreaType,
      rating: area.rating,
      observation: area.observation,
      emoji: area.emoji || ''
    })),
    activatedAreas: report.growth_areas.length,
    totalAreas: 7, // Total number of growth areas
    parentNote: report.parent_note || '',
  }));
};

export const createReport = async (report: Omit<Report, 'id' | 'activatedAreas' | 'totalAreas'>): Promise<Report | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // First, insert the report
  const { data: reportData, error: reportError } = await supabase
    .from('reports')
    .insert({
      child_id: report.childId,
      observer_id: report.observerId,
      date: report.date,
      theme: report.theme,
      curiosity_seed: report.curiositySeed,
      overall_score: report.overallScore,
      curiosity_response_index: report.curiosityResponseIndex,
      parent_note: report.parentNote
    })
    .select()
    .single();
    
  if (reportError || !reportData) {
    console.error('Error creating report:', reportError);
    return null;
  }
  
  // Then, insert the growth areas
  const growthAreasToInsert = report.growthAreas.map(area => ({
    report_id: reportData.id,
    area: area.area,
    rating: area.rating,
    observation: area.observation,
    emoji: area.emoji
  }));
  
  const { data: growthAreasData, error: growthAreasError } = await supabase
    .from('growth_areas')
    .insert(growthAreasToInsert)
    .select();
    
  if (growthAreasError) {
    console.error('Error creating growth areas:', growthAreasError);
  }
  
  // Return the complete report
  return {
    ...report,
    id: reportData.id,
    activatedAreas: growthAreasToInsert.length,
    totalAreas: 7
  };
};

// AI Questions functions
export const getAIQuestions = async (childId: string, questionType?: QuestionType): Promise<AIQuestion[]> => {
  let query = supabase.from('ai_questions').select('*').eq('child_id', childId);
  
  if (questionType) {
    query = query.eq('question_type', questionType);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error('Error fetching AI questions:', error);
    return [];
  }
  
  return data.map(question => ({
    id: question.id,
    childId: question.child_id,
    observerId: question.observer_id,
    question: question.question,
    questionType: question.question_type as QuestionType,
    isAnswered: question.is_answered,
    createdAt: question.created_at
  }));
};

export const createAIQuestion = async (question: Omit<AIQuestion, 'id' | 'createdAt'>): Promise<AIQuestion | null> => {
  const { data, error } = await supabase
    .from('ai_questions')
    .insert({
      child_id: question.childId,
      observer_id: question.observerId,
      question: question.question,
      question_type: question.questionType,
      is_answered: question.isAnswered
    })
    .select()
    .single();
    
  if (error || !data) {
    console.error('Error creating AI question:', error);
    return null;
  }
  
  return {
    id: data.id,
    childId: data.child_id,
    observerId: data.observer_id,
    question: data.question,
    questionType: data.question_type as QuestionType,
    isAnswered: data.is_answered,
    createdAt: data.created_at
  };
};

// Goals functions
export const getGoals = async (childId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('child_id', childId);
    
  if (error || !data) {
    console.error('Error fetching goals:', error);
    return [];
  }
  
  return data.map(goal => ({
    id: goal.id,
    childId: goal.child_id,
    observerId: goal.observer_id,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    dueDate: goal.due_date
  }));
};

export const createGoal = async (goal: Omit<Goal, 'id'>): Promise<Goal | null> => {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      child_id: goal.childId,
      observer_id: goal.observerId,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      due_date: goal.dueDate
    })
    .select()
    .single();
    
  if (error || !data) {
    console.error('Error creating goal:', error);
    return null;
  }
  
  return {
    id: data.id,
    childId: data.child_id,
    observerId: data.observer_id,
    title: data.title,
    description: data.description,
    status: data.status,
    dueDate: data.due_date
  };
};

// Monthly Report functions
export const getMonthlyReports = async (childId?: string): Promise<MonthlyReport[]> => {
  let query = supabase.from('monthly_reports').select('*');
  
  if (childId) {
    query = query.eq('child_id', childId);
  }
  
  const { data, error } = await query;
  
  if (error || !data) {
    console.error('Error fetching monthly reports:', error);
    return [];
  }
  
  return data.map(report => ({
    id: report.id,
    childId: report.child_id,
    observerId: report.observer_id,
    month: report.month,
    year: report.year,
    summary: report.summary,
    growthSummary: report.growth_summary,
    adminReviewed: report.admin_reviewed,
    sentToParent: report.sent_to_parent
  }));
};

// Messages functions
export const getMessages = async (userId?: string): Promise<Message[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !userId) return [];
  
  const currentUserId = userId || user?.id;
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false });
    
  if (error || !data) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data.map(message => ({
    id: message.id,
    senderId: message.sender_id,
    receiverId: message.receiver_id,
    content: message.content,
    timestamp: message.created_at,
    read: message.read,
    reportId: message.report_id,
    isPinned: message.is_pinned
  }));
};

// Upload functions for media
export const uploadProfileImage = async (file: File, userId: string): Promise<string | null> => {
  const filePath = `profiles/${userId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('profile_images')
    .upload(filePath, file);
    
  if (error || !data) {
    console.error('Error uploading profile image:', error);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('profile_images')
    .getPublicUrl(data.path);
    
  return publicUrl;
};

export const uploadReportMedia = async (file: File, reportId: string): Promise<string | null> => {
  const filePath = `reports/${reportId}/${file.name}`;
  const { data, error } = await supabase.storage
    .from('report_media')
    .upload(filePath, file);
    
  if (error || !data) {
    console.error('Error uploading report media:', error);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('report_media')
    .getPublicUrl(data.path);
    
  return publicUrl;
};
