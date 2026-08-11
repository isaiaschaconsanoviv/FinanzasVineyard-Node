import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (e: { target: { name: string; value: string } }) => void;
  required?: boolean;
}

export function Select({ id, name, value, options, onChange, required }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className="custom-select-container" ref={containerRef}>
      <button
        type="button"
        id={id}
        className={`input-field custom-select-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : "Selecciona una opción"}</span>
        <svg 
          className={`custom-select-arrow ${isOpen ? 'is-open' : ''}`} 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Hidden native input for required validation */}
      {required && (
        <input 
          type="text"
          tabIndex={-1}
          style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
          value={value}
          required={required}
          onChange={() => {}}
        />
      )}

      {isOpen && (
        <div className="custom-select-dropdown animate-scale-in glass-panel">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {value === option.value && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
