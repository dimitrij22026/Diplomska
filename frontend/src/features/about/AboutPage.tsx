import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useLanguage } from "../../i18n"
import { useTheme } from "../../hooks/useTheme"
import { Mail, Github, Heart, Users, Target, Shield } from "lucide-react"

const ENTHUSIASM_DATA = [
  { month: "Jan", enthusiasm: 10 },
  { month: "Feb", enthusiasm: 30 },
  { month: "Mar", enthusiasm: 60 },
  { month: "Apr", enthusiasm: 120 },
  { month: "May", enthusiasm: 250 },
  { month: "Jun", enthusiasm: 500 },
  { month: "Jul", enthusiasm: 1000 },
]

export const AboutPage = () => {
  const { language } = useLanguage()
  const { mode } = useTheme()
  const isDark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  const chartColor = isDark ? "#ffffff" : "var(--color-primary)"
  const chartFill = isDark ? "#ffffff" : "var(--color-primary)"

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header className="page-header">
        <h1 className="page-title">{language === "mk" ? "За нас" : "About Us"}</h1>
        <p className="page-description">
          {language === "mk" 
            ? "Дознајте повеќе за нашата мисија, визија и контактирајте нè." 
            : "Learn more about our mission, vision, and get in touch."}
        </p>
      </header>

      <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
        
        {/* Mission Panel */}
        <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="panel__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Target size={22} color="var(--color-primary)" />
            {language === "mk" ? "Нашата Мисија" : "Our Mission"}
          </h3>
          <p style={{ marginTop: "1rem", lineHeight: "1.6", flex: 1 }}>
            {language === "mk" 
              ? "Нашата цел е финансиската писменост да ја направиме достапна за секого. Со Finson, сакаме да ви помогнеме да донесувате поумни финансиски одлуки преку моќта на вештачката интелигенција." 
              : "Our goal is to make financial literacy accessible to everyone. With Finson, we want to help you make smarter financial decisions through the power of Artificial Intelligence."}
          </p>
        </div>

        {/* Vision Panel */}
        <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="panel__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={22} color="var(--color-primary)" />
            {language === "mk" ? "Нашата Визија" : "Our Vision"}
          </h3>
          <p style={{ marginTop: "1rem", lineHeight: "1.6", flex: 1 }}>
            {language === "mk"
              ? "Градиме свет каде што управувањето со пари е лесно, безбедно и достапно преку технолошки иновации кои работат во ваша корист."
              : "We are building a world where money management is easy, secure, and accessible through technological innovations that work in your favor."}
          </p>
        </div>

        {/* Contact Panel */}
        <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="panel__title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={22} color="var(--color-primary)" />
            {language === "mk" ? "Контакт" : "Contact Us"}
          </h3>
          <p style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
            {language === "mk"
              ? "Имате прашање или идеја? Контактирајте нè преку следниве канали:"
              : "Have a question or idea? Reach out to us via the following channels:"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <a href="mailto:hello@finson.app" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", textDecoration: "none" }}>
              <Mail size={20} />
              hello@finson.app
            </a>
            <a href="https://github.com/finson" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)", textDecoration: "none" }}>
              <Github size={20} />
              GitHub Repository
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-text)" }}>
              <Heart size={20} color="var(--color-danger)" />
              {language === "mk" ? "Направено со љубов" : "Made with love"}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Panel */}
      <div className="panel">
        <h3 className="panel__title">
          🚀 {language === "mk" ? "Нашата ентузијазам за проектот" : "Our Enthusiasm for the Project"}
        </h3>
        <p className="panel__subtitle" style={{ marginBottom: "2rem" }}>
          {language === "mk" ? "Како што расте проектот, така расте и нашата мотивација!" : "As the project grows, so does our motivation!"}
        </p>
        
        <div style={{ height: "400px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ENTHUSIASM_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnthusiasm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartFill} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartFill} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.1)" : "var(--color-border)"} />
              <XAxis dataKey="month" stroke={isDark ? "rgba(255,255,255,0.7)" : "var(--color-text-light)"} />
              <YAxis stroke={isDark ? "rgba(255,255,255,0.7)" : "var(--color-text-light)"} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? "#333" : "var(--color-surface)", 
                  borderColor: isDark ? "#444" : "var(--color-border)",
                  color: isDark ? "#fff" : "var(--color-text)"
                }}
                itemStyle={{ color: chartColor }}
              />
              <Area 
                type="monotone" 
                dataKey="enthusiasm" 
                stroke={chartColor} 
                fillOpacity={1} 
                fill="url(#colorEnthusiasm)" 
                name={language === "mk" ? "Ентузијазам (Level)" : "Enthusiasm (Level)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
