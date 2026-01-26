import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../../api/client"
import type { AdviceEntry, AdviceRequestPayload, ConversationSummary } from "../../api/types"
import { useAuth } from "../../hooks/useAuth"

export const useAdviceHistory = () => {
  const { token } = useAuth()
  return useQuery({
    queryKey: ["advice"],
    queryFn: () => apiClient.get<AdviceEntry[]>("/advice", { token }),
    enabled: Boolean(token),
  })
}

export const useConversations = () => {
  const { token } = useAuth()
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiClient.get<ConversationSummary[]>("/advice/conversations", { token }),
    enabled: Boolean(token),
  })
}

export const useConversation = (conversationId: string | null) => {
  const { token } = useAuth()
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => apiClient.get<AdviceEntry[]>(`/advice/conversations/${conversationId}`, { token }),
    enabled: Boolean(token) && Boolean(conversationId),
  })
}

export const useAskAdvice = (onSuccessCallback?: (data: AdviceEntry) => void) => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AdviceRequestPayload) => apiClient.post<AdviceEntry>("/advice", payload, { token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["advice"] })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      queryClient.invalidateQueries({ queryKey: ["conversation"] })
      onSuccessCallback?.(data)
    },
  })
}

export const useDeleteConversation = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => apiClient.delete(`/advice/conversations/${conversationId}`, { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advice"] })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      queryClient.invalidateQueries({ queryKey: ["conversation"] })
    },
  })
}

export const useClearAdviceHistory = () => {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.delete("/advice", { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advice"] })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      queryClient.invalidateQueries({ queryKey: ["conversation"] })
    },
  })
}
