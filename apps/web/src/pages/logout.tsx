import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';

export default function Logout() {
  const navigate = useNavigate();
  const { setLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    setLoggedIn(false);
    queryClient.clear();
    navigate('/');
  }, []);

  return null;
}
