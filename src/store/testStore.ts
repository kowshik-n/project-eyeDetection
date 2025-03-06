import { create } from 'zustand';

interface TestState {
  currentQuestion: number;
  answers: (number | null)[];
  timeRemaining: number;
  isSubmitted: boolean;
  violations: {
    tabSwitches: number;
    faceNotVisible: number;
    multipleFaces: number;
    mobileDetected: number;
    prohibitedObjects: number;
  };
  setCurrentQuestion: (questionNumber: number) => void;
  setAnswer: (questionIndex: number, answer: number | null) => void;
  setTimeRemaining: (time: number) => void;
  incrementViolation: (type: keyof TestState['violations']) => void;
  submitTest: () => void;
}

export const useTestStore = create<TestState>((set) => ({
  currentQuestion: 0,
  answers: Array(5).fill(null),
  timeRemaining: 3600, // 60 minutes in seconds
  isSubmitted: false,
  violations: {
    tabSwitches: 0,
    faceNotVisible: 0,
    multipleFaces: 0,
    mobileDetected: 0,
    prohibitedObjects: 0,
  },
  setCurrentQuestion: (questionNumber) => 
    set({ currentQuestion: questionNumber }),
  setAnswer: (questionIndex, answer) =>
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[questionIndex] = answer;
      return { answers: newAnswers };
    }),
  setTimeRemaining: (time) => 
    set({ timeRemaining: time }),
  incrementViolation: (type) =>
    set((state) => ({
      violations: {
        ...state.violations,
        [type]: state.violations[type] + 1,
      },
    })),
  submitTest: () =>
    set((state) => {
      const answeredQuestions = state.answers.filter(answer => answer !== null).length;
      const totalQuestions = state.answers.length;
      const totalViolations = Object.values(state.violations).reduce((a, b) => a + b, 0);
      
      return { isSubmitted: true };
    }),
}));