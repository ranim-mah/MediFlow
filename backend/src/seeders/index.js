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
  // --- Patients & demo data (plusieurs)
  const demoPatients = [
    {
      fullName: 'اسامة جمال عبدالباسط علي',
      email: 'osama@mediflow.test',
      phone: '+21601024242801',
      password: 'patient123',
      preferredLanguage: 'ar',
      gender: 'male',
      age: 35,
      bloodType: 'AB+',
    },
    {
      fullName: 'Ahmed Ben Ali',
      email: 'ahmed@test.com',
      phone: '+21698765432',
      password: 'patient123',
      preferredLanguage: 'fr',
      gender: 'male',
      age: 42,
    },
    {
      fullName: 'Fatma Trabelsi',
      email: 'fatma@mediflow.test',
      phone: '+21622223333',
      password: 'patient123',
      preferredLanguage: 'ar',
      gender: 'female',
      age: 28,
      bloodType: 'O-',
    },
    {
      fullName: 'Sami Kacem',
      email: 'sami@mediflow.test',
      phone: '+21655556666',
      password: 'patient123',
      preferredLanguage: 'fr',
      gender: 'male',
      age: 50,
      bloodType: 'A+',
    },
    {
      fullName: 'Meriem Ben Salah',
      email: 'meriem@mediflow.test',
      phone: '+21677778888',
      password: 'patient123',
      preferredLanguage: 'ar',
      gender: 'female',
      age: 31,
      bloodType: 'B-',
    },
  ];

  const createdPatients = [];
  for (let i = 0; i < demoPatients.length; i++) {
    const p = demoPatients[i];
    const user = await User.create({
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      password: p.password,
      role: ROLES.PATIENT,
      preferredLanguage: p.preferredLanguage,
    });
    const patient = await Patient.create({
      userId: user._id,
      patientCode: `P00${2140 + i}`,
      fullName: p.fullName,
      phone: p.phone,
      email: p.email,
      age: p.age,
      gender: p.gender,
      bloodType: p.bloodType,
      branchId: mainBranch._id,
    });
    createdPatients.push({ user, patient });
  }
  console.log(`🧑 ${createdPatients.length} patients créés`);

  // --- Générer des données pour chaque patient
  const drNader = await Doctor.findOne({ userId: drNaderUser._id });
  for (let i = 0; i < createdPatients.length; i++) {
    const { user: patientUser, patient } = createdPatients[i];
    // Plusieurs rendez-vous (passé, futur, annulé)
    const appts = [
      await Appointment.create({
        patientId: patient._id,
        doctorId: drNader._id,
        serviceId: services[2]._id,
        branchId: mainBranch._id,
        scheduledAt: new Date(Date.now() + (i + 1) * 2 * 24 * 3600 * 1000),
        status: APPOINTMENT_STATUS.PENDING,
        source: 'patient_portal',
      }),
      await Appointment.create({
        patientId: patient._id,
        doctorId: drNader._id,
        serviceId: services[0]._id,
        branchId: mainBranch._id,
        scheduledAt: new Date(Date.now() - (i + 1) * 10 * 24 * 3600 * 1000),
        status: APPOINTMENT_STATUS.COMPLETED,
        source: 'admin',
      }),
      await Appointment.create({
        patientId: patient._id,
        doctorId: drNader._id,
        serviceId: services[1]._id,
        branchId: mainBranch._id,
        scheduledAt: new Date(Date.now() - (i + 1) * 5 * 24 * 3600 * 1000),
        status: APPOINTMENT_STATUS.CANCELLED,
        source: 'admin',
      }),
    ];
    // Visite liée au RDV passé
    const visit = await Visit.create({
      patientId: patient._id,
      doctorId: drNader._id,
      branchId: mainBranch._id,
      serviceId: services[0]._id,
      visitDate: new Date(Date.now() - (i + 1) * 10 * 24 * 3600 * 1000),
      complaint: i % 2 === 0 ? 'ضيق في التنفس' : 'صداع مزمن',
      diagnosis: i % 2 === 0 ? 'فحص دوري — لا توجد علامات خطر' : 'صداع توتري',
      plan: i % 2 === 0 ? 'متابعة بعد شهر' : 'راحة ونوم كاف',
      decision: i % 2 === 0 ? 'لا علاج دوائي مطلوب' : 'باراسيتامول عند الحاجة',
      status: 'completed',
    });
    // Prescription
    await Prescription.create({
      patientId: patient._id,
      doctorId: drNader._id,
      visitId: visit._id,
      branchId: mainBranch._id,
      medications: [
        { name: 'Aspirine', dosage: '100 mg', frequency: '1x/jour', duration: '30 jours', instructions: 'Après le dîner' },
        { name: 'Paracétamol', dosage: '500 mg', frequency: '2x/jour', duration: '10 jours', instructions: 'Si douleur' },
      ],
      notes: 'Contrôle dans 1 mois',
      issuedAt: new Date(Date.now() - (i + 1) * 10 * 24 * 3600 * 1000),
    });
    // Lab test
    await LabTest.create({
      patientId: patient._id,
      doctorId: drNader._id,
      visitId: visit._id,
      branchId: mainBranch._id,
      tests: [{ name: 'CBC' }, { name: 'Glycémie à jeun' }, { name: 'Cholestérol' }],
      status: 'completed',
      resultText: 'Tous les paramètres dans les normes.',
      requestedAt: new Date(Date.now() - (i + 1) * 10 * 24 * 3600 * 1000),
      resultEnteredAt: new Date(Date.now() - (i + 1) * 8 * 24 * 3600 * 1000),
    });
    // Radiology
    await Radiology.create({
      patientId: patient._id,
      doctorId: drNader._id,
      branchId: mainBranch._id,
      exams: [{ name: 'Rx thorax' }, { name: 'Échographie abdominale' }],
      status: 'completed',
      reportText: 'Pas d\'anomalie visible.',
      requestedAt: new Date(Date.now() - (i + 1) * 8 * 24 * 3600 * 1000),
      reportEnteredAt: new Date(Date.now() - (i + 1) * 7 * 24 * 3600 * 1000),
    });
    // Notifications variées
    await Notification.insertMany([
      {
        userId: patientUser._id,
        type: 'appointment_reminder',
        title: 'تذكير بموعدك القادم',
        body: `لديك موعد بعد ${(i + 1) * 2} أيام مع د. نادر الأمين`,
        channels: ['in_app'],
        priority: 'high',
        link: '/portal/appointments',
      },
      {
        userId: patientUser._id,
        type: 'lab_result_ready',
        title: 'نتيجة تحليل جاهزة',
        body: 'نتيجة تحليل CBC متاحة الآن',
        channels: ['in_app', 'push'],
        isRead: i % 2 === 0,
        readAt: i % 2 === 0 ? new Date() : undefined,
      },
      {
        userId: patientUser._id,
        type: 'prescription_ready',
        title: 'روشتة جديدة',
        body: 'تمت إضافة روشتة جديدة إلى ملفك الطبي',
        channels: ['in_app'],
      },
      {
        userId: patientUser._id,
        type: 'visit_summary',
        title: 'ملخص زيارة طبية',
        body: 'تمت إضافة ملخص زيارة جديدة إلى ملفك',
        channels: ['in_app'],
      },
    ]);
    // Queue entry pour le prochain RDV
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await Queue.create({
      appointmentId: appts[0]._id,
      patientId: patient._id,
      doctorId: drNader._id,
      branchId: mainBranch._id,
      queueDate: today,
      queueNumber: i + 1,
      status: 'waiting',
    });
    // Stats patient
    patient.totalVisits = 1;
    patient.totalPrescriptions = 1;
    patient.totalLabTests = 1;
    patient.totalRadiology = 1;
    patient.lastVisitAt = visit.visitDate;
    await patient.save();
  }
  console.log('📊 Données démo enrichies pour tous les patients');

  // --- Notifications pour l'admin
  await Notification.insertMany([
    {
      userId: admin._id,
      type: 'system_alert',
      title: 'Nouvelle version déployée',
      body: 'La version 1.6 de Mediflow est maintenant en ligne.',
      channels: ['in_app'],
      priority: 'medium',
      link: '/admin/dashboard',
    },
    {
      userId: admin._id,
      type: 'user_signup',
      title: 'Nouveau patient inscrit',
      body: 'Un nouveau patient vient de s’inscrire.',
      channels: ['in_app'],
      isRead: false,
      link: '/admin/patients',
    },
    {
      userId: admin._id,
      type: 'doctor_request',
      title: 'Demande de modification de planning',
      body: 'Le Dr. Nader a demandé une modification de son planning.',
      channels: ['in_app'],
      isRead: true,
      readAt: new Date(),
      link: '/admin/requests',
    },
    {
      userId: admin._id,
      type: 'queue_alert',
      title: 'File d’attente saturée',
      body: 'La file d’attente du jour dépasse 10 patients.',
      channels: ['in_app'],
      isRead: false,
      link: '/admin/queue',
    },
  ]);
  console.log('🔔 Notifications de démonstration ajoutées pour l’admin');

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
