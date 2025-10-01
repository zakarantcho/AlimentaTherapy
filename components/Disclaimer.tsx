import React from 'react';
import { MEDICAL_DISCLAIMER } from '../constants';

interface DisclaimerProps {
  className?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ className = '' }) => {
  return (
    <div className={`text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-md ${className}`}>
      <span className="font-bold">AVERTISSEMENT :</span> {MEDICAL_DISCLAIMER}
    </div>
  );
};

export default Disclaimer;