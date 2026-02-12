import { useEffect, useRef, useState, useCallback } from 'react'
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

function App() {
  
  if (window.location.pathname === '/admin') {
    return <AdminDashboard />;
  }

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testIp, setTestIp] = useState<string>("");
  const [testIpInput, setTestIpInput] = useState<string>("");
  const [devMode, setDevMode] = useState<boolean>(false);
  
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
  useIpMonitoring({ attemptId, isRunning, intervalMs: IP_CHECK_INTERVAL, testIp: testIp || undefined });

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
      {attemptId && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
        }}>
          <button
            onClick={() => setDevMode(!devMode)}
            style={{
              background: devMode ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {devMode ? 'Close Dev' : 'Dev Mode'}
          </button>
          {devMode && (
            <div style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '8px',
              minWidth: '220px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              fontSize: '13px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}> Test IP Override</div>
              <input
                type="text"
                placeholder="e.g. 8.8.8.8"
                value={testIpInput}
                onChange={(e) => setTestIpInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #475569',
                  background: '#0f172a',
                  color: '#e2e8f0',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                {testIp ? `Active test IP: ${testIp}` : 'No override active (using real IP)'}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                <button
                  onClick={() => { setTestIp(testIpInput); }}
                  disabled={!testIpInput.trim()}
                  style={{
                    background: testIpInput.trim() ? '#22c55e' : '#334155',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: testIpInput.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Apply IP
                </button>
                <button
                  onClick={() => { setTestIp(''); setTestIpInput(''); }}
                  style={{
                    background: '#475569',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Reset to Real IP
                </button>
              </div>
            </div>
          )}
        </div>
      )}
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

export default App
