/**
 * SelectField — accessible dropdown with arrow indicator
 * @param {{ label, id, value, onChange, options }} props
 */
import PropTypes from 'prop-types';

export default function SelectField({ label, id, value, onChange, options }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="glass-input glass-select"
        aria-label={label}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

SelectField.propTypes = {
  /** Visible label text */
  label:    PropTypes.string.isRequired,
  /** Unique HTML id */
  id:       PropTypes.string.isRequired,
  /** Currently selected value */
  value:    PropTypes.string.isRequired,
  /** Called with new value string on change */
  onChange: PropTypes.func.isRequired,
  /** Array of { value, label } option objects */
  options:  PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};
