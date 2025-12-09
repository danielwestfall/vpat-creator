import { create } from 'zustand';
import type { UserProfile } from '../models/user';
import { DEFAULT_USERS } from '../models/user';

interface UserState {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  setCurrentUser: (userId: string) => void;
  addUser: (user: UserProfile) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: DEFAULT_USERS[0], // Default to Alice
  availableUsers: DEFAULT_USERS,

  setCurrentUser: (userId) =>
    set((state) => ({
      currentUser: state.availableUsers.find((u) => u.id === userId) || state.currentUser,
    })),

  addUser: (user) =>
    set((state) => ({
      availableUsers: [...state.availableUsers, user],
    })),

  updateUser: (id, updates) =>
    set((state) => ({
      availableUsers: state.availableUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      currentUser:
        state.currentUser.id === id ? { ...state.currentUser, ...updates } : state.currentUser,
    })),
}));
