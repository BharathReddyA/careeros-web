export default function LandingPage() {
  return (
    <>
      <header className="site-header">
        <nav className="nav container" aria-label="Main navigation">
          <a className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
            </span>
            CareerOS
          </a>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How it works</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
          <a className="btn btn-primary" href="/login">Sign in</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <span className="eyebrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z" /></svg>
              AI-powered job search
            </span>
            <h1>Your AI agent for landing<br />the right job</h1>
            <p className="lead">CareerOS matches you with jobs that actually fit, tailors your resume for every application, and coaches you through realistic voice interview practice.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#download">Download for iOS &amp; Android</a>
              <a className="btn btn-ghost" href="#how-it-works">See how it works</a>
            </div>
            <p className="hero-note">Free to start. No credit card required.</p>
          </div>
        </section>

        <section className="section section-alt" id="features">
          <div className="container">
            <div className="section-head">
              <h2>Everything you need to get hired</h2>
              <p>One app that handles the search, the paperwork, and the prep, so you can focus on showing up at your best.</p>
            </div>
            <div className="grid">
              <article className="card">
                <span className="icon" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </span>
                <h3>Smart job matching</h3>
                <p>Fresh openings from across the market, scored against your skills, preferences, and salary expectations, not just keyword matches.</p>
              </article>
              <article className="card">
                <span className="icon" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                </span>
                <h3>AI resume tailoring</h3>
                <p>Upload your resume once. CareerOS rewrites and reshapes it for each role you apply to, highlighting what that employer cares about.</p>
              </article>
              <article className="card">
                <span className="icon" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                </span>
                <h3>Voice interview coaching</h3>
                <p>Practice with a realistic AI interviewer that speaks, listens, and gives you structured feedback on your answers after every session.</p>
              </article>
              <article className="card">
                <span className="icon" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                </span>
                <h3>Application tracking</h3>
                <p>Every application, status, and follow-up in one place, with notifications when new matching jobs appear, so nothing slips through.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container">
            <div className="section-head">
              <h2>From profile to offer in four steps</h2>
              <p>Set up once, then let your agent do the heavy lifting.</p>
            </div>
            <div className="steps">
              <div className="step">
                <span className="step-number" aria-hidden="true">1</span>
                <h3>Build your profile</h3>
                <p>Add your resume and tell CareerOS what roles, locations, and salary you're looking for.</p>
              </div>
              <div className="step">
                <span className="step-number" aria-hidden="true">2</span>
                <h3>Get matched daily</h3>
                <p>Your agent scans new openings and surfaces the ones worth your time, ranked by fit.</p>
              </div>
              <div className="step">
                <span className="step-number" aria-hidden="true">3</span>
                <h3>Apply with a tailored resume</h3>
                <p>One tap generates a version of your resume tuned to the job description.</p>
              </div>
              <div className="step">
                <span className="step-number" aria-hidden="true">4</span>
                <h3>Rehearse the interview</h3>
                <p>Run voice practice sessions for the specific role and walk in prepared.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="pricing">
          <div className="container">
            <div className="section-head">
              <h2>Simple pricing</h2>
              <p>Start free. Upgrade when you're in serious search mode.</p>
            </div>
            <div className="pricing-grid">
              <div className="price-card">
                <h3>Free</h3>
                <ul>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Job matching &amp; daily alerts</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Application tracking</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Limited AI resume tailoring</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Trial interview coaching session</li>
                </ul>
                <a className="btn btn-ghost" href="/register">Get started</a>
              </div>
              <div className="price-card featured">
                <span className="plan-badge">Most popular</span>
                <h3>Pro</h3>
                <ul>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Everything in Free</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Unlimited AI resume tailoring</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Unlimited voice interview coaching</li>
                  <li><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg> Priority job match refresh</li>
                </ul>
                <a className="btn btn-primary" href="/register">Go Pro</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container">
            <div className="section-head">
              <h2>Frequently asked questions</h2>
              <p>Everything you might want to know before getting started.</p>
            </div>
            <div className="faq-list">
              <details className="faq-item">
                <summary>
                  What exactly does CareerOS do?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>CareerOS is an AI job agent. It continuously scans job listings, ranks them against your skills and preferences, rewrites your resume for each role you want to apply to, and lets you rehearse interviews with a realistic AI voice interviewer. You stay in control: it prepares everything, you decide where to apply.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  Does CareerOS apply to jobs for me automatically?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>No. CareerOS never sends anything to an employer on its own. It finds matches, prepares a tailored resume, and tracks your applications, but every application is submitted by you. No employer ever receives an automated assessment of you from us.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  Is CareerOS really free?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>Yes. Job matching, daily alerts, application tracking, limited resume tailoring, and a trial coaching session are free, with no credit card required. CareerOS Pro unlocks unlimited resume tailoring and unlimited voice interview coaching. You can cancel anytime in your App Store or Google Play settings.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  How accurate are the AI-tailored resumes?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>The AI reshapes and rephrases your real experience to match what a specific job description emphasises. It never invents qualifications. Like any AI output, it can occasionally miss nuance, so always review a tailored resume before sending it. You're responsible for what you submit to employers.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  What happens to my resume and interview recordings?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>Your data is used only to provide the service to you. We never sell it, never share it with advertisers, and never use your resumes or coaching conversations to train AI models. You can delete individual resumes, coaching sessions, or your whole account at any time. Full details, including every provider we work with and your GDPR rights, are in our <a href="/privacy.html">Privacy Policy</a>.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  Can I get a refund if I change my mind?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>If you're an EU/EEA consumer, you have a statutory 14-day right of withdrawal after purchasing a subscription. You can also request refunds through the Apple App Store or Google Play. See <a href="/terms.html#withdrawal">section 5 of our Terms</a> for the details and a model withdrawal form.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  Which platforms is CareerOS available on?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>CareerOS is available for iOS, Android, and now the web. Your account and data sync across devices, so you can switch between them without losing your matches, resumes, or application history.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>
                  Where do the job listings come from?
                  <svg className="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </summary>
                <div className="faq-answer">
                  <p>Listings are aggregated from established job market data providers covering thousands of job boards and company career pages, refreshed continuously. Only your search criteria (role, location, salary) are used to query them. Your identity and resume are never shared with listing providers.</p>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="section section-alt" id="download">
          <div className="container">
            <div className="cta-band">
              <h2>Your next role is out there</h2>
              <p>Let CareerOS find it, prep you for it, and help you land it. Available on iOS, Android, and web.</p>
              <a className="btn btn-primary" href="/register">Get started free</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a className="brand" href="/">
                <span className="brand-mark" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
                </span>
                CareerOS
              </a>
              <p>The AI job agent that matches, tailors, and coaches, so you land the right role faster.</p>
            </div>
            <div>
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="/terms.html">Terms &amp; Conditions</a></li>
                <li><a href="/privacy.html">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 CareerOS. All rights reserved.</span>
            <span><a href="/terms.html">Terms</a> · <a href="/privacy.html">Privacy</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
