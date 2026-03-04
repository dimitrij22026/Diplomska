import { useMemo, useState } from "react"

import { useLanguage } from "../../i18n"

type PortfolioAsset = {
  symbol: string
  allocation: number
}

const DEFAULT_ASSETS: PortfolioAsset[] = [
  { symbol: "AAPL", allocation: 35 },
  { symbol: "MSFT", allocation: 30 },
  { symbol: "VOO", allocation: 20 },
  { symbol: "BTC", allocation: 15 },
]

export const PortfolioPage = () => {
  const { language, t } = useLanguage()
  const [assets, setAssets] = useState<PortfolioAsset[]>(DEFAULT_ASSETS)

  const totalAllocation = useMemo(
    () => assets.reduce((sum, asset) => sum + (Number.isFinite(asset.allocation) ? asset.allocation : 0), 0),
    [assets],
  )

  const handleAllocationChange = (index: number, value: string) => {
    const parsed = Number(value)
    setAssets((prev) =>
      prev.map((asset, i) => (i === index ? { ...asset, allocation: Number.isFinite(parsed) ? parsed : 0 } : asset)),
    )
  }

  return (
    <section>
      <div className="dashboard__header">
        <div>
          <p className="eyebrow">{language === "mk" ? "инвестиции" : "investments"}</p>
          <h1 className="hero-title">{t("portfolio")}</h1>
        </div>
        <div className="dashboard__badge">
          <span>{language === "mk" ? "Вкупна алокација" : "Total Allocation"}</span>
          <strong>{totalAllocation.toFixed(0)}%</strong>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel__title">{language === "mk" ? "Распределба на портфолио" : "Portfolio Allocation"}</h3>
        <p className="panel__subtitle">
          {language === "mk"
            ? "Поставете целна распределба по инструмент."
            : "Set your target allocation by instrument."}
        </p>

        <table className="table">
          <thead>
            <tr>
              <th>{language === "mk" ? "Симбол" : "Symbol"}</th>
              <th>{language === "mk" ? "Алокација (%)" : "Allocation (%)"}</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={asset.symbol}>
                <td>{asset.symbol}</td>
                <td>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="1"
                    value={asset.allocation}
                    onChange={(event) => handleAllocationChange(index, event.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="portfolio-note">
          {totalAllocation === 100
            ? language === "mk"
              ? "Одлично — портфолиото е балансирано на 100%."
              : "Great — your portfolio is balanced at 100%."
            : language === "mk"
              ? "Совет: вкупната алокација треба да биде 100%."
              : "Tip: total allocation should be 100%."}
        </p>
      </div>
    </section>
  )
}
