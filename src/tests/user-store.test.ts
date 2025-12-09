import { describe, test, expect, beforeEach } from 'vitest';
import { useUserStore } from '../store/user-store';
import { DEFAULT_USERS } from '../models/user';

describe('User Profile Store', () => {
  beforeEach(() => {
    // Reset to default state
    useUserStore.setState({
      currentUser: DEFAULT_USERS[0],
      availableUsers: DEFAULT_USERS,
    });
  });

  test('should have Alice Auditor as default current user', () => {
    const { currentUser } = useUserStore.getState();
    expect(currentUser.id).toBe('user-1');
    expect(currentUser.name).toBe('Alice Auditor');
    expect(currentUser.role).toBe('auditor');
  });

  test('should switch to Bob (Developer)', () => {
    const { setCurrentUser } = useUserStore.getState();
    setCurrentUser('user-2');

    const { currentUser } = useUserStore.getState();
    expect(currentUser.id).toBe('user-2');
    expect(currentUser.name).toBe('Bob Developer');
    expect(currentUser.role).toBe('developer');
  });

  test('should switch to Charlie (Manager)', () => {
    const { setCurrentUser } = useUserStore.getState();
    setCurrentUser('user-3');

    const { currentUser } = useUserStore.getState();
    expect(currentUser.id).toBe('user-3');
    expect(currentUser.name).toBe('Charlie Manager');
    expect(currentUser.role).toBe('manager');
  });

  test('should maintain user when invalid ID provided', () => {
    const { setCurrentUser, currentUser: initialUser } = useUserStore.getState();
    setCurrentUser('invalid-id');

    const { currentUser } = useUserStore.getState();
    expect(currentUser).toEqual(initialUser); // Should remain unchanged
  });

  test('should have all three default users available', () => {
    const { availableUsers } = useUserStore.getState();
    expect(availableUsers).toHaveLength(3);
    expect(availableUsers.map((u) => u.role)).toEqual(['auditor', 'developer', 'manager']);
  });
});
