// src/components/AuthView.tsx

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper,
  Stack
} from '@mui/material';
import { getSupabase } from '@/utils/supabaseClient';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [clientInitialized, setClientInitialized] = useState(false);

  useEffect(() => {
    const initClient = async () => {
      try {
        await getSupabase();
        setClientInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        setError('Failed to initialize authentication. Please try again.');
      }
    };
    initClient();
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (isSignUp && !username) {
      setError('Username is required for signup');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const createUserSettings = async (userId: string) => {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          theme: 'light',
          save_history: true,
          notifications_enabled: true,
          default_ai_tool: 'claude'
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating user settings:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !clientInitialized) return;

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const supabase = await getSupabase();

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `chrome-extension://${chrome.runtime.id}/auth/callback`,
            data: {
              username
            },
          }
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          await createUserSettings(data.user.id);
          setSuccessMessage(
            'Registration successful! Please check your email to verify your account.'
          );
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (data.user) {
          await chrome.storage.local.set({ 
            authSession: data.session,
            userId: data.user.id
          });
          
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
    setSuccessMessage(null);
  };

  if (!clientInitialized) {
    return (
      <Box sx={{ width: '100%', maxWidth: 'md', p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 'md',
      p: 3
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            textAlign: 'center',
            fontWeight: 500
          }}
        >
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleAuth}>
          <Stack spacing={2}>
            {isSignUp && (
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                autoComplete="username"
                size="small"
              />
            )}

            <TextField
              fullWidth
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
              size="small"
            />

            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              size="small"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !clientInitialized}
              sx={{ height: 40 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </Button>
          </Stack>
        </form>

        <Button
          fullWidth
          variant="text"
          onClick={() => {
            setIsSignUp(!isSignUp);
            resetForm();
          }}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {isSignUp 
            ? 'Already have an account? Sign In' 
            : "Don't have an account? Sign Up"
          }
        </Button>
      </Paper>
    </Box>
  );
};

export default AuthView;