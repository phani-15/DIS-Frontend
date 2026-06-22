import React from 'react'
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Components/AppRoutes'

export default function App() {
  return (
    <div className='text-blue-900'>
      <BrowserRouter>
        <AppRoutes/>      
      </BrowserRouter>
    </div>
  )
}
