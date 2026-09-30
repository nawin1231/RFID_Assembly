import type { UserRow } from './types';

const SESSION_KEY = 'assy_user';

export const seedMockSession = (users: UserRow[]): void => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const admin = users.find((u) => u.position === 'admin');
    if (!admin) throw new Error('mock fixtures have no admin user');
    const { password: _password, ...user } = admin;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
};
