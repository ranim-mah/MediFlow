const {
  Patient, Appointment, Invoice, Visit, Procedure, User, Service, Doctor,
} = require('../models');
const { asyncHandler } = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS, ROLES } = require('../utils/constants');

/**
 * GET /api/admin/dashboard
 * Returns all stats shown on the admin home (image 10).
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    totalPatients, newPatientsToday, newPatientsThisMonth,
    todayAppointments, upcomingAppointments,
    todayRevenue, monthRevenue, monthInvoicesCount,
    recentInvoices, recentProcedures, topServices,
  ] = await Promise.all([
    Patient.countDocuments({}),
    Patient.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
    Patient.countDocuments({ createdAt: { $gte: monthStart, $lt: nextMonthStart } }),
    Appointment.countDocuments({ scheduledAt: { $gte: todayStart, $lte: todayEnd } }),
    Appointment.countDocuments({
      scheduledAt: { $gte: now },
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED] },
    }),
    sumInvoicesPaid({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
    sumInvoicesPaid({ createdAt: { $gte: monthStart, $lt: nextMonthStart } }),
    Invoice.countDocuments({ createdAt: { $gte: monthStart, $lt: nextMonthStart } }),
    Invoice.find().sort({ createdAt: -1 }).limit(5).populate('patientId', 'fullName patientCode'),
    Procedure.find().sort({ performedAt: -1 }).limit(5).populate('patientId', 'fullName'),
    Appointment.aggregate([
      { $match: { createdAt: { $gte: monthStart }, serviceId: { $ne: null } } },
      { $group: { _id: '$serviceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
    ]),
  ]);

  // Monthly chart data: counts per day for services, operations, new patients
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const chart = await buildMonthlyChart(monthStart, nextMonthStart, days);

  res.json({
    success: true,
    data: {
      cards: {
        totalPatients,
        newPatientsToday,
        newPatientsThisMonth,
        todayAppointments,
        upcomingAppointments,
        todayRevenue,
        monthRevenue,
        monthInvoicesCount,
      },
      chart,
      recentInvoices,
      recentProcedures,
      topServices: topServices.map((s) => ({
        _id: s._id,
        count: s.count,
        name: s.service.name,
        code: s.service.code,
      })),
    },
  });
});

const sumInvoicesPaid = async (filter) => {
  const agg = await Invoice.aggregate([
    { $match: filter },
    { $group: { _id: null, total: { $sum: '$amountPaid' } } },
  ]);
  return agg[0]?.total || 0;
};

const buildMonthlyChart = async (from, to, days) => {
  const [services, procedures, patients] = await Promise.all([
    Appointment.aggregate([
      { $match: { createdAt: { $gte: from, $lt: to } } },
      { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
    ]),
    Procedure.aggregate([
      { $match: { performedAt: { $gte: from, $lt: to } } },
      { $group: { _id: { $dayOfMonth: '$performedAt' }, count: { $sum: 1 } } },
    ]),
    Patient.aggregate([
      { $match: { createdAt: { $gte: from, $lt: to } } },
      { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
    ]),
  ]);

  const result = [];
  for (let d = 1; d <= days; d++) {
    result.push({
      day: d,
      services: services.find((s) => s._id === d)?.count || 0,
      procedures: procedures.find((p) => p._id === d)?.count || 0,
      newPatients: patients.find((p) => p._id === d)?.count || 0,
    });
  }
  return result;
};