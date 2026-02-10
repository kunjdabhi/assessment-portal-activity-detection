import './Timer.css';

interface TimerProps {
    timeRemaining: number;
}

export function Timer({ timeRemaining }: TimerProps) {
    // Format time as MM:SS
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div className="timer-container">
            <div className="timer-display">
                <span className="timer-label">Time Remaining:</span>
                <span className="timer-value">{formattedTime}</span>
            </div>
        </div>
    );
}
