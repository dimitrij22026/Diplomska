import { useNavigate } from "react-router-dom"
import { useLanguage } from "../../i18n/useLanguage"
import { ThemeToggle } from "../../components/ui/ThemeToggle"
import "./LandingPage.css"

export function LandingPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="nav-logo-icon">F</div>
          <span>Finson</span>
        </div>
        <div className="landing-nav-links">
          <button onClick={() => scrollToSection("features")}>{t("features")}</button>
          <button onClick={() => scrollToSection("how-it-works")}>{t("howItWorks")}</button>
          <button onClick={() => scrollToSection("insights")}>{t("insights")}</button>
        </div>
        <div className="landing-nav-actions">
          <ThemeToggle />
          <button
            onClick={() => navigate("/auth/login")}
            className="btn-nav-login"
          >
            {t("logIn")}
          </button>
          <button
            onClick={() => navigate("/auth/login?mode=register")}
            className="btn-nav-register"
          >
            {t("getStarted")}
          </button>
        </div>
      </nav>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="landing-section hero-section">
          <h1 className="hero-title">
            {t("masterFinances")}<br />
            <span className="hero-title-highlight">{t("empowerFuture")}</span>
          </h1>
          <p className="hero-subtitle">
            {t("heroSubtitle")}
          </p>
          <div className="hero-actions">
            <button
              onClick={() => navigate("/auth/login?mode=register")}
              className="btn-hero-primary"
            >
              {t("startForFree")}
            </button>
            <button
              onClick={() => navigate("/auth/login")}
              className="btn-hero-secondary"
            >
              {t("signIn")}
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="landing-section alt-bg">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">{t("everythingYouNeed")}</h2>
              <p className="section-subtitle">
                {t("featuresSubtitle")}
              </p>
            </div>
            <div className="features-grid">
              {[
                { title: t("smartTracking"), desc: t("smartTrackingDesc"), icon: "📊" },
                { title: t("aiAssistant"), desc: t("aiAssistantDesc"), icon: "🤖" },
                { title: t("budgetControl"), desc: t("budgetControlDesc"), icon: "💰" }
              ].map((feature, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="landing-section">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">{t("howItWorksTitle")}</h2>
              <p className="section-subtitle">{t("howItWorksSubtitle")}</p>
            </div>
            <div className="steps-grid">
              {[
                { step: "1", title: t("createAccount"), desc: t("createAccountDesc") },
                { step: "2", title: t("addTransactions"), desc: t("addTransactionsDesc") },
                { step: "3", title: t("gainInsights"), desc: t("gainInsightsDesc") }
              ].map((item, i) => (
                <div key={i} className="step-item">
                  <div className="step-number">
                    {item.step}
                  </div>
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-desc">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section id="insights" className="landing-section alt-bg">
          <div className="section-inner insights-row">
            <div className="insights-content">
              <h2 className="insights-title">{t("deepFinancialAnalytics")}</h2>
              <p className="insights-desc">
                {t("insightsDesc")}
              </p>
              <ul className="insights-list">
                {[
                  t("monthlyTrends"),
                  t("categoryBreakdowns"),
                  t("netWorthTracking"),
                  t("customizableReports")
                ].map((item, i) => (
                  <li key={i}>
                    <span>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="insights-visual">
              {/* Mock Chart Visualization */}
              <div className="mock-chart">
                {[40, 70, 45, 90, 65, 110, 85].map((h, i) => (
                  <div key={i} className="mock-bar" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="landing-section">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">{t("whyChooseUs")}</h2>
            </div>
            <div className="benefits-grid">
              {[
                { label: "100%", sub: t("secure") },
                { label: "AI", sub: t("aiPowered") },
                { label: "24/7", sub: t("sync247") },
                { label: "0", sub: t("noHiddenFees") }
              ].map((stat, i) => (
                <div key={i} className="benefit-item">
                  <div className="benefit-value">{stat.label}</div>
                  <div className="benefit-label">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="landing-nav-logo">
            <div className="nav-logo-icon" style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}>F</div>
            <span style={{ fontSize: '1.2rem', color: 'var(--muted)' }}>Finson</span>
          </div>
          <div className="footer-links">
            <a href="#">{t("privacyPolicy")}</a>
            <a href="#">{t("termsOfService")}</a>
            <a href="#">{t("contactSupport")}</a>
          </div>
          <p className="footer-copy">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  )
}
