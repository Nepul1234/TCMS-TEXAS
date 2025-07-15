import React from 'react'
import { useAuth } from '../../components/context/AuthContext'

export default function Test() {
    const { user } = useAuth()
  return (
    <div className='flex justify-center items-center h-screen'>
        <h1 className='text-3xl font-bold'>Test Page</h1>
        <p className='text-xl'>User: {user ? user.name : "No user logged in"}</p>
    </div>

    
  )
}
