// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stack, Text, PrimaryButton, DefaultButton,
  mergeStyles, Persona, CommandBar,
  PersonaSize,
  type ICommandBarItemProps,
  type IStackTokens,
} from '@fluentui/react';
// ✅ ADD THIS LINE
import { Card, type ICardTokens } from '@fluentui/react-cards';
import authService, { type User } from '../services/authService.ts';

const containerClass = mergeStyles({
  minHeight: '100vh',
  backgroundColor: '#faf9f8',
});

const headerClass = mergeStyles({
  backgroundColor: '#0078d4',
  color: 'white',
  padding: '16px 24px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
});

const mainClass = mergeStyles({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '24px',
});

const cardTokens: ICardTokens = {
  childrenMargin: 12,
  padding: 24,
};

const stackTokens: IStackTokens = {
  childrenGap: 20,
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'books',
      text: 'Books',
      iconProps: { iconName: 'BookAnswers' },
      subMenuProps: {
        items: [
          {
            key: 'browseBooks',
            text: 'Browse Books',
            iconProps: { iconName: 'View' },
          },
          {
            key: 'searchBooks',
            text: 'Search Library',
            iconProps: { iconName: 'Search' },
          },
        ],
      },
    },
    {
      key: 'loans',
      text: 'My Loans',
      iconProps: { iconName: 'Articles' },
      onClick: () => console.log('My Loans clicked'),
    },
  ];

  const commandBarFarItems: ICommandBarItemProps[] = [
    {
      key: 'profile',
      text: user?.full_name || 'User',
      iconProps: { iconName: 'Contact' },
      subMenuProps: {
        items: [
          {
            key: 'settings',
            text: 'Settings',
            iconProps: { iconName: 'Settings' },
          },
          {
            key: 'logout',
            text: 'Logout',
            iconProps: { iconName: 'SignOut' },
            onClick: handleLogout,
          },
        ],
      },
    },
  ];

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center">
            <Text variant="xLarge" styles={{ root: { fontWeight: 600, color: 'white' } }}>
              Folio
            </Text>
            <Text variant="medium" styles={{ root: { color: '#e1f5fe' } }}>
              Library Management System
            </Text>
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <Persona
              text={user?.full_name}
              secondaryText={user?.role}
              size={PersonaSize.size32}
              styles={{ root: { color: 'white' } }}
            />
          </Stack>
        </Stack>
      </div>

      {/* Command Bar */}
      <CommandBar
        items={commandBarItems}
        farItems={commandBarFarItems}
        styles={{ root: { padding: '0 24px' } }}
      />

      {/* Main Content */}
      <div className={mainClass}>
        <Stack tokens={stackTokens}>
          {/* Welcome Section */}
          <Text variant="xxLarge" styles={{ root: { fontWeight: 600 } }}>
            Welcome, {user?.full_name}!
          </Text>

          {/* Cards Grid */}
          <Stack horizontal wrap tokens={{ childrenGap: 20 }}>
            {/* User Info Card */}
            <Stack.Item grow styles={{ root: { minWidth: '300px', maxWidth: '400px' } }}>
              <Card tokens={cardTokens}>
                <Stack tokens={{ childrenGap: 12 }}>
                  <Stack horizontal horizontalAlign="space-between">
                    <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                      Profile
                    </Text>
                  </Stack>
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                      <Text styles={{ root: { fontWeight: 600, minWidth: '80px' } }}>
                        Username:
                      </Text>
                      <Text>{user?.username}</Text>
                    </Stack>
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                      <Text styles={{ root: { fontWeight: 600, minWidth: '80px' } }}>Email:</Text>
                      <Text>{user?.email}</Text>
                    </Stack>
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                      <Text styles={{ root: { fontWeight: 600, minWidth: '80px' } }}>Role:</Text>
                      <Text styles={{ root: { textTransform: 'capitalize' } }}>
                        {user?.role}
                      </Text>
                    </Stack>
                    <Stack horizontal tokens={{ childrenGap: 8 }}>
                      <Text styles={{ root: { fontWeight: 600, minWidth: '80px' } }}>Status:</Text>
                      <Text styles={{ root: { color: user?.is_active ? '#107c10' : '#a80000' } }}>
                        {user?.is_active ? 'Active' : 'Inactive'}
                      </Text>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Stack.Item>

            {/* Quick Actions Card */}
            <Stack.Item grow styles={{ root: { minWidth: '300px', maxWidth: '400px' } }}>
              <Card tokens={cardTokens}>
                <Stack tokens={{ childrenGap: 16 }}>
                  <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                    Quick Actions
                  </Text>
                  <Stack tokens={{ childrenGap: 12 }}>
                    <PrimaryButton
                      text="Browse Books"
                      iconProps={{ iconName: 'BookAnswers' }}
                      onClick={() => console.log('Browse Books')}
                    />
                    <DefaultButton
                      text="My Loans"
                      iconProps={{ iconName: 'Articles' }}
                      onClick={() => console.log('My Loans')}
                    />
                    <DefaultButton
                      text="Search Library"
                      iconProps={{ iconName: 'Search' }}
                      onClick={() => console.log('Search')}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Stack.Item>

            {/* Stats Card */}
            <Stack.Item grow styles={{ root: { minWidth: '300px', maxWidth: '400px' } }}>
              <Card tokens={cardTokens}>
                <Stack tokens={{ childrenGap: 16 }}>
                  <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                    Library Stats
                  </Text>
                  <Stack tokens={{ childrenGap: 8 }}>
                    <Stack horizontal horizontalAlign="space-between">
                      <Text>Active Loans:</Text>
                      <Text styles={{ root: { fontWeight: 600 } }}>0</Text>
                    </Stack>
                    <Stack horizontal horizontalAlign="space-between">
                      <Text>Books Available:</Text>
                      <Text styles={{ root: { fontWeight: 600 } }}>-</Text>
                    </Stack>
                    <Stack horizontal horizontalAlign="space-between">
                      <Text>Due Soon:</Text>
                      <Text styles={{ root: { fontWeight: 600 } }}>0</Text>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            </Stack.Item>
          </Stack>

          {/* Admin/Librarian Section */}
          {(user?.role === 'admin' || user?.role === 'librarian') && (
            <Card tokens={cardTokens} styles={{ root: { backgroundColor: '#fff4ce' } }}>
              <Stack tokens={{ childrenGap: 16 }}>
                <Text variant="xLarge" styles={{ root: { fontWeight: 600 } }}>
                  {user?.role === 'admin' ? 'Admin' : 'Librarian'} Tools
                </Text>
                <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
                  <DefaultButton
                    text="Manage Books"
                    iconProps={{ iconName: 'BookAnswers' }}
                  />
                  <DefaultButton
                    text="Manage Authors"
                    iconProps={{ iconName: 'EditContact' }}
                  />
                  <DefaultButton
                    text="View All Loans"
                    iconProps={{ iconName: 'Articles' }}
                  />
                  {user?.role === 'admin' && (
                    <DefaultButton
                      text="Manage Users"
                      iconProps={{ iconName: 'People' }}
                    />
                  )}
                </Stack>
              </Stack>
            </Card>
          )}
        </Stack>
      </div>
    </div>
  );
};

export default Dashboard;