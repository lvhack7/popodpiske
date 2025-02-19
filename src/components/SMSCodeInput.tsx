import React, { useRef, useState, useEffect } from 'react';

interface SmsCodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  clearError?: boolean; // Trigger to clear inputs
}

const SmsCodeInput: React.FC<SmsCodeInputProps> = ({
  length = 5,
  onComplete,
  clearError,
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Clear inputs when clearError is triggered
  useEffect(() => {
    if (clearError) {
      setValues(Array(length).fill(''));
      inputsRef.current[0]?.focus(); // Focus the first input
    }
  }, [clearError, length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const inputVal = e.target.value;
    // Only keep digits
    const newValue = inputVal.replace(/\D/g, '');

    // We always update state, even if empty,
    // so that backspace correctly clears the current field
    const newValues = [...values];
    newValues[idx] = newValue;
    setValues(newValues);

    // If a digit was entered, focus the next box
    if (newValue && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }

    // Call onComplete when all boxes are filled
    if (newValues.every((val) => val !== '')) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault(); // Prevent default backspace behavior (like browser navigation)
      const newValues = [...values];

      if (values[idx]) {
        // If the current field has a value, clear it
        newValues[idx] = '';
        setValues(newValues);
      } else if (idx > 0) {
        // If the current field is empty, move back and clear the previous field
        newValues[idx - 1] = '';
        setValues(newValues);
        inputsRef.current[idx - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-6 justify-center">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          maxLength={1}
          value={values[idx]}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition-all"
        />
      ))}
    </div>
  );
};

export default SmsCodeInput;