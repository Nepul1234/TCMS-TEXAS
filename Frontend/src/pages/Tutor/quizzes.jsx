import React from 'react'
import Header from "../../components/Header/TutorHeader"
import Sidebar from "../../components/Sidebar/TutorSidebar"
import QuizCreation from './QuizCreation'

export default function quizzes(){
    return(
        <div>
        <Header/>
        <Sidebar/>
        <div className="p-4 sm:ml-64">
         
                
                     <QuizCreation/>
                
                
         
         
        </div>
    </div>
    )
}

