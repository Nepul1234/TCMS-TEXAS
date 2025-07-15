import React from 'react'
import Sidebar from '../../components/Sidebar/TutorSidebar'
import Header from '../../components/Header/TutorHeader'
import AdminUserSearch from './TutorUserSearch'

export default function() {
  return (
    <div>
        <Header/>
        <Sidebar/>
        <div className='p-4 sm:ml-64'>
            <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
                  <div className="grid gap-3 mb-4">
                      <div className="flex items-center justify-center h-24 rounded-sm bg-gray-50 dark:bg-gray-800">
                          <p className="text-2xl text-blue-500 dark:text-gray-500">
                           Admin User Search
                          </p>
                       </div>
                        <div className="flex items-center justify-center rounded-sm bg-gray-50 dark:bg-gray-800">
                            <AdminUserSearch/>
                        </div>
                  </div>
            </div>
            </div>
    </div>
  )
}
