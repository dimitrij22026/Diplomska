import type { ReactNode } from "react"

import { cn } from "../../utils/cn"

interface MetricCardProps {
  label: string
  value: string
  delta?: string
  tone?: "default" | "positive" | "negative"
  icon?: ReactNode
}

export const MetricCard = ({ label, value, delta, tone = "default", icon }: MetricCardProps) => {
  return (
    <article className={cn("stat-card", tone === "negative" && "stat-card--expense")}> 
      <div className="stat-card__header">
        <p className="stat-card__label">{label}</p>
        {icon}
      </div>
      <p className="stat-card__value">{value}</p>
      {delta && <p className="stat-card__trend">{delta}</p>}
    </article>
  )
}