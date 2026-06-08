/**
 * SelectField — accessible dropdown with arrow indicator
 * @param {{ label, id, value, onChange, options }} props
 */
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
