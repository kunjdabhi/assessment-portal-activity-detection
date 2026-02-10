import { useEffect, useRef, useState } from 'react'
import './App.css'
import { registerIp, sendEventLogs } from './services/ip.services'
import type { EventDTO } from '../types/event.types'
import { useBrowserEventHandlers } from './hooks/useBrowserEvents'
import { Timer } from './components/Timer'

const INITIAL_TIME = 60 * 60; // 60 minutes in seconds

function App() {

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const eventBatch = useRef<EventDTO[]>([])
  const intervalRef = useRef<number | null>(null);

  const registerAttempt = async () => {
    const data = await registerIp("152.59.15.211");
    console.log(data);
    setAttemptId(data.attempt._id);
    eventBatch.current.push({
      name: "IP_CAPTURED_INITIALLY",
      timestamp: Date.now(),
      attemptId: data.attempt._id
    })
    setIsRunning(true);
  }

  useBrowserEventHandlers(INITIAL_TIME, attemptId, setAttemptId, eventBatch);

  useEffect(() => {
    if (isRunning && attemptId) {
      eventBatch.current.push({
        name: "TIMER_TICK",
        timestamp: Date.now(),
        attemptId: attemptId
      })

      intervalRef.current = setInterval(() => {

        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) {

              clearInterval(intervalRef.current);
              intervalRef.current = null;
              eventBatch.current.push({
                name: "TIMER_COMPLETED",
                timestamp: Date.now(),
                attemptId: attemptId
              })
              
            }
            return 0;
          }
          return prev - 1;
        });

      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);


  useEffect(()=>{
    if(!attemptId){
      return;
    }
    const interval = setInterval(()=>{
      if(eventBatch.current.length === 0){
        return;
      }
      sendEventLogs(eventBatch.current);
      eventBatch.current = [];

      if(!isRunning){
        clearInterval(interval);
      }

    }, 10000)

    return () => {
      clearInterval(interval);
    }
  },[attemptId])

  useEffect(() => {
    if(timeRemaining === 0 && attemptId) {
      console.log("Timer ended");
    }
  }, [timeRemaining, attemptId])

  

  return (
    <>
      <Timer timeRemaining={timeRemaining} />
      <div className="card">
        {!attemptId && <button onClick={registerAttempt}>
          Start Testing
        </button>}
        {attemptId && <div>
          <h1>
            Assessment Started
          </h1>
        </div>}
      </div>
    </>
  )
}

export default App
