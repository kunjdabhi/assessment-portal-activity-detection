import { useEffect, useRef, useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
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

const INITIAL_TIME = 10 * 60; 
const IP_CHECK_INTERVAL = 30000;

function AssessmentPage() {

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  
  const [questions, setQuestions] = useState<any[]>([]); 
  const [currentIndex, setCurrentIndex] = useState<number>(0);

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
        const data = await registerIp(username);
        setAttemptId(data.attempt._id);
        eventBatch.current.push({
          name: "IP_CAPTURED_INITIALLY",
          timestamp: Date.now(),
          attemptId: data.attempt._id
        })
        setIsRunning(true);
        setCurrentIndex(0); 
        
        try {
          await document.documentElement.requestFullscreen();
        } catch (error) {
          console.error("Failed to enter fullscreen:", error);
        }
    } catch (err: any) {
        const errorMessage = err.response?.data?.error || "Failed to start assessment. Please try again.";
        setError(errorMessage);
        alert(errorMessage);
    }
  }

  const handleSessionRestore = useCallback((session: SessionData) => {
    setAttemptId(session.attemptId);
    setTimeRemaining(session.timeRemaining);
    setIsRunning(session.isRunning);
    if (session.questions) setQuestions(session.questions);
    if (session.currentIndex !== undefined) setCurrentIndex(session.currentIndex);
  }, [setTimeRemaining]);

  const { clearSession } = useSessionPersistence({
    attemptId,
    timeRemaining,
    isRunning,
    questions,
    currentIndex,
    onRestore: handleSessionRestore
  });

  const { isOnline, wasOffline } = useNetworkStatus();

  useBrowserEventHandlers(INITIAL_TIME, attemptId, setAttemptId, eventBatch);
  useIpMonitoring({ attemptId, isRunning, intervalMs: IP_CHECK_INTERVAL });

  useEffect(() => {
    if (wasOffline && isOnline) {
      const syncQueuedEvents = async () => {
        const queue = getEventQueue();
        if (queue.length > 0) {
          try {
            await sendEventLogs(queue);
            clearEventQueue();
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
    }
  }, [timeRemaining, attemptId])

  const handleAssessmentComplete = async () => {
    setIsRunning(false);
    
    if (attemptId) {
      try {
        if (eventBatch.current.length > 0) {
          const pendingEvents = [...eventBatch.current];
          eventBatch.current = [];
          await sendEventLogs(pendingEvents);
        }

        const queuedEvents = getEventQueue();
        if (queuedEvents.length > 0) {
          await sendEventLogs(queuedEvents);
          clearEventQueue();
        }

        await completeAttempt(attemptId);
      } catch (error) {
        alert("Failed to confirm assessment completion. Please check your connection.");
      }
    }
    
    await clearSession();
  };

  const handleGoHome = () => {
    setAttemptId(null);
    setUsername("");
    setError(null);
    setIsRunning(false);
    setTimeRemaining(INITIAL_TIME);
    setQuestions([]);
    setCurrentIndex(0);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
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
          onGoHome={handleGoHome}
          questions={questions}
          setQuestions={setQuestions}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />}
      </div>
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<AssessmentPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App
