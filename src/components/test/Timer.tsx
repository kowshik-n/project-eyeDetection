import React, { useEffect } from 'react';
import { useTestStore } from '../../store/testStore';
import { Clock } from 'lucide-react';
import Swal from 'sweetalert2';

const Timer: React.FC = () => {
  const { timeRemaining, setTimeRemaining } = useTestStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1));
    }, 1000);

    if (timeRemaining === 300) { // 5 minutes warning
      Swal.fire({
        icon: 'warning',
        title: '5 Minutes Remaining',
        text: 'Please finish your test and submit your answers.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
      });
    }

    if (timeRemaining === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Time\'s Up!',
        text: 'Your test will be automatically submitted.',
        showConfirmButton: true,
      }).then(() => {
        // Handle test submission
      });
    }

    return () => clearInterval(timer);
  }, [timeRemaining, setTimeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-sm p-4 flex items-center space-x-3">
      <Clock className={`w-5 h-5 ${timeRemaining <= 300 ? 'text-red-500' : 'text-blue-500'}`} />
      <span className={`font-mono text-xl ${timeRemaining <= 300 ? 'text-red-500' : 'text-gray-700'}`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default Timer;