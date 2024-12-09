import React, { useState, useEffect } from 'react';
import './quizMain.css';
import { db } from '../dblibs/firebase-config';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

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

  return <div className="timer">Time left: {timeLeft}s</div>;
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
    <div className='quiz-container'>
      {!isQuizStarted ? (
        <button className='start-quiz-button' onClick={onStartQuiz}>Start Quiz</button>
      ) : showScore ? (
        <div className='score-section'>
          You scored {score} out of {questions.length}
          <div>
            <button className='try-again-button' onClick={handleTryAgain}>Try Again</button>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className='no-questions'>
          Please add question first!
          <div>
            <button className='try-again-button' onClick={handleTryAgain}>Back</button>
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

const AddQuestionForm = ({ onAddQuestion, isQuizStarted, quizId }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuestion = { questionText, answerOptions, quizId };
    onAddQuestion(newQuestion);

    try {
      await addDoc(collection(db, 'questions'), newQuestion);
      console.log('Question added to Firebase');
    } catch (error) {
      console.error('Error adding question to Firebase: ', error);
    }

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
        <input
          type="text"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here"
          required
        />
      </label>
      {answerOptions.map((option, index) => (
        <div key={index} className="answer-option">
          <input
            type="text"
            value={option.answerText}
            onChange={(e) => handleAnswerOptionChange(index, e.target.value)}
            placeholder={`Answer ${index + 1}`}
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

const CreateQuizForm = ({ onCreateQuiz }) => {
  const [quizName, setQuizName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuiz = { quizName };

    try {
      const docRef = await addDoc(collection(db, 'quizzes'), newQuiz);
      console.log('Quiz created with ID: ', docRef.id);
      onCreateQuiz(docRef.id);
    } catch (error) {
      console.error('Error creating quiz: ', error);
    }

    setQuizName('');
  };

  return (
    <form className="create-quiz-form" onSubmit={handleSubmit}>
      <label>
        <input
          type="text"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          placeholder="Enter quiz name"
          required
        />
      </label>
      <button type="submit" className="create-quiz-button">Create Quiz</button>
    </form>
  );
};

const QuizList = ({ quizzes, onSelectQuiz }) => {
  return (
    <div className="quiz-list">
      <h2>Available Quizzes</h2>
      {quizzes.map((quiz) => (
        <button key={quiz.id} onClick={() => onSelectQuiz(quiz.id)} className="quiz-list-item">
          {quiz.quizName}
        </button>
      ))}
    </div>
  );
};

export function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [isQuizSelected, setIsQuizSelected] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      const fetchedQuizzes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(fetchedQuizzes);
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (selectedQuizId) {
        const q = query(collection(db, 'questions'), where('quizId', '==', selectedQuizId));
        const querySnapshot = await getDocs(q);
        const fetchedQuestions = querySnapshot.docs.map(doc => doc.data());
        setQuestions(fetchedQuestions);
      }
    };

    fetchQuestions();
  }, [selectedQuizId]);

  const addQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
  };

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
  };

  const handleTryAgain = () => {
    setIsQuizStarted(false);
  };

  const handleCreateQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setIsQuizSelected(true);
  };

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setIsQuizSelected(true);
    setIsQuizStarted(false);
  };

  const handleBackToQuizzes = () => {
    setIsQuizSelected(false);
    setSelectedQuizId('');
  };

  return (
    <div className="App">
      <h1>Quiz App</h1>
      {!isQuizSelected ? (
        <>
          <CreateQuizForm onCreateQuiz={handleCreateQuiz} />
          <QuizList quizzes={quizzes} onSelectQuiz={handleSelectQuiz} />
        </>
      ) : (
        <>
          <button className="back-button" onClick={handleBackToQuizzes}>Back to Quizzes</button>
          <AddQuestionForm onAddQuestion={addQuestion} isQuizStarted={isQuizStarted} quizId={selectedQuizId} />
          <button className="start-quiz-button" onClick={handleStartQuiz}>Start Quiz</button>
        </>
      )}
      {isQuizStarted && (
        <Quiz
          questions={questions}
          onStartQuiz={handleStartQuiz}
          isQuizStarted={isQuizStarted}
          onTryAgain={handleTryAgain}
        />
      )}
    </div>
  );
}
