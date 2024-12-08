import React, { useState, useEffect } from 'react';
import './quizMain.css';

const questions = [
  {
    questionText: 'What is the capital of France?',
    answerOptions: [
      { answerText: 'New York', isCorrect: false },
      { answerText: 'London', isCorrect: false },
      { answerText: 'Paris', isCorrect: true },
      { answerText: 'Dublin', isCorrect: false },
    ],
  },
  {
    questionText: 'Which continent has the highest number of countries?',
    answerOptions: [
      { answerText: 'Asia', isCorrect: false },
      { answerText: 'Europe', isCorrect: false },
      { answerText: 'North America', isCorrect: false },
      { answerText: 'Africa', isCorrect: true },
    ],
  },
  // Add more questions here
];

const Timer = ({ seconds, onTimeUp, isActive }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft === 0) {
      onTimeUp();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, onTimeUp, isActive]);

  return <div>Time left: {timeLeft}s</div>;
};

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const handleAnswerOptionClick = (isCorrect, index) => {
    setSelectedAnswer(index);
    setIsCorrectAnswer(isCorrect);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
      setIsCorrectAnswer(null);
    } else {
      setShowScore(true);
    }
  };

  const handleTimeUp = () => {
    setShowScore(true);
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
  };

  return (
    <div className='app'>
      {!isQuizStarted ? (
        <button className = 'start-quiz-button' onClick={handleStartQuiz}>Start Quiz</button>
      ) : showScore ? (
        <div className='score-section'>
          You scored {score} out of {questions.length}
        </div>
      ) : (
        <>
          <div className='question-section'>
            <div className='question-count'>
              <span>Question {currentQuestion + 1}</span>/{questions.length}
            </div>
            <div className='question-text'>{questions[currentQuestion].questionText}</div>
          </div>
          <div className='answer-section'>
            {questions[currentQuestion].answerOptions.map((answerOption, index) => (
              <button
                key={index}
                onClick={() => handleAnswerOptionClick(answerOption.isCorrect, index)}
                className={
                  selectedAnswer === index
                    ? answerOption.isCorrect
                      ? 'correct'
                      : 'incorrect'
                    : selectedAnswer !== null && answerOption.isCorrect
                    ? 'correct'
                    : ''
                }
                disabled={selectedAnswer !== null}
              >
                {answerOption.answerText}
              </button>
            ))}
          </div>
          <button className='next-button' onClick={handleNextQuestion}>Next</button>
          <Timer seconds={120} onTimeUp={handleTimeUp} isActive={isQuizStarted} />
        </>
      )}
    </div>
  );
};

export function QuizApp() {
  return (
    <div className="App">
      <Quiz />
    </div>
  );
}