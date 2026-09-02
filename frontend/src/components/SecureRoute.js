import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

const SecureRoute = ({ children, adminOnly = false }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(true);

    const user = (() => {
        try { return JSON.parse(sessionStorage.getItem('assy_user')); }
        catch { return null; }
    })();

    // มี user และถ้า adminOnly ต้องเป็น admin
    if (user && (!adminOnly || user.position === 'admin')) return children;

    return (
        <>
            <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-300 text-sm">Sign in to access this page</p>
            </div>
            {showModal && (
                <LoginModal
                    onSuccess={(u) => {
                        if (adminOnly && u.position !== 'admin') {
                            sessionStorage.removeItem('assy_user');
                            navigate('/assembly/dashboard');
                            return;
                        }
                        setShowModal(false);
                    }}
                    onCancel={() => {
                        setShowModal(false);
                        navigate('/assembly/dashboard');
                    }}
                />
            )}
        </>
    );
};

export default SecureRoute;