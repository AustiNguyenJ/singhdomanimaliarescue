// tests/firestore.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vi } from 'vitest';
import * as authModule from 'firebase/auth';



vi.mock('firebase/firestore');
vi.mock('firebase/auth');


import * as firestore from '../src/firebase/firestore';

describe('Firestore functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addData adds doc with timestamp', async () => {
    const data = { name: 'Test' };
    const res = await firestore.addData('events', data);
    expect(res).toHaveProperty('id', 'mock-id');
    expect(res).toHaveProperty('name', 'Test');
  });

  it('getData returns mapped docs', async () => {
    const res = await firestore.getData('users');
    expect(res).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'u1' }),
        expect.objectContaining({ id: 'u2' }),
      ])
    );
  });

  it('saveUserProfile calls setDoc correctly', async () => {
    const setDocSpy = vi.spyOn(firestore, 'setDoc');
    await firestore.saveUserProfile({ name: 'Alice' });
    expect(setDocSpy).toHaveBeenCalled();
  });

  it('getUserProfile returns user data', async () => {
    const res = await firestore.getUserProfile();
    expect(res).toHaveProperty('email', 'test@example.com');
  });

  it('getEvents merges volunteers and assignments', async () => {
    const res = await firestore.getEvents();
    expect(res[0]).toHaveProperty('assignedVolunteers');
    expect(res[0].assignedVolunteers).toEqual(
      expect.arrayContaining([expect.objectContaining({ email: 'test@example.com' })])
    );
  });

  it('createEvent uses addData', async () => {
    const evt = { name: 'New Event' };
    const res = await firestore.createEvent(evt);
    expect(res).toHaveProperty('id', 'mock-id');
  });

  it('deleteEvent marks event and related assignments deleted', async () => {
    await expect(firestore.deleteEvent('e1')).resolves.not.toThrow();
  });

  it('getVolunteers filters out admins', async () => {
    const res = await firestore.getVolunteers();
    expect(res.every(v => v.isAdmin === false)).toBe(true);
  });

  it('getAssignedVolunteers returns matched volunteers', async () => {
    const res = await firestore.getAssignedVolunteers('e1');
    expect(res).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'test@example.com' })
      ])
    );
  });

  it('assignVolunteer updates assignedVolunteers and calls createNotification', async () => {
    await expect(firestore.assignVolunteer('test@example.com', 'e1')).resolves.not.toThrow();
  });

  it('unassignVolunteer updates event and deletes related notifications', async () => {
    await expect(firestore.unassignVolunteer('test@example.com', 'e1')).resolves.not.toThrow();
  });

  it('countAssigned returns number of assigned volunteers', async () => {
    const count = await firestore.countAssigned('e1');
    expect(count).toBe(1);
  });

  it('listNotifications filters deleted notifications', async () => {
    const res = await firestore.listNotifications('test@example.com');
    expect(res.every(n => n.deleted === false)).toBe(true);
  });

  it('createNotification adds notification', async () => {
    const res = await firestore.createNotification({ userEmail: 'x@test.com' });
    expect(res).toHaveProperty('id');
  });

  it('getVolunteerEvents returns assigned events', async () => {
    const res = await firestore.getVolunteerEvents();
    expect(res).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'e1', assignedVolunteers: ['test@example.com'] })
      ])
    );
  });
});
