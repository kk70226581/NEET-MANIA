import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [liveCount, setLiveCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Count-up animation
    const target = 1284;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setLiveCount(target);
    } else {
      let current = 0;
      const step = Math.max(1, Math.floor(target / 40));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setLiveCount(current);
      }, 25);

      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Scroll reveal animation
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduced && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));

      return () => obs.disconnect();
    } else {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    }
  }, []);

  return (
    <>
      <svg className="grain" width="100%" height="100%">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0"
          />
        </filter>
      </svg>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="chalkRough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.025 0.06" numOctaves="2" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <header className="site">
        <div className="nav-row">
          <div className="logo">
            Solnut
            <svg viewBox="0 0 78 10">
              <path
                d="M2 6 Q 20 1, 40 6 T 76 5"
                stroke="var(--yellow)"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                filter="url(#chalkRough)"
              />
            </svg>
          </div>
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#pipeline">Question Bank</a>
            <a href="#subjects">Subjects</a>
            <a href="#quality">How it works</a>
            <a href="#tutor">AI Tutor</a>
          </nav>
          <div className="nav-actions">
            <button className="nav-login" onClick={() => navigate('/admin/login')}>
              Admin login
            </button>
            <button className="nav-cta" onClick={() => navigate('/login')}>
              Student login
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">NEET 2027 · Biology · Physics · Chemistry</span>
              <h1>
                Revise like the boards are <span className="em">already watching.</span>
              </h1>
              <p className="lede">
                40,000+ NCERT-mapped questions, scored for quality instead of just stacked by quantity. Every PYQ,
                every chapter, sorted into one dashboard.
              </p>
              <div className="cta-row">
                <button className="btn-primary" onClick={() => navigate('/login')}>
                  Student login
                </button>
                <button className="btn-admin" onClick={() => navigate('/admin/login')}>
                  Admin login
                </button>
                <a href="#subjects" className="btn-outline">
                  See the question bank →
                </a>
              </div>
              <div className="live-tick">
                <span className="dot"></span>
                <span className="mono">{liveCount.toLocaleString()}</span>
                <span>students revising right now</span>
              </div>
            </div>

            <div className="hero-art reveal">
              <svg viewBox="0 0 360 320" aria-hidden="true">
                <g filter="url(#chalkRough)" fill="none" stroke="var(--chalk)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="150" cy="150" r="34" stroke="var(--cyan)" strokeWidth="2.4" />
                  <path d="M124 128 Q 96 104, 78 92" />
                  <path d="M120 150 Q 86 150, 64 146" />
                  <path d="M126 174 Q 98 196, 82 212" />
                  <path d="M150 184 Q 150 220, 150 246" />
                  <path d="M184 150 Q 230 150, 260 150" stroke="var(--yellow)" strokeWidth="2.6" />
                  <path d="M260 150 L 286 134" />
                  <path d="M260 150 L 288 152" />
                  <path d="M260 150 L 284 170" />
                  <ellipse cx="240" cy="150" rx="22" ry="9" stroke="var(--chalk-dim)" strokeWidth="1.4" />
                </g>
                <g className="leader-label">
                  <text x="40" y="84">dendrites</text>
                  <text x="150" y="270">axon terminal →</text>
                  <text x="194" y="118">myelin sheath</text>
                </g>
              </svg>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats">
          <div className="wrap stats-grid">
            <div className="stat reveal">
              <b>40,000+</b>
              <span>questions, NCERT-mapped</span>
            </div>
            <div className="stat reveal">
              <b>25 yrs</b>
              <span>of PYQs covered</span>
            </div>
            <div className="stat reveal">
              <b>3</b>
              <span>subjects, 1 dashboard</span>
            </div>
            <div className="stat reveal">
              <b>50%</b>
              <span>of NEET marks are Biology — weighted accordingly</span>
            </div>
          </div>
        </section>

        <section id="pipeline">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="tag">From source to score</span>
              <h2>A question-first platform, built for serious practice.</h2>
              <p>Every PDF is converted into structured, reviewed questions before it reaches the test centre.</p>
            </div>
            <div className="pipeline">
              {[
                ['01', 'Curate', 'Import PYQs, chapter tests, mocks, and original questions.'],
                ['02', 'Verify', 'Review answers, explanations, diagrams, tags, and difficulty.'],
                ['03', 'Practise', 'Generate focused papers and solve them in realistic CBT mode.'],
                ['04', 'Improve', 'Turn results and mistakes into the next revision plan.'],
              ].map(([number, title, copy], index) => (
                <div className="pipe-step reveal" key={number}>
                  <div className="pipe-num">{number}</div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  {index < 3 && <span className="pipe-connector" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="rule" />

        <section id="subjects">
          <div className="wrap">
            <div className="section-head reveal">
              <span className="tag">One syllabus, three disciplines</span>
              <h2>Practice that respects how each NEET subject behaves.</h2>
              <p>Build chapter tests, topic drills, subject papers, PYQ sprints, or a complete 180-question mock.</p>
            </div>
            <div className="subject-grid">
              {[
                ['Biology', 'NCERT-first practice across Botany and Zoology, including statement and diagram questions.', '90 questions in full mocks', 'var(--green)'],
                ['Physics', 'Conceptual and numerical questions with timing data to expose calculation bottlenecks.', '45 questions in full mocks', 'var(--cyan)'],
                ['Chemistry', 'Balanced Physical, Organic, and Inorganic Chemistry with source and difficulty filters.', '45 questions in full mocks', 'var(--pink)'],
              ].map(([title, copy, meta, color]) => (
                <article className="card reveal" key={title}>
                  <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="23" fill="none" stroke={color} strokeWidth="2" /><path d="M18 31h24M30 19v24" stroke={color} strokeWidth="2" strokeLinecap="round" /></svg>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <a href="/register">{meta} →</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="quality">
          <div className="wrap quality-grid">
            <div className="donut-wrap reveal">
              <svg viewBox="0 0 220 220" width="220" aria-label="Balanced question quality">
                <circle cx="110" cy="110" r="76" fill="none" stroke="var(--chalk-faint)" strokeWidth="26" />
                <circle cx="110" cy="110" r="76" fill="none" stroke="var(--yellow)" strokeWidth="26" strokeDasharray="210 478" transform="rotate(-90 110 110)" />
                <circle cx="110" cy="110" r="76" fill="none" stroke="var(--cyan)" strokeWidth="26" strokeDasharray="145 478" strokeDashoffset="-210" transform="rotate(-90 110 110)" />
                <circle cx="110" cy="110" r="76" fill="none" stroke="var(--green)" strokeWidth="26" strokeDasharray="123 478" strokeDashoffset="-355" transform="rotate(-90 110 110)" />
                <text x="110" y="105" textAnchor="middle" fill="var(--chalk)" fontSize="24" fontWeight="700">Quality</text>
                <text x="110" y="128" textAnchor="middle" fill="var(--chalk-dim)" fontSize="12">before quantity</text>
              </svg>
            </div>
            <div className="reveal">
              <div className="section-head">
                <span className="tag">Better paper selection</span>
                <h2>Not every question deserves equal weight.</h2>
                <p>Solnut combines teacher review, NCERT relevance, source quality, concept importance, and student performance data.</p>
              </div>
              <div className="legend">
                <div className="legend-item"><span className="swatch" style={{ background: 'var(--yellow)' }} /> NCERT and PYQ relevance <b>44%</b></div>
                <div className="legend-item"><span className="swatch" style={{ background: 'var(--cyan)' }} /> Concept and difficulty balance <b>30%</b></div>
                <div className="legend-item"><span className="swatch" style={{ background: 'var(--green)' }} /> Verified student performance <b>26%</b></div>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        <section id="tutor">
          <div className="wrap quality-grid">
            <div className="section-head reveal">
              <span className="tag">AI where it actually helps</span>
              <h2>Explanation after practice—not AI theatre before it.</h2>
              <p>The test engine, scoring, timer, and analytics are deterministic. AI helps explain doubts and turn real performance data into a useful recommendation.</p>
            </div>
            <div className="chat-card reveal">
              <div className="bubble student"><span className="who">STUDENT</span>Why did I lose marks in Current Electricity?</div>
              <div className="bubble ai"><span className="who">SOLNUT ANALYSIS</span>You missed 4 of 7 numerical questions and spent 84 seconds on average. Revise series-parallel resistance, then take a 15-question topic drill.</div>
              <div className="bubble student"><span className="who">STUDENT</span>Show me what to do today.</div>
              <div className="bubble ai"><span className="who">SOLNUT PLAN</span>35 min NCERT recall → 20 medium questions → mistake notebook → timed retest.</div>
            </div>
          </div>
        </section>

        <section className="footer-cta">
          <div className="wrap reveal">
            <h2>Your next mock should teach you something.</h2>
            <button className="btn-primary" onClick={() => navigate('/register')}>Create your free account</button>
            <p className="small">Verified question bank · Real CBT practice · Personal mistake notebook</p>
          </div>
        </section>
      </main>

      <footer className="site">
        <div className="wrap foot-row">
          <span>© 2026 Solnut</span>
          <div className="foot-links">
            <a href="#quality">Why Solnut</a>
            <a href="#pipeline">Question Bank</a>
            <a href="#tutor">AI analysis</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
