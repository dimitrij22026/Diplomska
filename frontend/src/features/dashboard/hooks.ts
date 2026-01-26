import { useQuery } from "@tanstack/react-query"

import { apiClient } from "../../api/client"
import type { MonthlyInsight } from "../../api/types"
import { useAuth } from "../../hooks/useAuth"

export const useMonthlyInsight = () => {
  const { token } = useAuth()
  return useQuery({
    queryKey: ["insight", "monthly"],
    queryFn: () => apiClient.get<MonthlyInsight>("/transactions/insights/monthly", { token }),
    enabled: Boolean(token),
  })
}
