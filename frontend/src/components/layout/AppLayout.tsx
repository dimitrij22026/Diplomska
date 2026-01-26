import { Outlet } from "react-router-dom"

import { SearchProvider } from "../../context/SearchContext"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export const AppLayout = () => {
  return (
    <SearchProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <TopBar />
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}
