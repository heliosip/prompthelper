// src/popup/AuthView.tsx
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // optional: for storing in "profile"
  const [errorMsg, setErrorMsg] = useState('');

  // SIGN UP
  const handleSignUp = async () => {
    setErrorMsg('');

    // 1) Create user via Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setErrorMsg(signUpError.message);
      return;
    }

    // 2) Insert into 'profile' table if sign-up succeeded
    //    (the user's ID is signUpData.user?.id)
    const userId = signUpData.user?.id;
    if (!userId) {
      // handle missing userId error
      return;
    }
    const { error: profileError } = await supabase.from('profile').insert([
      {
        id: userId,
        username, // store the username
      }
    ]);
    if (profileError) {
      setErrorMsg(profileError.message);
      return;
    }

    onAuthSuccess();
  };

  // SIGN IN
  const handleSignIn = async () => {
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    onAuthSuccess();
  };

  return (
    <div style={{ padding: '8px' }}>
      <h3>Sign In / Sign Up</h3>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <input
        type="text"
        placeholder="Username (optional)"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />

      <div>
        <button onClick={handleSignIn} style={{ marginRight: '8px' }}>
          Sign In
        </button>
        <button onClick={handleSignUp}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default AuthView;
