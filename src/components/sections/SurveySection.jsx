/**
 * SurveySection — four-category carbon footprint survey form
 *
 * @param {Object}                    props
 * @param {{kmCar,kmBus,kmTrain,flightHours}} props.transport    - Transport state
 * @param {function(Object): void}    props.setTransport         - Transport state setter
 * @param {{dietType: string}}        props.diet                 - Diet state
 * @param {function(Object): void}    props.setDiet              - Diet state setter
 * @param {{kwhHome,energySource}}    props.energy               - Energy state
 * @param {function(Object): void}    props.setEnergy            - Energy state setter
 * @param {{clothingItems,electronicsItems}} props.shopping      - Shopping state
 * @param {function(Object): void}    props.setShopping          - Shopping state setter
 * @param {function(): Promise<void>} props.onCalculate          - Calculate & save handler
 * @param {boolean}                   props.isSaving             - True while Firestore save is in progress
 */
import PropTypes from 'prop-types';
import InputField from '@/components/ui/InputField';
import SelectField from '@/components/ui/SelectField';

export default function SurveySection({
  transport,
  setTransport,
  diet,
  setDiet,
  energy,
  setEnergy,
  shopping,
  setShopping,
  onCalculate,
  isSaving, // renamed from `saving` to avoid ambiguity with "carbon saving"
}) {
  return (
    <section aria-labelledby="survey-heading">
      <h2 id="survey-heading" className="section-title">
        Monthly Activity Survey
      </h2>

      {/* ── Transport ─────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="card__title font-display" style={{ fontSize: 18, marginBottom: 16 }}>
          <span aria-hidden="true">🚗</span> Transport
        </h3>
        <InputField
          id="kmCar"
          label="Car distance"
          value={transport.kmCar}
          onChange={(v) => setTransport((p) => ({ ...p, kmCar: v }))}
          unit="km/month"
          helpText="Total km driven in a personal vehicle this month"
        />
        <InputField
          id="kmBus"
          label="Bus / coach distance"
          value={transport.kmBus}
          onChange={(v) => setTransport((p) => ({ ...p, kmBus: v }))}
          unit="km/month"
        />
        <InputField
          id="kmTrain"
          label="Train / metro distance"
          value={transport.kmTrain}
          onChange={(v) => setTransport((p) => ({ ...p, kmTrain: v }))}
          unit="km/month"
        />
        <InputField
          id="flightHours"
          label="Flights this year (total)"
          value={transport.flightHours}
          onChange={(v) => setTransport((p) => ({ ...p, flightHours: v }))}
          unit="hours/year"
          helpText="Total flight time in hours across all trips this year"
          max={500}
        />
      </div>

      {/* ── Diet ──────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="card__title font-display" style={{ fontSize: 18, marginBottom: 16 }}>
          <span aria-hidden="true">🥗</span> Diet
        </h3>
        <SelectField
          id="dietType"
          label="Your diet pattern"
          value={diet.dietType}
          onChange={(v) => setDiet({ dietType: v })}
          options={[
            { value: 'none', label: '❌ None selected' },
            { value: 'meat_heavy', label: '🥩 Meat-heavy (daily red meat)' },
            { value: 'average', label: '🍽️ Average omnivore' },
            { value: 'vegetarian', label: '🥕 Vegetarian' },
            { value: 'vegan', label: '🌱 Vegan' },
          ]}
        />
        {/* Info note using CSS class — no inline styles */}
        <p className="card__info-note">
          💡 Diet accounts for 25–30% of the average household carbon footprint
        </p>
      </div>

      {/* ── Home Energy ───────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="card__title font-display" style={{ fontSize: 18, marginBottom: 16 }}>
          <span aria-hidden="true">⚡</span> Home Energy
        </h3>
        <InputField
          id="kwhHome"
          label="Electricity usage"
          value={energy.kwhHome}
          onChange={(v) => setEnergy((p) => ({ ...p, kwhHome: v }))}
          unit="kWh/month"
          helpText="Check your energy bill for monthly kWh usage"
          max={5000}
        />
        <SelectField
          id="energySource"
          label="Primary energy source"
          value={energy.energySource}
          onChange={(v) => setEnergy((p) => ({ ...p, energySource: v }))}
          options={[
            { value: 'none', label: '❌ None selected' },
            { value: 'kwh_coal', label: '🪨 Coal / gas grid (high carbon)' },
            { value: 'kwh_gas', label: '🔥 Mixed grid (average)' },
            { value: 'kwh_renewable', label: '☀️ Renewable / solar (low carbon)' },
          ]}
        />
      </div>

      {/* ── Shopping ──────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 className="card__title font-display" style={{ fontSize: 18, marginBottom: 16 }}>
          <span aria-hidden="true">🛍️</span> Shopping
        </h3>
        <InputField
          id="clothingItems"
          label="New clothing items"
          value={shopping.clothingItems}
          onChange={(v) => setShopping((p) => ({ ...p, clothingItems: v }))}
          unit="items/year"
          max={200}
        />
        <InputField
          id="electronicsItems"
          label="New electronics"
          value={shopping.electronicsItems}
          onChange={(v) => setShopping((p) => ({ ...p, electronicsItems: v }))}
          unit="items/year"
          max={50}
          helpText="Phones, laptops, tablets, etc."
        />
      </div>

      {/* ── Submit ────────────────────────────────────────────── */}
      <button
        className="btn-glass btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}
        onClick={onCalculate}
        disabled={isSaving}
        aria-busy={isSaving ? 'true' : 'false'}
      >
        {isSaving ? '⏳ Saving…' : '📊 Calculate My Footprint'}
      </button>
    </section>
  );
}

SurveySection.propTypes = {
  /** Transport state object */
  transport: PropTypes.shape({
    kmCar: PropTypes.number,
    kmBus: PropTypes.number,
    kmTrain: PropTypes.number,
    flightHours: PropTypes.number,
  }).isRequired,
  /** Transport state setter */
  setTransport: PropTypes.func.isRequired,
  /** Diet state object */
  diet: PropTypes.shape({ dietType: PropTypes.string }).isRequired,
  /** Diet state setter */
  setDiet: PropTypes.func.isRequired,
  /** Energy state object */
  energy: PropTypes.shape({
    kwhHome: PropTypes.number,
    energySource: PropTypes.string,
  }).isRequired,
  /** Energy state setter */
  setEnergy: PropTypes.func.isRequired,
  /** Shopping state object */
  shopping: PropTypes.shape({
    clothingItems: PropTypes.number,
    electronicsItems: PropTypes.number,
  }).isRequired,
  /** Shopping state setter */
  setShopping: PropTypes.func.isRequired,
  /** Called when user clicks Calculate */
  onCalculate: PropTypes.func.isRequired,
  /** True while save is in-progress */
  isSaving: PropTypes.bool.isRequired,
};
