require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { ROLES } = require('../utils/constants');
const {
  User, Branch, Service, Patient, Doctor, Staff,
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
