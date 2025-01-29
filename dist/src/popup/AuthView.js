import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/popup/AuthView.tsx
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
const AuthView = ({ onAuthSuccess }) => {
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
    return (_jsxs("div", { style: { padding: '8px' }, children: [_jsx("h3", { children: "Sign In / Sign Up" }), errorMsg && _jsx("p", { style: { color: 'red' }, children: errorMsg }), _jsx("input", { type: "email", placeholder: "Email", value: email, onChange: e => setEmail(e.target.value), style: { width: '100%', marginBottom: '8px' } }), _jsx("input", { type: "password", placeholder: "Password", value: password, onChange: e => setPassword(e.target.value), style: { width: '100%', marginBottom: '8px' } }), _jsx("input", { type: "text", placeholder: "Username (optional)", value: username, onChange: e => setUsername(e.target.value), style: { width: '100%', marginBottom: '8px' } }), _jsxs("div", { children: [_jsx("button", { onClick: handleSignIn, style: { marginRight: '8px' }, children: "Sign In" }), _jsx("button", { onClick: handleSignUp, children: "Sign Up" })] })] }));
};
export default AuthView;
