import { useState } from 'react';
import type { Question } from '../types/assessment.types';


const DEMO_QUESTIONS: Question[] = [
    {
        id: 1,
        question: "What is the capital of France?",
        answer: ""
    },
    {
        id: 2,
        question: "Explain the concept of Object-Oriented Programming in your own words.",
        answer: ""
    },
    {
        id: 3,
        question: "What is the difference between let, const, and var in JavaScript?",
        answer: ""
    },
    {
        id: 4,
        question: "Describe what REST API stands for and its main principles.",
        answer: ""
    },
    {
        id: 5,
        question: "What are the benefits of using TypeScript over JavaScript?",
        answer: ""
    }
];

interface AssessmentProps {
    onComplete?: () => void;
    isTimeUp?: boolean;
    onGoHome?: () => void;
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
}

export function Assessment({ 
    onComplete, 
    isTimeUp, 
    onGoHome, 
    questions, 
    setQuestions, 
    currentIndex, 
    setCurrentIndex 
}: AssessmentProps) {
    if (questions.length === 0) {
        setQuestions(DEMO_QUESTIONS);
        return null; 
    }
    
    const [isCompleted, setIsCompleted] = useState(false);

    if (isTimeUp && !isCompleted) {
        setIsCompleted(true);
        if (onComplete) {
            onComplete();
        }
    }

    const currentQuestion = questions[currentIndex];

     const handleAnswerChange = (value: string) => {
        const updatedQuestions = [...questions];
        updatedQuestions[currentIndex].answer = value;
        setQuestions(updatedQuestions);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsCompleted(true);
            if (onComplete) {
                onComplete();
            }
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (isCompleted) {
        return (
            <div className="assessment-container">
                <div className="completion-card">
                    <h2>Assessment Completed!</h2>
                    <p>You have successfully completed all questions.</p>
                    <button 
                        className="btn btn-primary" 
                        onClick={onGoHome}
                        style={{ marginTop: '1rem' }}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="assessment-container">
            <div className="assessment-header">
                <h1>Online Assessment</h1>
                <p className="progress-text">
                    Question {currentIndex + 1} of {questions.length}
                </p>
            </div>

            <div className="question-card">
                <div className="question-number">Question {currentIndex + 1}</div>
                <h2 className="question-text">{currentQuestion.question}</h2>
                
                <div className="answer-section">
                    <label htmlFor="answer-input" className="answer-label">
                        Your Answer:
                    </label>
                    <textarea
                        id="answer-input"
                        className="answer-input"
                        value={currentQuestion.answer}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={6}
                    />
                </div>

                <div className="navigation-buttons">
                    <button
                        className="btn btn-secondary"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                        ← Previous
                    </button>
                    
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                    >
                        {currentIndex === questions.length - 1 ? 'Submit' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
