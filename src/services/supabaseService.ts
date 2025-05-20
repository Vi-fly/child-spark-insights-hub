
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
  
  // Validate the role before assigning it to ensure it's a valid UserRole
  const roleValue = profileData.role as string;
  let role: UserRole;
  
  if (roleValue === 'admin' || roleValue === 'observer' || roleValue === 'parent') {
    role = roleValue;
  } else {
    throw new Error(`Invalid role: ${roleValue}`);
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
  const roleValue = data.role as string;
  let role: UserRole;
  
  if (roleValue === 'admin' || roleValue === 'observer' || roleValue === 'parent') {
    role = roleValue;
  } else {
    throw new Error(`Invalid role: ${roleValue}`);
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
      id, name, email, profile_image_url, role, created_at, updated_at,
      observer_child_mappings!inner(child_id)
    `)
    .eq('role', 'observer');
  
  if (error) throw error;
  
  return data.map(observer => {
    // Extract assigned child IDs
    const assignedChildIds = Array.isArray(observer.observer_child_mappings) 
      ? observer.observer_child_mappings.map((mapping: any) => mapping.child_id)
      : [];
    
    // For fields that might be missing in the database, use default values
    return {
      id: observer.id,
      name: observer.name,
      email: observer.email,
      phone: undefined, // Since it doesn't exist in the database schema
      specialization: undefined, // Since it doesn't exist in the database schema
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
      id, name, email, profile_image_url, role, created_at, updated_at,
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
      phone: undefined, // Since it doesn't exist in the database schema
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
  const growthAreas: GrowthArea[] = growthAreasData.map(area => {
    // Validate area and rating to ensure they match our types
    const areaType = validateGrowthAreaType(area.area);
    const ratingType = validateGrowthAreaRating(area.rating);
    
    return {
      area: areaType,
      rating: ratingType,
      observation: area.observation,
      emoji: area.emoji || '',
    };
  });
  
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

// Helper function to validate growth area type
function validateGrowthAreaType(value: string): GrowthAreaType {
  const validTypes: GrowthAreaType[] = [
    'Intellectual', 'Emotional', 'Social', 'Creativity', 
    'Physical', 'Values', 'Independence'
  ];
  
  if (validTypes.includes(value as GrowthAreaType)) {
    return value as GrowthAreaType;
  }
  
  // Default to Intellectual if invalid
  console.warn(`Invalid growth area type: ${value}, defaulting to Intellectual`);
  return 'Intellectual';
}

// Helper function to validate growth area rating
function validateGrowthAreaRating(value: string): GrowthAreaRating {
  const validRatings: GrowthAreaRating[] = [
    'excellent', 'good', 'fair', 'needs-work'
  ];
  
  if (validRatings.includes(value as GrowthAreaRating)) {
    return value as GrowthAreaRating;
  }
  
  // Default to 'fair' if invalid
  console.warn(`Invalid growth area rating: ${value}, defaulting to fair`);
  return 'fair';
}

// AI Questions
export const fetchAIQuestions = async (childId: string): Promise<AIQuestion[]> => {
  const { data, error } = await supabase
    .from('ai_questions')
    .select('*')
    .eq('child_id', childId);
  
  if (error) throw error;
  
  return data.map(question => {
    // Validate question type
    const questionTypeValue = question.question_type;
    let questionType: QuestionType;
    
    if (questionTypeValue === 'Dynamic' || questionTypeValue === 'Curiosity' || 
        ['Intellectual', 'Emotional', 'Social', 'Creativity', 
        'Physical', 'Values', 'Independence'].includes(questionTypeValue)) {
      questionType = questionTypeValue as QuestionType;
    } else {
      // Default to Dynamic if invalid
      console.warn(`Invalid question type: ${questionTypeValue}, defaulting to Dynamic`);
      questionType = 'Dynamic';
    }
    
    return {
      id: question.id,
      childId: question.child_id,
      observerId: question.observer_id,
      question: question.question,
      questionType,
      isAnswered: question.is_answered,
      createdAt: question.created_at,
    };
  });
};

// Goals
export const fetchGoals = async (childId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('child_id', childId);
  
  if (error) throw error;
  
  return data.map(goal => {
    // Validate goal status
    const statusValue = goal.status;
    let status: GoalStatus;
    
    if (statusValue === 'not-started' || statusValue === 'in-progress' || statusValue === 'completed') {
      status = statusValue as GoalStatus;
    } else {
      // Default to not-started if invalid
      console.warn(`Invalid goal status: ${statusValue}, defaulting to not-started`);
      status = 'not-started';
    }
    
    return {
      id: goal.id,
      childId: goal.child_id,
      observerId: goal.observer_id,
      title: goal.title,
      description: goal.description,
      status,
      dueDate: goal.due_date || undefined,
    };
  });
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
  
  // Validate goal status
  const statusValue = data.status;
  let status: GoalStatus;
  
  if (statusValue === 'not-started' || statusValue === 'in-progress' || statusValue === 'completed') {
    status = statusValue as GoalStatus;
  } else {
    // Default to not-started if invalid
    status = 'not-started';
  }
  
  return {
    id: data.id,
    childId: data.child_id,
    observerId: data.observer_id,
    title: data.title,
    description: data.description,
    status,
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
    let growthSummary: Record<GrowthAreaType, any> | undefined = undefined;
    
    if (report.growth_summary) {
      growthSummary = {} as Record<GrowthAreaType, any>;
      const summaryObj = report.growth_summary as Record<string, any>;
      // Only include valid GrowthAreaType keys
      const validGrowthAreas: GrowthAreaType[] = [
        'Intellectual', 'Emotional', 'Social', 'Creativity', 
        'Physical', 'Values', 'Independence'
      ];
      
      validGrowthAreas.forEach(area => {
        if (summaryObj[area]) {
          if (growthSummary) {
            growthSummary[area] = summaryObj[area];
          }
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

// Media resources - This function has been modified to handle the fact that the 'media' table
// doesn't exist in the Supabase schema yet
export const fetchMediaForChild = async (_childId: string): Promise<Media[]> => {
  // Since the media table doesn't exist yet, we return an empty array
  console.warn("The media table doesn't exist in the Supabase schema yet. Returning empty array.");
  return [];
  
  // When the media table is created, uncomment and use this code:
  /*
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('child_id', childId);
  
  if (error) throw error;
  
  return data.map(media => ({
    id: media.id,
    childId: media.child_id,
    type: media.type as 'audio' | 'image',
    url: media.url,
    dateCreated: media.date_created,
    description: media.description || undefined,
    processedText: media.processed_text || undefined,
  }));
  */
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
