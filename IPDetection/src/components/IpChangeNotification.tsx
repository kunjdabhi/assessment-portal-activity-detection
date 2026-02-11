import { useEffect, useState } from 'react';


interface IpChangeDetail {
    oldIp: string;
    newIp: string;
    ipChangeType: 'BENIGN' | 'SUSPICIOUS';
}

export function IpChangeNotification() {
    const [show, setShow] = useState(false);
    const [details, setDetails] = useState<IpChangeDetail | null>(null);

    useEffect(() => {
        const handleIpChange = (event: Event) => {
            const customEvent = event as CustomEvent<IpChangeDetail>;
            setDetails(customEvent.detail);
            setShow(true);

            setTimeout(() => {
                setShow(false);
            }, 5000);
        };

        window.addEventListener('ip-change-detected', handleIpChange);

        return () => {
            window.removeEventListener('ip-change-detected', handleIpChange);
        };
    }, []);

    if (!show || !details) {
        return null;
    }

    return (
        <div className="ip-notification">
            <div className="ip-notification-header">
                ⚠️ IP Address Changed
            </div>
            <div className="ip-notification-body">
                <p>Your IP address has changed during the assessment. This activity has been logged.</p>
            </div>
            <button 
                className="ip-notification-close"
                onClick={() => setShow(false)}
            >
                ✕
            </button>
        </div>
    );
}
