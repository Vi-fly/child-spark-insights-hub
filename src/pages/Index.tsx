
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        navigate('/');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, navigate]);

  return null;
};

export default Index;
