import React, { useState, useRef, useEffect } from 'react';
import { backendApi } from '../../config/instance';
import Swal from 'sweetalert2';

const showAlert = (msg, type) => {
    Swal.fire({
        position: 'center',
        icon: type,
        title: msg,
        showConfirmButton: false,
        timer: 1500,
    });
};

const ScanTag = ({ mode }) => {
    const [tagId, setTagId]           = useState('');
    const [loading, setLoading]       = useState(false);
    const [lastScanned, setLastScanned] = useState(null);
    const tagRef  = useRef(null);
    const timerRef = useRef(null);

    const config = {
        'gr_f1':     { label: 'Gauging Room F1', endpoint: '/gauging-room-f1' },
        'mc_f1': { label: 'MC Gauging F1', endpoint: '/mc-gauging-f1' },
    }[mode];

    useEffect(() => {
        const refocus = () => setTimeout(() => tagRef.current?.focus(), 0);
        refocus();
        document.addEventListener('click', refocus);
        return () => document.removeEventListener('click', refocus);
    }, []);

    const handleTag = async (tag) => {
        if (!tag || loading) return;
        setLoading(true);
        try {
            const res = await backendApi.post(config.endpoint, { tag_id: tag });
            const result = res.data.result;

            if (result === 'OK') {
                setLastScanned(tag);
                showAlert('Updated!', 'success');
            } else if (result === 'TAG_NOT_FOUND') {
                showAlert('Tag not found!', 'error');
            } else {
                showAlert(result, 'error');
            }
        } catch {
            showAlert('Error!', 'error');
        } finally {
            setLoading(false);
            setTagId('');
        }
    };

    const handleChange = (e) => {
        const val = e.target.value.toUpperCase();
        setTagId(val);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const tag = val.trim();
            if (tag) handleTag(tag);
        }, 300);
    };

    return (
        <div className="flex flex-col gap-4 h-full">

            <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-2">Scan RFID tag</p>
                <input
                    ref={tagRef}
                    type="text"
                    value={tagId}
                    onChange={handleChange}
                    onBlur={() => setTimeout(() => tagRef.current?.focus(), 0)}
                    disabled={loading}
                    placeholder="Waiting for tag..."
                    className="w-full h-10 px-3 text-base font-mono border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
                />
            </div>

            {lastScanned && (
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Last scanned</p>
                    <p className="font-mono text-sm text-gray-700">{lastScanned}</p>
                </div>
            )}

        </div>
    );
};

export default ScanTag;