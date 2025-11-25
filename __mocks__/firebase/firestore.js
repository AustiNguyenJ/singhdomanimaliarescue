import { vi } from 'vitest';


export const getFirestore = vi.fn(() => ({ mockDb: true }));

export const collection = vi.fn((db, name) => ({ _collectionName: name }));

export const doc = vi.fn((db, col, id) => ({
  _collectionName: col,
  id,
  path: `${col}/${id}`,
}));

export const addDoc = vi.fn(async (colRef, data) => ({
  id: 'mock-id',
  ...data,
}));

export const setDoc = vi.fn(async () => {});

export const updateDoc = vi.fn(async () => {});

export const serverTimestamp = vi.fn(() => 'mock-timestamp');

export const query = vi.fn((colRef, ...args) => colRef);

export const where = vi.fn(() => ({}));
export const orderBy = vi.fn(() => ({}));

export const getDocs = vi.fn(async (ref) => {
  if (!ref || !ref._collectionName) return { docs: [] };

  switch (ref._collectionName) {
    case 'users':
      return {
        docs: [
          { id: 'u1', data: () => ({ email: 'test@example.com', isAdmin: false }) },
          { id: 'u2', data: () => ({ email: 'admin@example.com', isAdmin: true }) },
        ],
      };
    case 'volunteers':
      return {
        docs: [
          { id: 'u1', data: () => ({ email: 'test@example.com', id: 'u1', isAdmin: false }) },
        ],
      };

    case 'events':
      return {
        docs: [
          {
            id: 'e1',
            data: () => ({
              assignedVolunteers: ['test@example.com'], 
              name: 'Event 1',
            }),
          },
        ],
      };

    case 'notifications':
      return {
        docs: [
          { id: 'n1', data: () => ({ userEmail: 'test@example.com', deleted: false }) },
        ],
      };

    case 'assignments':
      return {
        docs: [
          { id: 'a1', data: () => ({ eventId: 'e1', volunteerId: 'u1' }) },
        ],
      };

    default:
      return { docs: [] };
  }
});

export const getDoc = vi.fn(async (ref) => {
  if (!ref) return { exists: () => false, data: () => null };

  if (ref._collectionName === 'users') {
    if (ref.id === 'test@example.com') {
      return { exists: () => true, data: () => ({ email: 'test@example.com', name: 'Test User', isAdmin: false }) };
    }
    if (ref.id === 'admin@example.com') {
      return { exists: () => true, data: () => ({ email: 'admin@example.com', name: 'Admin', isAdmin: true }) };
    }
    return { exists: () => false, data: () => null };
  }

  if (ref._collectionName === 'events') {
    return {
      exists: () => true,
      data: () => ({ name: 'Event 1', assignedVolunteers: ['test@example.com'] }),
    };
  }

  if (ref._collectionName === 'notifications') {
    return { exists: () => true, data: () => ({ userEmail: 'test@example.com', deleted: false }) };
  }

  if (ref._collectionName === 'assignments') {
    return { exists: () => true, data: () => ({ eventId: 'e1', volunteerId: 'u1' }) };
  }

  return { exists: () => false, data: () => null };
});
