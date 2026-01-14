import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ReportsTables from "./pages/Tables/ReportsTables.tsx";
import UsersTables from "./pages/Tables/UsersTables.tsx";
import AddUserFormElements from "./pages/Forms/AddUserForm.tsx";
import AddReportFormElements from "./pages/Forms/AddReportForm.tsx";
import PrivateRoute from "./components/auth/PrivateRoute.tsx";
import {ModalProvider} from "./context/ModalContext.tsx";
import {PrimeReactProvider} from "primereact/api";
import ComplaintProvider from "./providers/complaints/ComplaintProvider.tsx";
import ComplaintsTables from "./pages/Tables/ComplaintsTables.tsx";
import ComplaintsTypesTables from "./pages/Tables/ComplaintsTypesTables.tsx";
import UsersRolesTableOne from "./components/tables/BasicTables/UsersRolesTableOne.tsx";
import UsersRolesTables from "./pages/Tables/UsersRolesTables.tsx";
import ClassroomManagement from "./pages/classrooms/ClassroomManagement.tsx";
import ClassroomFormPage from "./pages/classrooms/ClassroomFormPage.tsx";
import ClassroomSubjectsPage from "./pages/classrooms/ClassroomSubjectsPage.tsx";
import ClassroomTemplateSubjectsPage from "./pages/classrooms/ClassroomTemplateSubjectsPage.tsx";
import StudentManagement from "./pages/students/StudentManagement.tsx";
import StudentFormPage from "./pages/students/StudentFormPage.tsx";
import StudentDetails from "./pages/students/StudentDetails.tsx";
import StudentDetailPage from "./pages/students/StudentDetailPage.tsx";
import TeacherManagement from "./pages/teachers/TeacherManagement.tsx";
import TeacherFormPage from "./pages/teachers/TeacherFormPage.tsx";
import TeacherDetailPage from "./pages/teachers/TeacherDetailPage.tsx";
import ClassroomDetails from "./pages/classrooms/ClassroomDetails.tsx";
import ClassroomDetailPage from "./pages/classrooms/ClassroomDetailPage.tsx";
import SubjectManagement from "./pages/subjects/SubjectManagement.tsx";
import SubjectFormPage from "./pages/subjects/SubjectFormPage.tsx";
import GradeManagement from "./pages/grades/GradeManagement.tsx";
import GradeFormPage from "./pages/grades/GradeFormPage.tsx";
import AssignmentManagement from "./pages/assignments/AssignmentManagement.tsx";
import AssignmentFormPage from "./pages/assignments/AssignmentFormPage.tsx";
import ScheduleManagement from "./pages/schedules/ScheduleManagement.tsx";
import ScheduleFormPage from "./pages/schedules/ScheduleFormPage.tsx";
import SchoolYearManagement from "./pages/school-years/SchoolYearManagement.tsx";
import SchoolYearFormPage from "./pages/school-years/SchoolYearFormPage.tsx";
import EvaluationTypeManagement from "./pages/evaluations/EvaluationTypeManagement.tsx";
import PaymentManagement from "./pages/payments/PaymentManagement.tsx";
import PaymentFormPage from "./pages/payments/PaymentFormPage.tsx";
import SchoolManagement from "./pages/schools/SchoolManagement.tsx";
import SchoolFormPage from "./pages/schools/SchoolFormPage.tsx";
import { SchoolYearProvider } from "./context/SchoolYearContext.tsx";
import ReceiptPage from "./pages/payments/ReceiptPage.tsx";
import UserManagement from "./pages/users/UserManagement.tsx";
import ReportCardPage from "./pages/reports/ReportCardPage.tsx";
import ResourceManagement from "./pages/resources/ResourceManagement.tsx";
import ResourceUploadPage from "./pages/resources/ResourceUploadPage.tsx";

import { useEffect } from "react";
import useAuth from "./providers/auth/useAuth.ts";

export default function App() {
  // @ts-ignore
  const { authMe, isLoading, accessToken } = useAuth();

  useEffect(() => {
    const refreshToken = async () => {
        if (!isLoading && accessToken) {
            try {
                await authMe();
            } catch (e) {
                // Ignore errors
                console.error("Auto-refresh failed", e);
            }
        }
    };
    refreshToken();
  }, [isLoading, accessToken]);

  return (
      <>
        <PrimeReactProvider>
        {/*<PrimeReactProvider value={{locale: 'en'}}>*/}
          <ComplaintProvider >
            <SchoolYearProvider>
              <ModalProvider>
              <ScrollToTop />
              <Routes>
                {/* Dashboard Layout */}

                <Route element={<PrivateRoute />}>
                  <Route element={<AppLayout />}>
                    <Route index path="/" element={<Home />} />

                    {/* School Management */}
                    <Route path="/classrooms" element={<ClassroomManagement />} />
                    <Route path="/classrooms/new" element={<ClassroomFormPage />} />
                    <Route path="/classrooms/:id/edit" element={<ClassroomFormPage />} />
                    <Route path="/classrooms/:id/details" element={<ClassroomDetails />} />
                    <Route path="/classrooms/:id" element={<ClassroomDetailPage />} />
                    <Route path="/classrooms/:classroomId/subjects" element={<ClassroomSubjectsPage />} />
                    <Route path="/classroom-templates/:templateId/subjects" element={<ClassroomTemplateSubjectsPage />} />
                    <Route path="/students" element={<StudentManagement />} />
                    <Route path="/students/new" element={<StudentFormPage />} />
                    <Route path="/students/:id/edit" element={<StudentFormPage />} />
                    <Route path="/students/:id/details" element={<StudentDetails />} />
                    <Route path="/students/:id" element={<StudentDetailPage />} />
                    <Route path="/teachers" element={<TeacherManagement />} />
                    <Route path="/teachers/new" element={<TeacherFormPage />} />
                    <Route path="/teachers/:id/edit" element={<TeacherFormPage />} />
                    <Route path="/teachers/:id/details" element={<TeacherDetailPage />} />
                    <Route path="/subjects" element={<SubjectManagement />} />
                    <Route path="/subjects/new" element={<SubjectFormPage />} />
                    <Route path="/subjects/:id/edit" element={<SubjectFormPage />} />
                    <Route path="/grades" element={<GradeManagement />} />
                    <Route path="/grades/new" element={<GradeFormPage />} />
                    <Route path="/grades/edit" element={<GradeFormPage />} />
                    <Route path="/assignments" element={<AssignmentManagement />} />
                    <Route path="/assignments/new" element={<AssignmentFormPage />} />
                    <Route path="/assignments/edit" element={<AssignmentFormPage />} />
                    <Route path="/schedules" element={<ScheduleManagement />} />
                    <Route path="/schedules/new" element={<ScheduleFormPage />} />
                    <Route path="/schedules/edit" element={<ScheduleFormPage />} />
                    <Route path="/school-years" element={<SchoolYearManagement />} />
                    <Route path="/school-years/new" element={<SchoolYearFormPage />} />
                    <Route path="/school-years/:id/edit" element={<SchoolYearFormPage />} />
                    <Route path="/evaluation-types" element={<EvaluationTypeManagement />} />
                    <Route path="/resources" element={<ResourceManagement />} />
                    <Route path="/resources/upload" element={<ResourceUploadPage />} />
                    <Route path="/payments" element={<PaymentManagement />} />
                    <Route path="/payments/new" element={<PaymentFormPage />} />
                    <Route path="/payments/:id/receipt" element={<ReceiptPage />} />
                    
                    {/* Report Cards */}
                    <Route path="/report-cards/:id" element={<ReportCardPage />} />
                    
                    {/* Schools Management */}
                    <Route path="/schools" element={<SchoolManagement />} />
                    <Route path="/schools/new" element={<SchoolFormPage />} />
                    <Route path="/schools/:id/edit" element={<SchoolFormPage />} />

                    {/* Complaints Page */}
                    <Route path="/complaints" element={<ComplaintsTables />} />
                    <Route path="/complaints-types" element={<ComplaintsTypesTables />} />
                    {/*<Route path="/complaints-types" element={<ReportsTables />} />*/}

                    {/* Users Page */}
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/create-user" element={<AddUserFormElements />} />
                    <Route path="/role-managment" element={<UsersRolesTables />} />

                    {/* Reporting Page */}
                    <Route path="/generate-report" element={<AddReportFormElements />} />
                    <Route path="/statistics" element={<Home />} />
                    <Route path="/view-reportings" element={<ReportsTables />} />


                    <Route path="/profile" element={<UserProfiles />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/blank" element={<Blank />} />

                    {/* Forms */}
                    <Route path="/form-elements" element={<FormElements />} />

                    {/* Tables */}
                    <Route path="/basic-tables" element={<BasicTables />} />

                    {/* Ui Elements */}
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/avatars" element={<Avatars />} />
                    <Route path="/badge" element={<Badges />} />
                    <Route path="/buttons" element={<Buttons />} />
                    <Route path="/images" element={<Images />} />
                    <Route path="/videos" element={<Videos />} />

                    {/* Charts */}
                    <Route path="/line-chart" element={<LineChart />} />
                    <Route path="/bar-chart" element={<BarChart />} />
                  </Route>
                </Route>

                {/* Auth Layout */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Fallback Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ModalProvider>
          </SchoolYearProvider>
          </ComplaintProvider>
        </PrimeReactProvider>
      </>
  );
}
