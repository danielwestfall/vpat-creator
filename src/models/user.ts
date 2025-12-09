export type UserRole = 'auditor' | 'developer' | 'manager';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Alice Auditor',
    role: 'auditor',
    email: 'alice@example.com',
  },
  {
    id: 'user-2',
    name: 'Bob Developer',
    role: 'developer',
    email: 'bob@example.com',
  },
  {
    id: 'user-3',
    name: 'Charlie Manager',
    role: 'manager',
    email: 'charlie@example.com',
  },
];
