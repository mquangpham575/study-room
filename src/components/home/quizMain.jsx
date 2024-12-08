import React, { useState, useEffect } from 'react';
import './quizMain.css';

const initialQuestions = [
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
  // Add more initial questions here
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

const Quiz = ({ questions, onStartQuiz, isQuizStarted, onTryAgain }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerOptionClick = (isCorrect, index) => {
    setSelectedAnswer(index);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer(null);
    } else {
      setShowScore(true);
    }
  };

  const handleTimeUp = () => {
    setShowScore(true);
  };

  const handleTryAgain = () => {
    setCurrentQuestion(0);
    setShowScore(false);
    setScore(0);
    setSelectedAnswer(null);
    onTryAgain();
  };

  return (
    <div className='app'>
      {!isQuizStarted ? (
        <button className='start-quiz-button' onClick={onStartQuiz}>Start Quiz</button>
      ) : showScore ? (
        <div className='score-section'>
          You scored {score} out of {questions.length}
          <div>
            <button className='try-again-button' onClick={handleTryAgain}>Try Again</button>
          </div>
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

const AddQuestionForm = ({ onAddQuestion, isQuizStarted }) => {
  const [questionText, setQuestionText] = useState('');
  const [answerOptions, setAnswerOptions] = useState([
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
    { answerText: '', isCorrect: false },
  ]);

  const handleAnswerOptionChange = (index, value) => {
    const newAnswerOptions = [...answerOptions];
    newAnswerOptions[index].answerText = value;
    setAnswerOptions(newAnswerOptions);
  };

  const handleCorrectAnswerChange = (index) => {
    const newAnswerOptions = answerOptions.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setAnswerOptions(newAnswerOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddQuestion({ questionText, answerOptions });
    setQuestionText('');
    setAnswerOptions([
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
    ]);
  };

  if (isQuizStarted) {
    return null;
  }

  return (
    <form className="add-question-form" onSubmit={handleSubmit}>
      <h2>Add a New Question</h2>
      <label>
        Question:
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          required
        />
      </label>
      {answerOptions.map((option, index) => (
        <div key={index} className="answer-option">
          <input
            type="text"
            value={option.answerText}
            onChange={(e) => handleAnswerOptionChange(index, e.target.value)}
            required
          />
          <input
            type="radio"
            name="correctAnswer"
            checked={option.isCorrect}
            onChange={() => handleCorrectAnswerChange(index)}
          />
          <label>Correct</label>
        </div>
      ))}
      <button type="submit" className="add-question-button">Add Question</button>
    </form>
  );
};

export function QuizApp() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const addQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
  };

  const handleTryAgain = () => {
    setIsQuizStarted(false);
  };

  return (
    <div className="App">
      <h1>Quiz App</h1>
      <AddQuestionForm onAddQuestion={addQuestion} isQuizStarted={isQuizStarted} />
      <Quiz
        questions={questions}
        onStartQuiz={handleStartQuiz}
        isQuizStarted={isQuizStarted}
        onTryAgain={handleTryAgain}
      />
    </div>
  );
}
