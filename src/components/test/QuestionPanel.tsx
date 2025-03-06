import React from 'react';
import { useTestStore } from '../../store/testStore';
import { ChevronLeft, ChevronRight, Flag, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Question {
  id: number;
  text: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"]
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"]
  },
  {
    id: 3,
    text: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"]
  },
  {
    id: 4,
    text: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"]
  },
  {
    id: 5,
    text: "What is the chemical symbol for gold?",
    options: ["Ag", "Fe", "Au", "Cu"]
  }
];

const QuestionPanel: React.FC = () => {
  const { 
    currentQuestion, 
    answers,
    violations,
    isSubmitted,
    setCurrentQuestion, 
    setAnswer,
    submitTest
  } = useTestStore();

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswer(currentQuestion, optionIndex);
  };

  const handleSubmit = async () => {
    const answeredQuestions = answers.filter(answer => answer !== null).length;
    const unansweredQuestions = answers.length - answeredQuestions;
    const totalViolations = Object.values(violations).reduce((a, b) => a + b, 0);

    if (unansweredQuestions > 0) {
      const result = await Swal.fire({
        title: 'Unanswered Questions',
        html: `You have ${unansweredQuestions} unanswered questions.<br>Are you sure you want to submit?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, submit',
        cancelButtonText: 'No, review answers',
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    const summaryHtml = `
      <div class="text-left">
        <p>Questions Answered: ${answeredQuestions} of ${answers.length}</p>
        <p>Total Violations: ${totalViolations}</p>
        <ul class="mt-2 text-sm">
          ${violations.tabSwitches > 0 ? `<li>Tab Switches: ${violations.tabSwitches}</li>` : ''}
          ${violations.faceNotVisible > 0 ? `<li>Face Not Visible: ${violations.faceNotVisible}</li>` : ''}
          ${violations.multipleFaces > 0 ? `<li>Multiple Faces: ${violations.multipleFaces}</li>` : ''}
          ${violations.mobileDetected > 0 ? `<li>Mobile Detected: ${violations.mobileDetected}</li>` : ''}
          ${violations.prohibitedObjects > 0 ? `<li>Prohibited Objects: ${violations.prohibitedObjects}</li>` : ''}
        </ul>
      </div>
    `;

    await Swal.fire({
      title: 'Test Summary',
      html: summaryHtml,
      icon: 'info',
      confirmButtonText: 'Submit Test',
    });

    submitTest();

    await Swal.fire({
      title: 'Test Submitted',
      text: 'Your test has been submitted successfully.',
      icon: 'success',
      confirmButtonText: 'OK',
    });
  };

  const question = questions[currentQuestion];

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Test Completed</h2>
          <p className="text-gray-600">Thank you for completing the test. You may now close this window.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Question {currentQuestion + 1} of {questions.length}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {answers.filter(a => a !== null).length} of {questions.length} answered
          </span>
          {Object.values(violations).reduce((a, b) => a + b, 0) > 0 && (
            <div className="flex items-center gap-1 text-red-600 text-sm">
              <AlertTriangle size={16} />
              <span>{Object.values(violations).reduce((a, b) => a + b, 0)} violations</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <p className="text-lg text-gray-800 mb-4">{question.text}</p>
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <label
              key={idx}
              className={`flex items-center p-4 rounded-lg border transition-colors cursor-pointer
                ${answers[currentQuestion] === idx 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <input
                type="radio"
                name="answer"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                checked={answers[currentQuestion] === idx}
                onChange={() => handleAnswer(idx)}
              />
              <span className="ml-3 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`flex items-center px-4 py-2 rounded-lg
            ${currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Previous</span>
        </button>

        <button
          onClick={handleSubmit}
          className="flex items-center px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Submit Test
        </button>

        <button
          onClick={handleNext}
          disabled={currentQuestion === questions.length - 1}
          className={`flex items-center px-4 py-2 rounded-lg
            ${currentQuestion === questions.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          <span className="mr-1">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default QuestionPanel;