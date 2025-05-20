
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, User, Pencil, Trash2, Upload, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Child } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Papa from 'papaparse';

const StudentsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [students, setStudents] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{status: 'idle' | 'loading' | 'success' | 'error', message: string}>({
    status: 'idle',
    message: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    class: '',
    grade: '1', // Default to grade 1
    phone: ''
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
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
        grade: student.grade,
        phoneNumber: student.phone_number,
        parentIds: [], // We would populate this in a real implementation
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGradeChange = (value: string) => {
    setFormData(prev => ({ ...prev, grade: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('children')
        .insert([
          { 
            name: formData.name,
            date_of_birth: formData.dateOfBirth,
            class: formData.class,
            grade: parseInt(formData.grade),
            phone_number: formData.phone
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Student added successfully! A parent account has been automatically created.'
      });
      
      // Reset form and close dialog
      setFormData({ name: '', dateOfBirth: '', class: '', grade: '1', phone: '' });
      setOpen(false);
      
      // Refresh student list
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({
      status: 'loading',
      message: 'Processing CSV file...'
    });

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const { data, errors } = results;
            if (errors.length > 0) {
              throw new Error('CSV parsing failed');
            }

            // Validate data structure
            const requiredHeaders = ['name', 'date_of_birth', 'class', 'grade', 'phone_number'];
            const firstRow = data[0] as any;
            const missingHeaders = requiredHeaders.filter(header => !(header in firstRow));
            
            if (missingHeaders.length > 0) {
              throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
            }

            // Format the data for insertion
            const formattedData = (data as any[]).map(row => ({
              name: row.name,
              date_of_birth: row.date_of_birth,
              class: row.class,
              grade: parseInt(row.grade),
              phone_number: row.phone_number
            }));

            // Insert data into Supabase
            const { error } = await supabase
              .from('children')
              .insert(formattedData);

            if (error) throw error;

            setImportStatus({
              status: 'success',
              message: `Successfully imported ${formattedData.length} students`
            });

            toast({
              title: 'Import Successful',
              description: `${formattedData.length} students have been added`
            });

            // Refresh student list
            fetchStudents();
            
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
            
            setTimeout(() => {
              setCsvDialogOpen(false);
              setImportStatus({ status: 'idle', message: '' });
            }, 2000);
            
          } catch (error: any) {
            console.error('CSV import error:', error);
            setImportStatus({
              status: 'error',
              message: error.message || 'Failed to import data'
            });
            toast({
              title: 'Import Failed',
              description: error.message || 'Failed to import students',
              variant: 'destructive',
            });
          }
        }
      });
    } catch (error: any) {
      setImportStatus({
        status: 'error',
        message: error.message || 'Failed to process file'
      });
      toast({
        title: 'Error',
        description: 'Failed to process CSV file',
        variant: 'destructive',
      });
    }
  };

  const downloadCsvTemplate = () => {
    const headers = ['name', 'date_of_birth', 'class', 'grade', 'phone_number'];
    const sampleData = ['John Doe', '2018-01-01', '1A', '1', '1234567890'];
    
    const csv = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Students</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all students in the system' : 'View and manage your assigned students'}
          </p>
        </div>

        <div className="flex space-x-2">
          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Students from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with student data. The CSV should include columns for name, date_of_birth (YYYY-MM-DD), class, grade (1-12), and phone_number.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <Button onClick={downloadCsvTemplate} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvImport}
                  disabled={importStatus.status === 'loading'}
                />
                
                {importStatus.status !== 'idle' && (
                  <Alert variant={importStatus.status === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{importStatus.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter the student's information below. A parent account will be automatically created.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dateOfBirth" className="text-right">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Parent's phone number"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="class" className="text-right">
                      Class
                    </Label>
                    <Input
                      id="class"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grade" className="text-right">
                      Grade
                    </Label>
                    <Select 
                      value={formData.grade}
                      onValueChange={handleGradeChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Student</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading students...
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No students found. Add your first student using the button above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <Card key={student.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{student.name}</CardTitle>
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    {student.profileImage ? (
                      <img 
                        src={student.profileImage} 
                        alt={student.name} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardDescription>
                  Class: {student.class} | Grade: {student.grade || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  <p>Born: {new Date(student.dateOfBirth).toLocaleDateString()}</p>
                  {student.phoneNumber && <p>Phone: {student.phoneNumber}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default StudentsPage;
