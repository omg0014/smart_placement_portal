import React, { useState } from 'react';
import styles from './InputField.module.css';

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  options = [],
  placeholder = '',
  disabled = false,
  error = '',
  helpText = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || (value && value.toString().length > 0) || type === 'file';

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
      {type === 'select' ? (
        <div className={styles.inputContainer}>
          <select
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            className={styles.inputElement}
          >
            <option value="" disabled hidden></option>
            {options.map((opt, i) => (
              <option key={i} value={opt.value || opt}>{opt.label || opt}</option>
            ))}
          </select>
          <label className={`${styles.floatingLabel} ${isActive ? styles.active : ''}`}>
            {label} {required && <span className={styles.asterisk}>*</span>}
          </label>
        </div>
      ) : type === 'textarea' ? (
        <div className={styles.inputContainer}>
          <textarea
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            rows="3"
            className={styles.inputElement}
          ></textarea>
          <label className={`${styles.floatingLabel} ${isActive ? styles.active : ''}`}>
            {label} {required && <span className={styles.asterisk}>*</span>}
          </label>
        </div>
      ) : type === 'file' ? (
        <div className={styles.fileContainer}>
          <label className={styles.staticLabel}>
            {label} {required && <span className={styles.asterisk}>*</span>}
          </label>
          <input
            type="file"
            onChange={onChange}
            disabled={disabled}
            accept=".pdf"
            className={styles.fileInput}
          />
        </div>
      ) : (
        <div className={styles.inputContainer}>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ''}
            className={styles.inputElement}
          />
          <label className={`${styles.floatingLabel} ${isActive ? styles.active : ''}`}>
            {label} {required && <span className={styles.asterisk}>*</span>}
          </label>
        </div>
      )}
      
      {error && <span className={styles.errorMessage}>{error}</span>}
      {helpText && !error && <span className={styles.helpText}>{helpText}</span>}
    </div>
  );
};

export default InputField;
