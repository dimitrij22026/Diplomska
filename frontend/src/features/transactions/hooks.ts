import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../../api/client"
import type { Transaction, TransactionPayload } from "../../api/types"
import { useAuth } from "../../hooks/useAuth"

export const useTransactions = () => {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => apiClient.get<Transaction[]>("/transactions", { token }),
    enabled: Boolean(token && user),
  })
}

export const useCreateTransaction = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TransactionPayload) => apiClient.post<Transaction>("/transactions", payload, { token }),
    onSuccess: (created: Transaction) => {
      // Prepend the newly created transaction into the cache so the UI shows it
      queryClient.setQueryData<Transaction[] | undefined>(["transactions", user?.id], (old) => {
        if (!old) return [created]
        return [created, ...old]
      })
    },
  })
}

export const useDeleteTransaction = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (transactionId: number) => apiClient.delete(`/transactions/${transactionId}`, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] }),
  })
}

export const useUpdateTransaction = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<TransactionPayload> & { id: number }) =>
      apiClient.patch<Transaction>(`/transactions/${id}`, payload, { token }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions", user?.id] }),
  })
}
