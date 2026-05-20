import studentRouter from './components/roles/student/student.router.js'
import issueRouter from './components/issues/issues.router.js'
import wardenRouter from './components/roles/warden/warden.router.js'
import workerRouter from './components/roles/worker/worker.router.js'
import authRouter from './components/auth/auth.router.js'
import hostelRouter from './components/organisation/hostel/hostel.router.js'
import superAdminRouter from './components/roles/superAdmin/superAdmin.router.js'
import roomRouter from './components/organisation/room/room.router.js'
import bedRouter from './components/organisation/bed/bed.router.js'


const routesInit = (app) => {
    app.use('/api/v1/auth', authRouter);

    app.use('/api/v1/student', studentRouter);
    app.use('/api/v1/warden', wardenRouter);
    app.use('/api/v1/worker', workerRouter);
    app.use('/api/v1/superadmin', superAdminRouter);

    app.use('/api/v1/hostel', hostelRouter);
    app.use('/api/v1/room', roomRouter);
    app.use('/api/v1/bed', bedRouter);

    app.use('/api/v1/issue', issueRouter);
}
export default routesInit;