const SESSION_KEY = 'assy_user';

export const seedMockSession = (users) => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const { password, ...admin } = users.find((u) => u.position === 'admin');
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(admin));
};
