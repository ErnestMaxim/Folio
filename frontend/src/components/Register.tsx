// src/components/Register.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stack,
  TextField,
  PrimaryButton,
  Text,
  MessageBar,
  MessageBarType,
  Link as FluentLink,
  mergeStyles,
} from '@fluentui/react';
import authService, { type UserRegistration } from '../services/authService.ts';

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

interface FormData extends UserRegistration {
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (field: keyof FormData) => (
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      
      await authService.register(userData);
      
      // Automatically log in after successful registration
      await authService.login({
        username: formData.username,
        password: formData.password,
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err as string);
      console.error('Registration error:', err);
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
              Create Account
            </Text>
            <Text variant="large" styles={{ root: { color: '#605e5c' } }}>
              Join Folio Library Management System
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <Stack tokens={{ childrenGap: 16 }}>
              <TextField
                label="Full Name"
                required
                value={formData.full_name}
                onChange={handleChange('full_name')}
                placeholder="John Doe"
                disabled={loading}
              />

              <TextField
                label="Username"
                required
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="johndoe"
                description="Minimum 3 characters"
                disabled={loading}
              />

              <TextField
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="john@example.com"
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
                description="Minimum 6 characters"
                disabled={loading}
              />

              <TextField
                label="Confirm Password"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                placeholder="Re-enter your password"
                canRevealPassword
                revealPasswordAriaLabel="Show password"
                disabled={loading}
              />

              <PrimaryButton
                text={loading ? 'Creating account...' : 'Create account'}
                type="submit"
                disabled={loading}
                styles={{ root: { marginTop: '8px' } }}
              />
            </Stack>
          </form>

          {/* Login Link */}
          <Stack horizontal horizontalAlign="center" tokens={{ childrenGap: 5 }}>
            <Text>Already have an account?</Text>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <FluentLink>Sign in here</FluentLink>
            </Link>
          </Stack>
        </Stack>
      </div>
    </div>
  );
};

export default Register;