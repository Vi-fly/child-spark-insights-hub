

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ReportsPage from "./pages/ReportsPage";
import MediaPage from "./pages/MediaPage";
import StudentsPage from "./pages/StudentsPage";
import ObserversPage from "./pages/ObserversPage";
import ParentsPage from "./pages/ParentsPage";
import GrowthTrackerPage from "./pages/GrowthTrackerPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import MyChildrenPage from "./pages/MyChildrenPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/observers" element={<ObserversPage />} />
            <Route path="/parents" element={<ParentsPage />} />
            <Route path="/growth-tracker" element={<GrowthTrackerPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/my-children" element={<MyChildrenPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

