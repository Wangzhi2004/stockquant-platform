import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
