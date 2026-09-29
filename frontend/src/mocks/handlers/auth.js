import { nextId } from '../db';

const withoutPassword = ({ password, ...user }) => user;
const OK = { data: { result: 'OK' } };

export const authRoutes = (db) => [
    {
        method: 'POST',
        path: '/login',
        handler: ({ body }) => {
            const user = db.users.find((u) => u.emp_id === body.emp_id && u.password === body.password);
            if (!user) return { status: 401, data: { error: 'INVALID_CREDENTIALS' } };
            return { data: { result: 'OK', user: withoutPassword(user) } };
        },
    },
    {
        method: 'GET',
        path: '/login/users',
        handler: () => ({ data: db.users.map(withoutPassword) }),
    },
    {
        method: 'POST',
        path: '/login/users',
        handler: ({ body }) => {
            const { emp_id, eng_name, eng_surname, password, position } = body;
            db.users.push({ id: nextId(db.users), emp_id, eng_name, eng_surname, password, position });
            return OK;
        },
    },
    {
        method: 'PUT',
        path: '/login/users/:id',
        handler: ({ params, body }) => {
            const user = db.users.find((u) => u.id === Number(params.id));
            if (user) Object.assign(user, { eng_name: body.eng_name, eng_surname: body.eng_surname, position: body.position });
            return OK;
        },
    },
    {
        method: 'DELETE',
        path: '/login/users/:id',
        handler: ({ params }) => {
            db.users = db.users.filter((u) => u.id !== Number(params.id));
            return OK;
        },
    },
];
