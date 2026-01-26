import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../../api/client"
import type { BudgetGoal } from "../../api/types"
import { useAuth } from "../../hooks/useAuth"

export const useBudgets = () => {
  const { token } = useAuth()
  return useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiClient.get<BudgetGoal[]>("/budgets", { token }),
    enabled: Boolean(token),
  })
}

export const useCreateBudget = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<BudgetGoal, "id" | "user_id" | "created_at" | "updated_at">) =>
      apiClient.post<BudgetGoal>("/budgets", payload, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  })
}

export const useDeleteBudget = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (budgetId: number) => apiClient.delete(`/budgets/${budgetId}`, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  })
}

export const useUpdateBudget = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Omit<BudgetGoal, "id" | "user_id" | "created_at" | "updated_at">> & { id: number }) =>
      apiClient.patch<BudgetGoal>(`/budgets/${id}`, payload, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  })
}
