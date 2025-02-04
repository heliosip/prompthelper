// src/components/AuthView.tsx

import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Paper 
} from '@mui/material';
import { supabase } from '@/utils/supabaseClient';

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          // Create user settings
          const { error: settingsError } = await supabase
            .from('user_settings')
            .insert([{
              user_id: signUpData.user.id,
              use_history: true,
              notifications_enabled: true,
              theme: 'light'
            }]);

          if (settingsError) throw settingsError;

          setSuccessMessage('Registration successful! Please check your email to verify your account.');
          
          // Don't call onAuthSuccess yet - wait for email verification
        }
      } else {
        // Sign In
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (signInData.user) {
          // Save session to chrome storage
          await chrome.storage.local.set({ 
            authSession: signInData.session
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
            disabled={loading}
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