import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { apiClient } from "../../api/client"
import type { AdviceEntry, AdviceRequestPayload, ConversationSummary } from "../../api/types"
import { useAuth } from "../../hooks/useAuth"

export const useAdviceHistory = () => {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: ["advice", user?.id],
    queryFn: () => apiClient.get<AdviceEntry[]>("/advice", { token }),
    enabled: Boolean(token && user),
  })
}

export const useConversations = () => {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => apiClient.get<ConversationSummary[]>("/advice/conversations", { token }),
    enabled: Boolean(token && user),
  })
}

export const useConversation = (conversationId: string | null) => {
  const { token, user } = useAuth()
  return useQuery({
    queryKey: ["conversation", user?.id, conversationId],
    queryFn: () => apiClient.get<AdviceEntry[]>(`/advice/conversations/${conversationId}`, { token }),
    enabled: Boolean(token) && Boolean(conversationId) && Boolean(user),
  })
}

export const useAskAdvice = (onSuccessCallback?: (data: AdviceEntry) => void) => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AdviceRequestPayload) => apiClient.post<AdviceEntry>("/advice", payload, { token }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["advice", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["conversation", user?.id] })
      onSuccessCallback?.(data)
    },
  })
}

export const useDeleteConversation = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => apiClient.delete(`/advice/conversations/${conversationId}`, { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advice", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["conversation", user?.id] })
    },
  })
}

export const useClearAdviceHistory = () => {
  const { token, user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.delete("/advice", { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advice", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] })
      queryClient.invalidateQueries({ queryKey: ["conversation", user?.id] })
    },
  })
}
