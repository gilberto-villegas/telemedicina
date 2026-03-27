import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardType from './pages/dashboard/DashboardType';
import DoctorAppointments from './pages/dashboard/doctor/Appointments';
import DoctorAppointmentDetail from './pages/dashboard/doctor/AppointmentDetail';
import PostConsultationForm from './pages/dashboard/doctor/PostConsultationForm';

import DoctorPatients from './pages/dashboard/doctor/Patients';
import DoctorPatientDetail from './pages/dashboard/doctor/PatientDetail';
import DoctorAvailability from './pages/dashboard/doctor/Availability';
import DoctorSettings from './pages/dashboard/doctor/Settings';
import DoctorChat from './pages/dashboard/doctor/Chat';
import DoctorPaymentsPage from './pages/dashboard/doctor/Payments';
import DoctorWallet from './pages/dashboard/doctor/Wallet';

import PatientAppointments from './pages/dashboard/patient/Appointments';
import PatientDoctors from './pages/dashboard/patient/Doctors';
import PatientMedicalRecords from './pages/dashboard/patient/Medical-Records';
import PatientPayments from './pages/dashboard/patient/Payments';
import PatientPrescriptions from './pages/dashboard/patient/Prescriptions';
import PatientSettings from './pages/dashboard/patient/Settings';
import PatientChat from './pages/dashboard/patient/Chat';
import PatientBooking from './pages/dashboard/patient/doctors/Booking';
import PatientAppointmentDetail from './pages/dashboard/patient/AppointmentDetail';
import PatientQuestionnaire from './pages/dashboard/patient/appointments/Questionnaire';

import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import AdminDoctors from './pages/dashboard/admin/Doctors';
import AdminPatients from './pages/dashboard/admin/Patients';
import AdminSpecialties from './pages/dashboard/admin/Specialties';
import AdminAdmins from './pages/dashboard/admin/Admins';
import AdminBanks from './pages/dashboard/admin/AdminBanks';
import AdminPayments from './pages/dashboard/admin/AdminPayments';
import AdminSettings from './pages/dashboard/admin/AdminSettings';
import AdminWallet from './pages/dashboard/admin/AdminWallet';

import VideoCall from './pages/dashboard/VideoCall';
import Notifications from './pages/dashboard/Notifications';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/auth">
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Route>

            <Route path="/dashboard">
                {/* Doctor Routes - Explicit Grouping */}
                <Route path="doctor">
                    <Route index element={<DashboardType />} />
                    <Route path="appointments" element={<DoctorAppointments />} />
                    <Route path="appointments/:id" element={<DoctorAppointmentDetail />} />
                    <Route path="appointments/:id/post-consultation" element={<PostConsultationForm />} />
                    <Route path="patients" element={<DoctorPatients />} />
                    <Route path="patients/:id" element={<DoctorPatientDetail />} />
                    <Route path="availability" element={<DoctorAvailability />} />
                    <Route path="payments" element={<DoctorPaymentsPage />} />
                    <Route path="wallet" element={<DoctorWallet />} />
                    <Route path="settings" element={<DoctorSettings />} />
                    <Route path="appointments/:id/video" element={<VideoCall />} />
                    <Route path="chat" element={<DoctorChat />} />
                </Route>

                {/* Patient Routes - Explicit Grouping */}
                <Route path="patient">
                    <Route index element={<DashboardType />} />
                    <Route path="appointments" element={<PatientAppointments />} />
                    <Route path="appointments/:id" element={<PatientAppointmentDetail />} />
                    <Route path="appointments/:id/questionnaire" element={<PatientQuestionnaire />} />
                    <Route path="doctors" element={<PatientDoctors />} />
                    <Route path="doctors/:id/book" element={<PatientBooking />} />
                    <Route path="medical-records" element={<PatientMedicalRecords />} />
                    <Route path="payments" element={<PatientPayments />} />
                    <Route path="prescriptions" element={<PatientPrescriptions />} />
                    <Route path="settings" element={<PatientSettings />} />
                    <Route path="appointments/:id/video" element={<VideoCall />} />
                    <Route path="chat" element={<PatientChat />} />
                </Route>

                {/* Admin Routes */}
                <Route path="admin">
                    <Route index element={<AdminDashboard />} />
                    <Route path="doctors" element={<AdminDoctors />} />
                    <Route path="patients" element={<AdminPatients />} />
                    <Route path="specialties" element={<AdminSpecialties />} />
                    <Route path="admins" element={<AdminAdmins />} />
                    <Route path="banks" element={<AdminBanks />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="wallet-requests" element={<AdminWallet />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="notifications" element={<Notifications />} />
            </Route>

            <Route path="*" element={<div className="flex h-screen items-center justify-center text-2xl font-bold">404 No Encontrado</div>} />
        </Routes>
    );
}
