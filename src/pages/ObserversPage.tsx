
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, User, Pencil, Trash2, Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Observer } from '@/types';
import Papa from 'papaparse';

const ObserversPage = () => {
  const [observers, setObservers] = useState<Observer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{status: 'idle' | 'loading' | 'success' | 'error', message: string}>({
    status: 'idle',
    message: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: ''
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchObservers();
  }, []);

  const fetchObservers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('observer_profiles')
        .select('*');

      if (error) {
        throw error;
      }

      const formattedObservers: Observer[] = data.map(observer => ({
        id: observer.id,
        name: observer.name,
        email: observer.email,
        phone: observer.phone_number || undefined,
        specialization: observer.specialization || undefined,
        assignedChildIds: [],
        profileImage: undefined
      }));

      setObservers(formattedObservers);
    } catch (error) {
      console.error('Error fetching observers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load observers. Please try again.',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate a simple password (this would be replaced with a secure method in production)
      const passwordHint = `${formData.name.split(' ')[0].toLowerCase()}123`;
      
      const { data, error } = await supabase
        .from('observer_profiles')
        .insert([
          { 
            id: self.crypto.randomUUID(),
            name: formData.name,
            email: formData.email,
            phone_number: formData.phone,
            specialization: formData.specialization,
            password_hint: passwordHint
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: `Observer added successfully! Default password: ${passwordHint}`
      });
      
      // Reset form and close dialog
      setFormData({ name: '', email: '', phone: '', specialization: '' });
      setOpen(false);
      
      // Refresh observer list
      fetchObservers();
    } catch (error) {
      console.error('Error adding observer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add observer. Please try again.',
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
            const requiredHeaders = ['name', 'email'];
            const firstRow = data[0] as any;
            const missingHeaders = requiredHeaders.filter(header => !(header in firstRow));
            
            if (missingHeaders.length > 0) {
              throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
            }

            // Format the data for insertion
            const formattedData = (data as any[]).map(row => {
              // Generate a simple password from name
              const passwordHint = `${row.name.split(' ')[0].toLowerCase()}123`;
              
              return {
                id: self.crypto.randomUUID(),
                name: row.name,
                email: row.email,
                phone_number: row.phone_number || null,
                specialization: row.specialization || null,
                password_hint: passwordHint
              };
            });

            // Insert data into Supabase
            const { error } = await supabase
              .from('observer_profiles')
              .insert(formattedData);

            if (error) throw error;

            setImportStatus({
              status: 'success',
              message: `Successfully imported ${formattedData.length} observers`
            });

            toast({
              title: 'Import Successful',
              description: `${formattedData.length} observers have been added`
            });

            // Refresh observer list
            fetchObservers();
            
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
              description: error.message || 'Failed to import observers',
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
    const headers = ['name', 'email', 'phone_number', 'specialization'];
    const sampleData = ['Jane Smith', 'jane.smith@example.com', '1234567890', 'Math Specialist'];
    
    const csv = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'observer_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Observers</h1>
          <p className="text-muted-foreground">
            Manage all observers in the system
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
                <DialogTitle>Import Observers from CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with observer data. The CSV must include columns for name and email. Phone number and specialization are optional.
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
                Add Observer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Observer</DialogTitle>
                  <DialogDescription>
                    Enter the observer's information below. A default password will be generated.
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
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
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
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="specialization" className="text-right">
                      Specialization
                    </Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Add Observer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">
          Loading observers...
        </div>
      ) : observers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No observers found. Add your first observer using the button above.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {observers.map(observer => (
            <Card key={observer.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{observer.name}</CardTitle>
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    {observer.profileImage ? (
                      <img 
                        src={observer.profileImage} 
                        alt={observer.name} 
                        className="w-full h-full rounded-full object-cover" 
                      />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardDescription>
                  {observer.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground">
                  {observer.phone && <p>Phone: {observer.phone}</p>}
                  {observer.specialization && <p>Specialization: {observer.specialization}</p>}
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

export default ObserversPage;
