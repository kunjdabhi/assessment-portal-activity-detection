import type { IpChangeDetail } from '../hooks/useIpMonitoring';

interface NotificationBannerProps {
    title: string;
    message: string;
    variant?: 'warning' | 'error';
    onDismiss: () => void;
}

function NotificationBanner({ title, message, variant = 'warning', onDismiss }: NotificationBannerProps) {
    const className = variant === 'error' 
        ? 'ip-notification ip-notification-error' 
        : 'ip-notification';

    return (
        <div className={className}>
            <div className="ip-notification-header">{title}</div>
            <div className="ip-notification-body">
                <p>{message}</p>
            </div>
            <button className="ip-notification-close" onClick={onDismiss}>
                ✕
            </button>
        </div>
    );
}

interface IpChangeNotificationProps {
    ipChange: IpChangeDetail | null;
    errorMsg: string | null;
    onDismissIpChange: () => void;
    onDismissError: () => void;
}

export function IpChangeNotification({ ipChange, errorMsg, onDismissIpChange, onDismissError }: IpChangeNotificationProps) {
    return (
        <>
            {ipChange && (
                <NotificationBanner
                    title="IP Address Changed"
                    message="Your IP address has changed during the assessment. This activity has been logged."
                    onDismiss={onDismissIpChange}
                />
            )}
            {errorMsg && (
                <NotificationBanner
                    title="Connection Issue"
                    message={errorMsg}
                    variant="error"
                    onDismiss={onDismissError}
                />
            )}
        </>
    );
}
