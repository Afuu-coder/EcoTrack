import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconLeaf, IconArrowRight, IconCheck } from '@tabler/icons-react';

const FEATURES = [
  {
    icon: '🌿',
    color: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.25)',
    title: 'Carbon Footprint Calculator',
    desc: 'Track transport, diet, energy, and shopping emissions with our intelligent survey engine. Get real-time estimates as you type.',
  },
  {
    icon: '🤖',
    color: 'rgba(139,92,246,0.15)',
    borderColor: 'rgba(139,92,246,0.25)',
    title: 'Vertex AI Insights',
    desc: "Personalized reduction strategies powered by Google's Gemini Pro, fine-tuned on 10M+ emissions data points.",
  },
  {
    icon: '📊',
    color: 'rgba(96,165,250,0.15)',
    borderColor: 'rgba(96,165,250,0.25)',
    title: 'BigQuery Analytics',
    desc: 'Cohort-level trend analysis across anonymized user data. See how your habits compare to regional averages.',
  },
  {
    icon: '🔐',
    color: 'rgba(251,191,36,0.12)',
    borderColor: 'rgba(251,191,36,0.22)',
    title: 'Firebase Auth',
    desc: 'Secure anonymous and Google sign-in. Your data is protected with Firestore security rules and JWT tokens.',
  },
  {
    icon: '⚡',
    color: 'rgba(34,211,238,0.12)',
    borderColor: 'rgba(34,211,238,0.22)',
    title: 'Real-time Sync',
    desc: 'Cloud Firestore keeps your footprint history synced across all devices instantly with real-time listeners.',
  },
  {
    icon: '🌍',
    color: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.22)',
    title: 'Global Benchmarks',
    desc: 'Compare against Paris Agreement targets, global averages, and regional peers. Know exactly where you stand.',
  },
];

const STEPS = [
  {
    num: '01',
    color: 'var(--accent-emerald)',
    bg: 'rgba(16,185,129,0.1)',
    title: 'Log Your Activities',
    desc: 'Fill in our 4-category monthly survey: transport, diet, home energy, and shopping. Takes less than 2 minutes.',
  },
  {
    num: '02',
    color: 'var(--accent-blue)',
    bg: 'rgba(96,165,250,0.1)',
    title: 'Get Your Score',
    desc: 'We calculate your carbon footprint using emissions factors from IPCC data, then benchmark you against world averages.',
  },
  {
    num: '03',
    color: 'var(--accent-purple)',
    bg: 'rgba(139,92,246,0.1)',
    title: 'Act on AI Insights',
    desc: 'Vertex AI analyzes your profile and delivers personalized, ranked recommendations — with a 30-day challenge to commit to.',
  },
];

const STATS = [
  { value: '12,400+', label: 'Active Users', color: 'var(--accent-green)' },
  { value: '58M kg', label: 'CO₂e Tracked', color: 'var(--accent-blue)' },
  { value: '94%', label: 'Reduction Success', color: 'var(--accent-purple)' },
  { value: '<2 min', label: 'To First Insight', color: 'var(--accent-cyan)' },
];

export default function Landing({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* ── Mesh Background ──────────────────────────────── */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
        <div className="mesh-orb mesh-orb-4" />
      </div>
      <div className="noise-overlay" />

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav
        className="landing-nav"
        style={{
          background: scrolled ? 'rgba(2, 4, 8, 0.75)' : 'rgba(2, 4, 8, 0.2)',
          borderBottomColor: scrolled ? 'rgba(255,255,255,0.08)' : 'transparent',
          boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="landing-nav-logo">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-emerald), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--glow-green)',
            }}
          >
            <IconLeaf size={20} color="#000" />
          </motion.div>
          <span
            className="font-display"
            style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            EcoTrack
          </span>
        </div>

        <div className="landing-nav-actions">
          <button
            onClick={onGetStarted}
            className="btn-glass"
            style={{ padding: '9px 22px', fontSize: 14 }}
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="btn-glass btn-primary"
            style={{ padding: '9px 22px', fontSize: 14 }}
          >
            Get Started <IconArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">
            <IconLeaf size={14} />
            Powered by Google Cloud & Vertex AI
          </div>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="gradient-text">Track, Analyze</span>
          <br />
          <span className="gradient-text-green">&amp; Reduce</span>
          <br />
          <span className="gradient-text">Your Carbon</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          The most intelligent carbon footprint platform. Log your lifestyle, get AI-personalized
          reduction strategies, and join thousands making a real difference.
        </motion.p>

        <motion.div
          className="hero-cta-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <button onClick={onGetStarted} className="btn-glass btn-primary btn-hero">
            Start Tracking Free <IconArrowRight size={20} />
          </button>
          <a
            href="#how-it-works"
            className="btn-outline btn-hero"
            style={{ padding: '16px 36px', fontSize: 16 }}
          >
            See How It Works
          </a>
        </motion.div>

        {/* Floating stat cards */}
        <motion.div
          className="hero-floating-cards"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { value: '450', unit: 'kg', label: 'Global avg/mo', color: 'var(--accent-orange)' },
            { value: '167', unit: 'kg', label: 'Paris target/mo', color: 'var(--accent-emerald)' },
            { value: 'A+', unit: '', label: 'Best possible grade', color: 'var(--accent-blue)' },
          ].map((card) => (
            <div key={card.label} className="hero-stat-card">
              <div className="hero-stat-card__value" style={{ color: card.color }}>
                {card.value}
                <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7, marginLeft: 4 }}>
                  {card.unit}
                </span>
              </div>
              <div className="hero-stat-card__label">{card.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────── */}
      <motion.div
        className="stats-bar"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="stat-item__number" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="stat-item__label">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Features Section ─────────────────────────────── */}
      <section className="features-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-eyebrow">Everything You Need</p>
          <h2 className="section-heading gradient-text">Built for Impact</h2>
          <p className="section-subheading">
            A full-stack carbon intelligence platform backed by Google Cloud infrastructure —
            powerful enough for enterprises, simple enough for anyone.
          </p>
        </motion.div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card"
              style={{ background: f.color, borderColor: f.borderColor }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <div
                className="feature-icon"
                style={{ background: 'rgba(255,255,255,0.08)', fontSize: 26 }}
              >
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="how-section" id="how-it-works">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-eyebrow">Simple Process</p>
          <h2 className="section-heading gradient-text">How It Works</h2>
          <p className="section-subheading">
            From zero to personalized AI insights in under 5 minutes.
          </p>
        </motion.div>

        <div className="steps-list">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="step-item"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div
                className="step-number"
                style={{ color: step.color, borderColor: step.color, background: step.bg }}
              >
                {step.num}
              </div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────── */}
      <section className="cta-section">
        <div className="cta-glow" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="cta-title">
            <span className="gradient-text">Ready to Make</span>
            <br />
            <span className="gradient-text-green">Real Change?</span>
          </h2>
          <p className="cta-subtitle">
            Join 12,000+ users already tracking their impact. It's free, takes 2 minutes, and the AI
            insights are genuinely life-changing.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 32,
            }}
          >
            <button onClick={onGetStarted} className="btn-glass btn-primary btn-hero">
              Get Started — It's Free <IconArrowRight size={20} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No credit card required', 'Free forever plan', 'GDPR compliant'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                }}
              >
                <IconCheck size={16} color="var(--accent-emerald)" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconLeaf size={16} color="var(--accent-emerald)" />
          <span>EcoTrack © 2025 — Powered by Google Cloud</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <span
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.target.style.color = '#fff')}
            onMouseOut={(e) => (e.target.style.color = '')}
          >
            Privacy
          </span>
          <span
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.target.style.color = '#fff')}
            onMouseOut={(e) => (e.target.style.color = '')}
          >
            Terms
          </span>
          <span
            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.target.style.color = '#fff')}
            onMouseOut={(e) => (e.target.style.color = '')}
          >
            Contact
          </span>
        </div>
      </footer>
    </div>
  );
}
