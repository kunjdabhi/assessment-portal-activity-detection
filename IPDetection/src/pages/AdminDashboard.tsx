import { useEffect, useState } from 'react';
import { getAllAttempts, getAttemptEvents } from '../services/admin.service';


interface Attempt {
    _id: string;
    username: string;
    ipAddress: string;
    timestamp: string;
    browserName: string;
    hostOs: string;
    ipChangeCount: number;
    eventCount: number;
    suspiciousEventCount: number;
}

interface Event {
    _id: string;
    name: string;
    timestamp: string;
    metadata?: {
        oldIp?: string;
        newIp?: string;
        ipChangeType?: string;
        ipChangeCount?: number;
    };
}

export function AdminDashboard() {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttempts();
    }, []);

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            const data = await getAllAttempts();
            setAttempts(data.attempts);
        } catch (error) {
            console.error('Failed to fetch attempts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (attempt: Attempt) => {
        try {
            setLoading(true);
            const data = await getAttemptEvents(attempt._id);
            setSelectedAttempt(attempt);
            setEvents(data.events);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToList = () => {
        setSelectedAttempt(null);
        setEvents([]);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getEventColor = (eventName: string) => {
        if (eventName.includes('IP_CHANGE') || eventName === 'FULLSCREEN_EXITED') {
            return 'event-red';
        }
        if (eventName === 'TAB_VISIBILITY_CHANGED' || eventName === 'WINDOW_BLUR') {
            return 'event-yellow';
        }
        return 'event-green';
    };

    if (loading && attempts.length === 0) {
        return <div className="admin-loading">Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Assessment Monitoring Dashboard</h1>
                {selectedAttempt && (
                    <button className="back-button" onClick={handleBackToList}>
                        ← Back to Attempts
                    </button>
                )}
            </div>

            {!selectedAttempt ? (
                <div className="attempts-list">
                    <h2>All Attempts ({attempts.length})</h2>
                    <table className="attempts-table">
                        <thead>
                            <tr>
                                <th>Attempt ID</th>
                                <th>Name</th>
                                <th>IP Address</th>
                                <th>Browser</th>
                                <th>OS</th>
                                <th>Timestamp</th>
                                <th>IP Changes</th>
                                <th>Total Events</th>
                                <th>Suspicious</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attempts.map((attempt) => (
                                <tr key={attempt._id}>
                                    <td className="attempt-id">{attempt._id.slice(-8)}</td>
                                    <td><strong>{attempt.username}</strong></td>
                                    <td>{attempt.ipAddress}</td>
                                    <td>{attempt.browserName || 'N/A'}</td>
                                    <td>{attempt.hostOs || 'N/A'}</td>
                                    <td>{formatDate(attempt.timestamp)}</td>
                                    <td>
                                        <span className="badge badge-warning">
                                            {attempt.ipChangeCount}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-info">
                                            {attempt.eventCount}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-danger">
                                            {attempt.suspiciousEventCount}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() => handleViewDetails(attempt)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="event-timeline">
                    <div className="attempt-info">
                        <h2>Attempt Details</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="label">ID:</span>
                                <span className="value">{selectedAttempt._id}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Name:</span>
                                <span className="value">{selectedAttempt.username}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">IP:</span>
                                <span className="value">{selectedAttempt.ipAddress}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">Browser:</span>
                                <span className="value">{selectedAttempt.browserName}</span>
                            </div>
                            <div className="info-item">
                                <span className="label">OS:</span>
                                <span className="value">{selectedAttempt.hostOs}</span>
                            </div>
                        </div>
                    </div>

                    <h3>Event Timeline ({events.length} events)</h3>
                    <div className="timeline">
                        {events.map((event, index) => (
                            <div key={event._id} className={`timeline-item ${getEventColor(event.name)}`}>
                                <div className="timeline-marker">{index + 1}</div>
                                <div className="timeline-content">
                                    <div className="event-header">
                                        <span className="event-name">{event.name}</span>
                                        <span className="event-time">{formatDate(event.timestamp)}</span>
                                    </div>
                                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                                        <div className="event-metadata">
                                            {event.metadata.oldIp && (
                                                <div>Old IP: {event.metadata.oldIp}</div>
                                            )}
                                            {event.metadata.newIp && (
                                                <div>New IP: {event.metadata.newIp}</div>
                                            )}
                                            {event.metadata.ipChangeType && (
                                                <div>Type: {event.metadata.ipChangeType}</div>
                                            )}
                                            {event.metadata.ipChangeCount != null && (
                                                <div>IP Change Count: {event.metadata.ipChangeCount}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
