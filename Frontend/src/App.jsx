import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Admin/Home'
import Login from  './pages/Login'
import Attendance from './pages/Admin/Attendance'
import Registration from './pages/Admin/Registration'
import Payment from './pages/Admin/Payment'
import MonthlyIncomeChart from './components/charts/MonthlyIncomeChart'
import BasicTable from './components/tables/BasicTable'
import MonthlyTarget from './components/charts/MonthlyTarget'
import Calendar from './components/Calendar/Calendar'
import ProfileMeta from './pages/Admin/ProfileMeta'
import ParentComponent from './pages/Admin/IDHandler'
import CourseRegistration from './pages/Admin/CourseRegistration'
import TimeTables from './pages/Admin/TimeTables'
import UserProfile from './components/UserProfile/UserProfile'
import AdminUserSearch from './pages/Admin/AdminUserSearch'
import UserSearch from './pages/Admin/UserSearch'
import AdminNoticeBoard from './pages/Admin/NoticeBoard'
import Counter from './components/charts/CountOnLoad'
import Notifications from './pages/SuperAdmin/Notifications'
import TeacherRegistration from './pages/Admin/TeacherRegistration'
import Testing from './components/charts/TimeTable'
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard'
import StudentPaymentInterface from './pages/Admin/StudentPayments'
import UserAddressCard from './components/UserProfile/UserAddressCard'
import Test from './pages/Admin/EnrollmentRequestInterface'
import AdminRegistration from './pages/SuperAdmin/AdminRegistration'
import NewTest from './pages/SuperAdmin/LoanFacilityInterface'
import CourseEnrollmentRequest from './pages/Admin/CourseEnrollmentRequest'
import Header from './components/Header/Header'
import UserMetaCard from './components/UserProfile/UserMetaCard'
import UserInfoCard from './components/UserProfile/UserInfoCard'
import RecordTransactions from './pages/SuperAdmin/RecordTransactions'
import FinanceReporting from './pages/SuperAdmin/FinanceReporting'
import Users from './pages/SuperAdmin/HallBookingInterface'
import AttendanceDetails from './pages/Admin/AttendanceDetails'
import CourseDashboard from './pages/Admin/CourseDashboard'
import StudentHome from './pages/Student/Home'
import StudentAttendance from './pages/Student/Attendance'
import StudentCourses from './pages/Student/Courses'
import StudentCalendarEvent from './components/Calendar/StudentCalendar'
import StudentCourseDescription from './pages/Student/CourseDescription'
import StudentEnrolledCourse from './pages/Student/EnrolledCourse'
import StudentCourseDetails from './pages/Student/CourseDetails'
import StudentPaymentHistory from './pages/Student/PaymentHistory'
import StudentRegistration from './pages/Student/Registration'
import StudentProfileEditNew from './pages/Student/ProfileView'
import StudentStudentSchedules from './pages/Student/StudentSchedules'
import StudentTest from './pages/Student/Test'
import StudentCourseSection from './pages/Student/CourseSection'
import StudentPasswordReset from './components/PasswordReset/PasswordReset'
import StudentVirtualClasses from './pages/Student/VirtualClasses'
import StudentStudentVirtualClasses from './pages/Student/StudentVirtualClasses'
import StudentStudentResults from './pages/Student/StudentResults'
import StudentTeacherMaterialUpload from './pages/Student/TeacherMaterialUpload'
import StudentStudentQuizList from './pages/Student/StudentQuizList'
import StudentQuizTakingInterface from './pages/Student/QuizTakingInterface'
import StudentQuizResults from './pages/Student/QuizResults'
import TutorHome from './pages/Tutor/Home';
import TutorTutorUserSearch from './pages/Tutor/TutorUserSearch';
import TutorUserSearch from './pages/Tutor/UserSearch';
import TutorAnnouncements from './pages/Tutor/announcements';
import TutorGradings from './pages/Tutor/gradings';
import TutorEarnings from './pages/Tutor/earnings';
import TutorViewStudents from './pages/Tutor/view_students';
import TutorLectureMaterials from './pages/Tutor/lecture_materials';
import TutorQuizzes from './pages/Tutor/quizzes';
import TutorTest from './pages/Tutor/Test';
import TutorVirtualClasses from './pages/Tutor/virtual_classes';
import TutorMyProfile from './pages/Tutor/MyProfile';
import TutorUploadAssignments from './pages/Tutor/upload_assignments';
import TutorNewTest from './pages/Tutor/NewTest';
import TeacherQuizDashboard from './pages/Tutor/TeacherQuizDashboard'
import QuizCreator from './pages/Tutor/QuizCreator'


export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Home />} />
      <Route path="/attendance" element={<Attendance/>} />
      <Route path="/registration" element={<Registration/>} />
      <Route path="/payment" element={<Payment/>} />
      <Route path='/header' element={<Header/>}/>
      <Route path="/" element={<Login/>} />
      <Route path="/table" element={<BasicTable/>} />
      <Route path="/mincome" element={<MonthlyIncomeChart/>} />
      <Route path="/mtarget" element={<MonthlyTarget/>}/>
      <Route path="/calendar" element={<Calendar/>} />
      <Route path="/profilemeta" element={<ProfileMeta/>} />
      <Route path="/idhandler" element={<ParentComponent/>} />
      <Route path="/coursereg" element={<CourseRegistration/>} />
      <Route path='/timetables' element={<TimeTables/>}/>
      <Route path='/userprofile' element={<UserProfile/>}/>
      <Route path='/adminusersearch' element={<AdminUserSearch/>}></Route>
      <Route path='/usersearch' element={<UserSearch/>}/>
      <Route path='/adminnoticeboard' element={<AdminNoticeBoard/>}></Route>
      <Route path='/countonload' element={<Counter/>}></Route>
      <Route path='/notifications' element={<Notifications/>}></Route>
      <Route path='/teacherreg' element={<TeacherRegistration/>}></Route>
      <Route path='/testing' element={<Testing/>}></Route>
      <Route path='/superdash' element={<SuperAdminDashboard/>}></Route>
      <Route path='/stpayments' element ={<StudentPaymentInterface/>}></Route>
      <Route path='/test' element={<Test/>}></Route>
      <Route path='/udc' element={<UserAddressCard/>}></Route>
      <Route path='/adminreg' element={<AdminRegistration/>}></Route>
      <Route path='/newtest' element={<NewTest/>}></Route>
      <Route path='/enrollmentrequests' element={<CourseEnrollmentRequest/>}></Route>
      <Route path='/umc' element={<UserMetaCard/>}></Route>
      <Route path='/uic' element={<UserInfoCard/>}></Route>
      <Route path ='/newtest' element={<NewTest/>}></Route>
      <Route path='/transactions' element={<RecordTransactions/>}></Route>
      <Route path='/financial' element={<FinanceReporting/>}></Route>
      <Route path='/hallbookings' element={<Users/>}></Route>
      <Route path="/attd" element={<AttendanceDetails />} />
      <Route path='/courseDash' element={<CourseDashboard/>}></Route>

      {/* student routes */}
      <Route path="/student" element={<StudentHome/>} />
      <Route path="/student/attendance" element={<StudentAttendance/>} />
      <Route path="/student/courses" element={<StudentCourses/>} />
      <Route path="/student/payment" element={<StudentPaymentHistory/>} />
      <Route path="/student/calendar" element={<StudentCalendarEvent/>}/>
      <Route path="/course/details" element={<StudentCourseDescription/>}/>
      <Route path="/student/enrolled_courses" element={<StudentEnrolledCourse/>}/>
      <Route path="/student/cd" element={<StudentCourseDetails/>}/>
      <Route path='/student/reg' element={<StudentRegistration/>}/>
      <Route path='/student/profile_edit' element={<StudentProfileEditNew/>}/> 
      <Route path='/student/schedule' element={<StudentStudentSchedules/>}/>
      <Route path="/student/test" element={<StudentTest/>}/>
      <Route path='/student/course/section' element={<StudentCourseSection/>}/>
      <Route path='/student/passwordreset' element={<StudentPasswordReset/>}/>
      <Route path ='/student/virtual-classes' element={<StudentVirtualClasses/>}/>
      <Route path="/student/stu-virtual-classes" element={<StudentStudentVirtualClasses />} />
      <Route path="/student/result" element={<StudentStudentResults />} />
      <Route path='/student/upload' element={<StudentTeacherMaterialUpload/>}/>
      <Route path='/student/stu/quiz' element={<StudentStudentQuizList/>}/>
      <Route path='/student/takeQuiz' element={<StudentQuizTakingInterface/>}/>
      <Route path='/student/results' element={<StudentQuizResults/>}/>


      {/* Tutor routes */}
        <Route path="/tutor" element={<TutorHome />} />
        <Route path="/tutor/view_students" element={<TutorViewStudents />} />
        <Route path="/tutor/TutorUserSearch" element={<TutorTutorUserSearch />} />
        <Route path="/tutor/user_search" element={<TutorUserSearch />} />
        <Route path="/tutor/announcements" element={<TutorAnnouncements />} />
        <Route path="/tutor/gradings" element={<TutorGradings />} />
        <Route path="/tutor/earnings" element={<TutorEarnings />} />
        <Route path="/tutor/lecture_materials" element={<TutorLectureMaterials />} />
        <Route path="/tutor/quizzes" element={<TutorQuizzes />} />
        <Route path="/tutor/test" element={<TutorTest />} />
        <Route path="/tutor/virtual_classes" element={<TutorVirtualClasses />} />
        <Route path="/tutor/my_profile" element={<TutorMyProfile />} /> 
        <Route path="/tutor/upload_assignments" element={<TutorUploadAssignments />} />
        <Route path="/tutor/new_test" element={<TutorNewTest />} />
        <Route path="/tutor/quiz_interface" element={<TeacherQuizDashboard />} />
        <Route path='/tutor/quizCreate' element={<QuizCreator/>}/>


     
    </Routes>

   
  )
}
