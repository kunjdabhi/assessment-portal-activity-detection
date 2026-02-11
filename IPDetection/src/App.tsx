import { useEffect, useRef, useState } from 'react'
import './App.css'
import { registerIp, sendEventLogs, completeAttempt } from './services/ip.services'
import type { EventDTO } from './types/event.types'
import { useBrowserEventHandlers } from './hooks/useBrowserEvents'
import { useIpMonitoring } from './hooks/useIpMonitoring'
import { useSessionPersistence } from './hooks/useSessionPersistence'
import { useNetworkStatus } from './hooks/useNetworkStatus'
import { useAssessmentTimer } from './hooks/useAssessmentTimer'
import { useEventSubmission } from './hooks/useEventSubmission'
import { Timer } from './components/Timer'
import { Assessment } from './components/Assessment'
import { IpChangeNotification } from './components/IpChangeNotification'
import type { SessionData } from './services/storage.service'
import { getEventQueue, clearEventQueue } from './services/storage.service'
import { AdminDashboard } from './pages/AdminDashboard'

const INITIAL_TIME = 10; 
const IP_CHECK_INTERVAL = 30000; 

function App() {
  
  if (window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const eventBatch = useRef<EventDTO[]>([])


  const { timeRemaining, setTimeRemaining } = useAssessmentTimer(
    INITIAL_TIME, 
    attemptId, 
    isRunning, 
    setIsRunning, 
    eventBatch
  );

  
  useEventSubmission(attemptId, isRunning, eventBatch);

  const registerAttempt = async () => {
    if (!username.trim()) {
        alert("Please enter your name");
        return;
    }

    try {
        setError(null);
        const data = await registerIp(username, "152.59.15.211");
        console.log(data);
        setAttemptId(data.attempt._id);
        eventBatch.current.push({
          name: "IP_CAPTURED_INITIALLY",
          timestamp: Date.now(),
          attemptId: data.attempt._id
        })
        setIsRunning(true);
        
        try {
          await document.documentElement.requestFullscreen();
          console.log("Fullscreen mode activated");
        } catch (error) {
          console.error("Failed to enter fullscreen:", error);
        }
    } catch (err: any) {
        console.error("Registration failed:", err);
        setError(err.response?.data?.error || "Failed to start assessment. Please try again.");
    }
  }

  // Session restore callback
  const handleSessionRestore = (session: SessionData) => {
    console.log('Restoring session:', session);
    setAttemptId(session.attemptId);
    setTimeRemaining(session.timeRemaining);
    setIsRunning(session.isRunning);
  };

  // Session persistence hook
  const { clearSession } = useSessionPersistence({
    attemptId,
    timeRemaining,
    isRunning,
    onRestore: handleSessionRestore
  });

  // Network status
  const { isOnline, wasOffline } = useNetworkStatus();

  useBrowserEventHandlers(INITIAL_TIME, attemptId, setAttemptId, eventBatch);
  useIpMonitoring({ attemptId, isRunning, intervalMs: IP_CHECK_INTERVAL });

  // Sync queued events when coming back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      const syncQueuedEvents = async () => {
        const queue = getEventQueue();
        if (queue.length > 0) {
          console.log(`Syncing ${queue.length} queued events...`);
          try {
            await sendEventLogs(queue);
            clearEventQueue();
            console.log('Queued events synced successfully');
          } catch (error) {
            console.error('Failed to sync queued events:', error);
          }
        }
      };
      syncQueuedEvents();
    }
  }, [wasOffline, isOnline]);

  useEffect(() => {
    if(timeRemaining === 0 && attemptId) {
      console.log("Timer ended");
    }
  }, [timeRemaining, attemptId])

  const handleAssessmentComplete = async () => {
    setIsRunning(false);
    console.log("Assessment completed - stopping all event monitoring");
    
    // Call backend to log ATTEMPT_COMPLETED event
    if (attemptId) {
      try {
        await completeAttempt(attemptId);
        console.log("Attempt completion logged");
      } catch (error) {
        console.error("Failed to log attempt completion:", error);
      }
    }
    
    // Clear session from localStorage
    await clearSession();
  };

  return (
    <>
      <IpChangeNotification />
      {attemptId && <Timer timeRemaining={timeRemaining} />}
      <div className="card">
        {!attemptId && (
            <div className="start-screen">
                <h2>Enter Your Name to Begin</h2>
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="username-input"
                />
                <button 
                    onClick={registerAttempt}
                    disabled={!username.trim()}
                >
                    Start Testing
                </button>
                {error && <div className="error-message">{error}</div>}
            </div>
        )}
        {attemptId && <Assessment 
          onComplete={handleAssessmentComplete} 
          isTimeUp={timeRemaining === 0}
        />}
      </div>
    </>
  )
}

export default App
