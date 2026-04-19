require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { ROLES, APPOINTMENT_STATUS } = require('../utils/constants');
const {
  User, Branch, Service, Patient, Doctor, Staff,
  Appointment, Visit, Prescription, LabTest, Radiology, Notification, Queue,
} = require('../models');

const run = async () => {
  await connectDB();
  console.log('\n🌱 Début du seeding...\n');

  // --- Clean existing data
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Service.deleteMany({}),
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Staff.deleteMany({}),
    Appointment.deleteMany({}),
    Visit.deleteMany({}),
    Prescription.deleteMany({}),
    LabTest.deleteMany({}),
    Radiology.deleteMany({}),
    Notification.deleteMany({}),
    Queue.deleteMany({}),
  ]);
  console.log('🧹 Collections nettoyées');

  // --- Branches
  const mainBranch = await Branch.create({
    name: 'الفرع الرئيسي',
    code: 'MAIN',
    address: 'Avenue Habib Bourguiba',
    city: 'Tunis',
    phone: '+216 71 000 000',
    workingHours: '9h - 18h',
    isMain: true,
  });
  console.log('🏢 Succursale créée :', mainBranch.name);

  // --- Services (from Mediflow screenshots)
  const services = await Service.insertMany([
    { name: { ar: 'كشف طبي عام', fr: 'Consultation générale', en: 'General consultation' }, code: 'GEN', price: 200, defaultDuration: 30, icon: '🩺' },
    { name: { ar: 'استشارة طبية', fr: 'Consultation médicale', en: 'Medical consultation' }, code: 'CONS', price: 150, defaultDuration: 20, icon: '💬' },
    { name: { ar: 'رسم قلب', fr: 'ECG', en: 'ECG' }, code: 'ECG', price: 100, defaultDuration: 15, icon: '❤️' },
    { name: { ar: 'سونار', fr: 'Échographie', en: 'Ultrasound' }, code: 'US', price: 250, defaultDuration: 30, icon: '🔊' },
    { name: { ar: 'سكر', fr: 'Test glycémie', en: 'Glucose test' }, code: 'GLU', price: 50, defaultDuration: 10, icon: '💉' },
    { name: { ar: 'غيار', fr: 'Pansement', en: 'Dressing change' }, code: 'DRES', price: 80, defaultDuration: 15, icon: '🩹' },
  ]);
  console.log(`💼 ${services.length} services créés`);

  // --- Admin
  const admin = await User.create({
    fullName: 'Admin Mediflow',
    email: 'admin@mediflow.test',
    phone: '+21600000001',
    password: 'admin123',
    role: ROLES.ADMIN,
    preferredLanguage: 'ar',
    branchId: mainBranch._id,
    emailVerified: true,
  });
  console.log('👑 Admin :', admin.email);

  // --- Doctors
  const drNaderUser = await User.create({
    fullName: 'دكتور نادر الأمين',
    email: 'dr.nader@mediflow.test',
    phone: '+21600000002',
    password: 'doctor123',
    role: ROLES.DOCTOR,
    branchId: mainBranch._id,
  });
  await Doctor.create({
    userId: drNaderUser._id,
    specialty: 'أمراض القلب',
    licenseNumber: 'DR-001',
    serviceIds: [services[2]._id, services[0]._id], // ECG + General
    branchIds: [mainBranch._id],
    commissionType: 'percent',
    commissionValue: 30,
    schedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDuration: 30, branchId: mainBranch._id },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', slotDuration: 30, branchId: mainBranch._id },
    ],
  });

  const drAlaaUser = await User.create({
    fullName: 'د. علاء أحمد',
    email: 'dr.alaa@mediflow.test',
    phone: '+21600000003',
    password: 'doctor123',
    role: ROLES.DOCTOR,
    branchId: mainBranch._id,
  });
  await Doctor.create({
    userId: drAlaaUser._id,
    specialty: 'طب عام',
    licenseNumber: 'DR-002',
    serviceIds: [services[0]._id, services[1]._id],
    branchIds: [mainBranch._id],
    commissionType: 'percent',
    commissionValue: 25,
  });
  console.log('👨‍⚕️ 2 médecins créés');

  // --- Staff (reception + assistant)
  const receptionUser = await User.create({
    fullName: 'Sarra Réception',
    email: 'reception@mediflow.test',
    phone: '+21600000004',
    password: 'reception123',
    role: ROLES.RECEPTION,
    branchId: mainBranch._id,
  });
  await Staff.create({
    userId: receptionUser._id,
    jobTitle: 'استقبال',
    role: ROLES.RECEPTION,
    branchIds: [mainBranch._id],
  });

  const assistantUser = await User.create({
    fullName: 'طارق محمد أحمد',
    email: 'assistant@mediflow.test',
    phone: '+21600000005',
    password: 'assistant123',
    role: ROLES.ASSISTANT,
    branchId: mainBranch._id,
  });
  await Staff.create({
    userId: assistantUser._id,
    jobTitle: 'طبيب مساعد',
    role: ROLES.ASSISTANT,
    branchIds: [mainBranch._id],
    commissionType: 'percent',
    commissionValue: 5,
  });
  console.log('👥 Staff créé (réception + assistant)');

  // --- Patients (demo)
  const patient1User = await User.create({
    fullName: 'اسامة جمال عبدالباسط علي',
    email: 'osama@mediflow.test',
    phone: '+21601024242801',
    password: 'patient123',
    role: ROLES.PATIENT,
    preferredLanguage: 'ar',
  });
  await Patient.create({
    userId: patient1User._id,
    patientCode: 'P002140',
    fullName: 'اسامة جمال عبدالباسط علي',
    phone: '01024242801',
    email: 'osama@mediflow.test',
    age: 35,
    gender: 'male',
    bloodType: 'AB+',
    branchId: mainBranch._id,
  });

  const patient2User = await User.create({
    fullName: 'Ahmed Ben Ali',
    email: 'ahmed@test.com',
    phone: '+21698765432',
    password: 'patient123',
    role: ROLES.PATIENT,
    preferredLanguage: 'fr',
  });
  await Patient.create({
    userId: patient2User._id,
    patientCode: 'P002141',
    fullName: 'Ahmed Ben Ali',
    phone: '+21698765432',
    email: 'ahmed@test.com',
    age: 42,
    gender: 'male',
    branchId: mainBranch._id,
  });
  console.log('🧑 2 patients créés');

  // --- Demo data for patient 1 (so the portal is not empty)
  const patient1 = await Patient.findOne({ patientCode: 'P002140' });
  const drNader = await Doctor.findOne({ userId: drNaderUser._id });

  // Upcoming appointment (in 3 days)
  const nextAppt = await Appointment.create({
    patientId: patient1._id,
    doctorId: drNader._id,
    serviceId: services[2]._id, // ECG
    branchId: mainBranch._id,
    scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000),
    status: APPOINTMENT_STATUS.PENDING,
    source: 'patient_portal',
  });

  // Past appointment (1 month ago, completed)
  await Appointment.create({
    patientId: patient1._id,
    doctorId: drNader._id,
    serviceId: services[0]._id,
    branchId: mainBranch._id,
    scheduledAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    status: APPOINTMENT_STATUS.COMPLETED,
    source: 'admin',
  });

  // Past visit
  const visit = await Visit.create({
    patientId: patient1._id,
    doctorId: drNader._id,
    branchId: mainBranch._id,
    serviceId: services[0]._id,
    visitDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    complaint: 'ضيق في التنفس',
    diagnosis: 'فحص دوري — لا توجد علامات خطر',
    plan: 'متابعة بعد شهر',
    decision: 'لا علاج دوائي مطلوب',
    status: 'completed',
  });

  // Prescription
  await Prescription.create({
    patientId: patient1._id,
    doctorId: drNader._id,
    visitId: visit._id,
    branchId: mainBranch._id,
    medications: [
      { name: 'Aspirine', dosage: '100 mg', frequency: '1x/jour', duration: '30 jours', instructions: 'Après le dîner' },
    ],
    notes: 'Contrôle dans 1 mois',
    issuedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
  });

  // Lab test
  await LabTest.create({
    patientId: patient1._id,
    doctorId: drNader._id,
    visitId: visit._id,
    branchId: mainBranch._id,
    tests: [{ name: 'CBC' }, { name: 'Glycémie à jeun' }],
    status: 'completed',
    resultText: 'Tous les paramètres dans les normes.',
    requestedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
    resultEnteredAt: new Date(Date.now() - 25 * 24 * 3600 * 1000),
  });

  // Radiology
  await Radiology.create({
    patientId: patient1._id,
    doctorId: drNader._id,
    branchId: mainBranch._id,
    exams: [{ name: 'Rx thorax' }],
    status: 'completed',
    reportText: 'Pas d\'anomalie visible.',
    requestedAt: new Date(Date.now() - 25 * 24 * 3600 * 1000),
    reportEnteredAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
  });

  // Notifications
  await Notification.insertMany([
    {
      userId: patient1User._id,
      type: 'appointment_reminder',
      title: 'تذكير بموعدك القادم',
      body: 'لديك موعد بعد 3 أيام مع د. نادر الأمين',
      channels: ['in_app'],
      priority: 'high',
      link: '/portal/appointments',
    },
    {
      userId: patient1User._id,
      type: 'lab_result_ready',
      title: 'نتيجة تحليل جاهزة',
      body: 'نتيجة تحليل CBC متاحة الآن',
      channels: ['in_app', 'push'],
      isRead: true,
      readAt: new Date(),
    },
    {
      userId: patient1User._id,
      type: 'prescription_ready',
      title: 'روشتة جديدة',
      body: 'تمت إضافة روشتة جديدة إلى ملفك الطبي',
      channels: ['in_app'],
    },
  ]);

  // Queue entry for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await Queue.create({
    appointmentId: nextAppt._id,
    patientId: patient1._id,
    doctorId: drNader._id,
    branchId: mainBranch._id,
    queueDate: today,
    queueNumber: 1,
    status: 'waiting',
  });

  // Update patient stats
  patient1.totalVisits = 1;
  patient1.totalPrescriptions = 1;
  patient1.totalLabTests = 1;
  patient1.totalRadiology = 1;
  patient1.lastVisitAt = visit.visitDate;
  await patient1.save();

  console.log('📊 Données démo créées pour le patient 1 (RDV, visite, ordonnance, labo, radio, notifs, queue)');

  console.log('\n✅ Seeding terminé ! Identifiants de test :\n');
  console.log('  Admin       → admin@mediflow.test        / admin123');
  console.log('  Doctor 1    → dr.nader@mediflow.test     / doctor123');
  console.log('  Doctor 2    → dr.alaa@mediflow.test      / doctor123');
  console.log('  Reception   → reception@mediflow.test    / reception123');
  console.log('  Assistant   → assistant@mediflow.test    / assistant123');
  console.log('  Patient 1   → osama@mediflow.test        / patient123');
  console.log('  Patient 2   → ahmed@test.com             / patient123\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seeder a échoué :', err);
  process.exit(1);
});
