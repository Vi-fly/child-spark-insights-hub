
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Child } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentSelectorProps {
  onStudentSelect: (student: Child) => void;
}

const StudentSelector: React.FC<StudentSelectorProps> = ({ onStudentSelect }) => {
  const [students, setStudents] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('children')
          .select('*');

        if (error) {
          throw error;
        }

        const formattedStudents: Child[] = data.map(student => ({
          id: student.id,
          name: student.name,
          dateOfBirth: student.date_of_birth,
          class: student.class,
          parentIds: [], // We'll populate this in a real implementation
          profileImage: student.profile_image_url || undefined
        }));

        setStudents(formattedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'Failed to load students. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [toast]);

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    const selectedStudent = students.find(student => student.id === value);
    if (selectedStudent) {
      onStudentSelect(selectedStudent);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Student</CardTitle>
        <CardDescription>Choose a student to create a report for</CardDescription>
      </CardHeader>
      <CardContent>
        <Select 
          value={selectedStudentId} 
          onValueChange={handleStudentChange}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a student" />
          </SelectTrigger>
          <SelectContent>
            {students.map(student => (
              <SelectItem key={student.id} value={student.id}>
                {student.name} - {student.class}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default StudentSelector;
