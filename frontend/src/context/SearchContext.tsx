import { createContext, useContext, useState, type ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"

type SearchContextType = {
  searchTerm: string
  setSearchTerm: (term: string) => void
  handleSearch: (term: string) => void
}

const SearchContext = createContext<SearchContextType | null>(null)

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    // Navigate to transactions page if not already there
    if (location.pathname !== "/transactions" && term.trim()) {
      navigate("/transactions")
    }
  }

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, handleSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
