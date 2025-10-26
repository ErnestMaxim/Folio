// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stack,
  TextField,
  PrimaryButton,
  Text,
  MessageBar,
  MessageBarType,
  Checkbox,
  Link as FluentLink,
  Image,
  mergeStyles,
} from '@fluentui/react';
import authService, { type UserLogin } from '../services/authService';

const containerClass = mergeStyles({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f3f2f1',
  padding: '20px',
});

const cardClass = mergeStyles({
  backgroundColor: 'white',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '440px',
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserLogin>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleChange = (field: keyof UserLogin) => (
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    setFormData({
      ...formData,
      [field]: newValue || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err as string);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        <Stack tokens={{ childrenGap: 20 }}>
          {/* Header */}
          <Stack horizontalAlign="center" tokens={{ childrenGap: 10 }}>
            <Text variant="xxLarge" styles={{ root: { fontWeight: 600 } }}>
              Folio
            </Text>
            <Text variant="large" styles={{ root: { color: '#605e5c' } }}>
              Library Management System
            </Text>
          </Stack>

          {/* Error Message */}
          {error && (
            <MessageBar
              messageBarType={MessageBarType.error}
              isMultiline={false}
              onDismiss={() => setError('')}
              dismissButtonAriaLabel="Close"
            >
              {error}
            </MessageBar>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack tokens={{ childrenGap: 16 }}>
              <TextField
                label="Username"
                required
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="Enter your username"
                disabled={loading}
              />

              <TextField
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange('password')}
                placeholder="Enter your password"
                canRevealPassword
                revealPasswordAriaLabel="Show password"
                disabled={loading}
              />

              <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(_, checked) => setRememberMe(!!checked)}
                  disabled={loading}
                />
                <FluentLink href="/forgot-password">Forgot password?</FluentLink>
              </Stack>

              <PrimaryButton
                text={loading ? 'Signing in...' : 'Sign in'}
                type="submit"
                disabled={loading}
                styles={{ root: { marginTop: '8px' } }}
              />
            </Stack>
          </form>

          {/* Register Link */}
          <Stack horizontal horizontalAlign="center" tokens={{ childrenGap: 5 }}>
            <Text>Don't have an account?</Text>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <FluentLink>Register here</FluentLink>
            </Link>
          </Stack>
        </Stack>
      </div>
    </div>
  );
};

export default Login;