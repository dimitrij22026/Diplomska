import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../../api/client"
import type { BudgetGoal } from "../../api/types"
import { useAuth } from "../../hooks/useAuth"

export const useBudgets = () => {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: ["budgets", user?.id],
    queryFn: () => apiClient.get<BudgetGoal[]>("/budgets", { token }),
    enabled: Boolean(token && user),
  })
}

export const useCreateBudget = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<BudgetGoal, "id" | "user_id" | "created_at" | "updated_at">) =>
      apiClient.post<BudgetGoal>("/budgets", payload, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets", user?.id] }),
  })
}

export const useDeleteBudget = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (budgetId: number) => apiClient.delete(`/budgets/${budgetId}`, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets", user?.id] }),
  })
}

export const useUpdateBudget = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<Omit<BudgetGoal, "id" | "user_id" | "created_at" | "updated_at">> & { id: number }) =>
      apiClient.patch<BudgetGoal>(`/budgets/${id}`, payload, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets", user?.id] }),
  })
}
