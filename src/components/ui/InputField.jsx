/**
 * InputField — accessible numeric input with sanitisation
 *
 * Design: uses type="text" + inputMode="decimal" for full control over display.
 * The browser's native type="number" forces "0" prefix on append, so we manage
 * the raw string state ourselves and expose a clean number to the parent.
 *
 * @param {Object}   props
 * @param {string}   props.label       - Visible label text
 * @param {string}   props.id          - Unique HTML id (also used for aria-describedby)
 * @param {number}   props.value       - Current numeric value (controlled)
 * @param {function(number): void} props.onChange - Called with sanitised number on change
 * @param {string}   [props.unit]      - Unit label shown after the input (e.g. "km/month")
 * @param {number}   [props.max=99999] - Maximum allowed value (JS-enforced)
 * @param {string}   [props.helpText]  - Optional helper text shown below label
 */
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { sanitizeNumber } from '@/utils/calculations';

export default function InputField({
  label, id, value, onChange,
  unit, max = 99999, helpText,
}) {
  const [raw,     setRaw]     = useState('');
  const [focused, setFocused] = useState(false);

  // Sync raw text when parent resets value externally (e.g. resetAll())
  // Only applies when the field is not focused — don't disrupt active typing
  useEffect(() => {
    if (!focused) {
      setRaw(value === 0 ? '' : String(value));
    }
  }, [value, focused]);

  /** Display: while typing show raw; when blurred show number (empty string if 0) */
  const displayValue = focused ? raw : (value === 0 ? '' : String(value));

  const handleChange = (e) => {
    const str = e.target.value;
    setRaw(str);
    onChange(sanitizeNumber(str, max));
  };

  const handleFocus = () => {
    setRaw(value === 0 ? '' : String(value));
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  // Build a descriptive aria-label for screen readers that includes the unit
  const ariaLabel = unit ? `${label} in ${unit}` : label;

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">{label}</label>
      {helpText && (
        <p id={`${id}-help`} className="field__help">{helpText}</p>
      )}
      <div className="field__input-wrap">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          placeholder="0"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={ariaLabel}
          aria-describedby={helpText ? `${id}-help` : undefined}
          aria-valuemin={0}
          aria-valuemax={max}
          autoComplete="off"
          className="glass-input"
        />
        {/* aria-hidden: unit is already spoken via the input's aria-label */}
        {unit && (
          <span className="field__unit" aria-hidden="true">{unit}</span>
        )}
      </div>
    </div>
  );
}

InputField.propTypes = {
  /** Visible label text */
  label:    PropTypes.string.isRequired,
  /** Unique HTML id (used for label htmlFor and aria-describedby) */
  id:       PropTypes.string.isRequired,
  /** Current numeric value (controlled) */
  value:    PropTypes.number.isRequired,
  /** Called with sanitised number on change */
  onChange: PropTypes.func.isRequired,
  /** Unit label shown after the input (e.g. "km/month") */
  unit:     PropTypes.string,
  /** Maximum allowed value (JS-enforced) */
  max:      PropTypes.number,
  /** Optional helper text shown below label */
  helpText: PropTypes.string,
};

InputField.defaultProps = {
  unit:     undefined,
  max:      99999,
  helpText: undefined,
};
