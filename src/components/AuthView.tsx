// src/components/AuthView.tsx

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper 
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
      // Don't throw - we still want the auth to succeed even if settings creation fails
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
        // Sign Up
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
          // Create user settings
          await createUserSettings(data.user.id);
          
          setSuccessMessage(
            'Registration successful! Please check your email to verify your account.'
          );
        }
      } else {
        // Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (data.user) {
          // Save session to chrome storage
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
      <Box className="w-full max-w-md p-6 flex justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="w-full max-w-md p-6">
      <Paper elevation={3} className="p-6">
        <Typography variant="h5" className="mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              autoComplete="username"
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
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading || !clientInitialized}
            className="h-12"
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
          </Button>
        </form>

        <Button
          fullWidth
          variant="text"
          onClick={() => {
            setIsSignUp(!isSignUp);
            resetForm();
          }}
          disabled={loading}
          className="mt-4"
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