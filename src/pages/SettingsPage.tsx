
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  const handleResetApiKeys = () => {
    toast({
      title: "API keys reset",
      description: "Your API integration keys have been reset.",
    });
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings
        </p>
      </div>

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user?.email} type="email" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={user?.role} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter phone number" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {(user?.role === 'admin' || user?.role === 'observer') && (
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Configure external API services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ocr-api">OCR.space API Key</Label>
                <Input id="ocr-api" type="password" placeholder="Enter OCR.space API key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assemblyai-api">AssemblyAI API Key</Label>
                <Input id="assemblyai-api" type="password" placeholder="Enter AssemblyAI API key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gemini-api">Google Gemini API Key</Label>
                <Input id="gemini-api" type="password" placeholder="Enter Google Gemini API key" />
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleResetApiKeys} className="mr-2">Reset Keys</Button>
                <Button onClick={handleSaveSettings}>Save API Keys</Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-6 text-muted-foreground">
              Notification settings will be implemented here
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
