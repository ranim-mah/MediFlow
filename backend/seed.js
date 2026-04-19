/**
 * Seed script — MediFlow Tunisie
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const {
  User, Branch, Service, Doctor, Patient,
  Appointment, Visit, Prescription, LabTest,
} = require('./src/models');

// ─── helpers ────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

const setHour = (date, h, m = 0) => {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

const tuniPhone = (i) => {
  const prefixes = ['20', '21', '22', '25', '50', '52', '53', '55', '90', '92', '94', '97', '98'];
  const p = prefixes[i % prefixes.length];
  const n = String(1000000 + i * 31337).slice(-6);
  return `+216 ${p} ${n.slice(0, 3)} ${n.slice(3)}`;
};

// ─── data ────────────────────────────────────────────────────────────────────

const CITIES = ['تونس العاصمة', 'صفاقس', 'سوسة', 'بنزرت', 'المنستير', 'نابل', 'القيروان', 'قابس', 'بجة', 'الكاف'];

const MALE_NAMES = [
  'محمد الأمين بن علي', 'أحمد حمزة المرزوقي', 'علي بوعزيزي', 'خالد الغربي',
  'كريم بن صالح', 'يوسف العيادي', 'سامي الهمامي', 'بلال التريكي',
  'عمر بن يوسف', 'حمزة الشابي', 'زياد القيراني', 'هيثم الجلاصي',
  'وليد بن عمر', 'طارق بن حسن', 'أنس العجيمي',
];

const FEMALE_NAMES = [
  'فاطمة الزهراء بوعزيزي', 'مريم المرزوقي', 'سامية بن علي', 'ليلى الغربي',
  'نور الهدى بن صالح', 'آية العيادي', 'رانيا الهمامي', 'سلمى التريكي',
  'إيمان بن يوسف', 'هاجر الشابي', 'دنيا القيراني', 'نهى الجلاصي',
  'أسماء بن عمر', 'حنان بن حسن', 'زينب العجيمي',
];

const ALL_NAMES = [...MALE_NAMES, ...FEMALE_NAMES];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CHRONIC = ['ضغط الدم', 'السكري', 'أمراض القلب', 'الربو', 'القصور الكلوي'];
const ALLERGIES = ['البنسلين', 'الأسبرين', 'الغلوتين', 'حبوب اللقاح', 'لا يوجد'];

const HOURS = [8, 9, 10, 11, 14, 15, 16, 17];

const COMPLAINTS = [
  'ألم في الصدر منذ يومين',
  'صداع مستمر وارتفاع في الحرارة',
  'آلام في المفاصل والتعب العام',
  'اضطرابات في الهضم وغثيان',
  'دوخة وضغط منخفض',
  'سعال جاف مستمر منذ أسبوع',
  'ألم في البطن الجانب الأيمن',
  'أرق وتوتر وقلق',
  'حرقة في المعدة بعد الأكل',
  'تنميل في الأطراف السفلية',
];

const DIAGNOSES = [
  'التهاب الشعب الهوائية الحاد',
  'ارتفاع ضغط الدم الأولي',
  'قرحة المعدة',
  'التهاب المفاصل التنكسي',
  'القلق والإجهاد النفسي',
  'نقص فيتامين D',
  'التهاب الجيوب الأنفية',
  'عسر الهضم الوظيفي',
  'الصداع النصفي',
  'التهاب الحلق البكتيري',
];

const PLANS = [
  'مضاد حيوي لمدة 7 أيام مع مسكن الألم',
  'حمية غذائية وخفض الملح مع مراقبة الضغط',
  'مثبطات مضخة البروتون لمدة شهر',
  'مضادات الالتهاب وجلسات العلاج الطبيعي',
  'مهدئات خفيفة وتمارين الاسترخاء',
  'مكملات فيتامين D وأشعة شمس منتظمة',
  'غسيل أنفي وبخاخات موضعية',
  'تعديل النظام الغذائي وتجنب المهيجات',
  'مسكن الصداع عند الحاجة والنوم المنتظم',
  'مضاد حيوي مع مضمضة بالماء والملح',
];

const DECISIONS = [
  'متابعة بعد أسبوعين',
  'إعادة الفحص بعد شهر مع تحليل شامل',
  'إحالة لطبيب متخصص إذا لم يتحسن',
  'متابعة قياس الضغط يومياً في المنزل',
  'العودة عند الحاجة',
  'تحليل دم شامل بعد أسبوع',
  'متابعة أسبوعية لمدة شهر',
  'راجع في حال تفاقم الأعراض',
  'متابعة مع طبيب الأعصاب',
  'انتهت الجلسة بنجاح لا تحتاج متابعة',
];

// ─── main ────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // clear
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Service.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Visit.deleteMany({}),
    Prescription.deleteMany({}),
    LabTest.deleteMany({}),
  ]);
  console.log('🗑️  Collections cleared');

  // ── Branch ────────────────────────────────────────────────────────────────
  const branch = await Branch.create({
    name: 'الفرع الرئيسي',
    code: 'TN-MAIN',
    address: 'شارع الحبيب بورقيبة',
    city: 'تونس العاصمة',
    phone: '+216 71 234 567',
    email: 'contact@mediflow.tn',
    workingHours: 'الأحد - الجمعة: 8:00 - 19:00',
    isMain: true,
  });
  console.log('🏥 Branch created');

  // ── Services ──────────────────────────────────────────────────────────────
  const services = await Service.insertMany([
    { name: { ar: 'كشف طبي عام', fr: 'Consultation générale', en: 'General checkup' }, code: 'GEN', price: 50, currency: 'DT', defaultDuration: 20, icon: '🩺', isPublic: true },
    { name: { ar: 'استشارة طبية', fr: 'Consultation médicale', en: 'Medical consultation' }, code: 'CONSULT', price: 70, currency: 'DT', defaultDuration: 30, icon: '💬', isPublic: true },
    { name: { ar: 'رسم قلب - ECG', fr: 'Électrocardiogramme', en: 'ECG' }, code: 'ECG', price: 30, currency: 'DT', defaultDuration: 15, icon: '❤️', isPublic: true },
    { name: { ar: 'سونار', fr: 'Échographie', en: 'Ultrasound' }, code: 'SONO', price: 60, currency: 'DT', defaultDuration: 20, icon: '📡', isPublic: true },
    { name: { ar: 'تحليل السكر', fr: 'Glycémie', en: 'Blood sugar test' }, code: 'SUGAR', price: 20, currency: 'DT', defaultDuration: 10, icon: '🩸', isPublic: true },
    { name: { ar: 'غيار وتضميد', fr: 'Pansement', en: 'Wound dressing' }, code: 'DRESS', price: 25, currency: 'DT', defaultDuration: 15, icon: '🩹', isPublic: true },
  ]);
  console.log('🛎️  Services created');

  // ── Staff ─────────────────────────────────────────────────────────────────
  await User.create([
    { fullName: 'مدير النظام', email: 'admin@mediflow.tn', phone: '+216 71 100 001', password: 'Admin2024!', role: 'admin', branchId: branch._id },
    { fullName: 'موظف الاستقبال', email: 'reception@mediflow.tn', phone: '+216 71 100 002', password: 'Recep2024!', role: 'reception', branchId: branch._id },
    { fullName: 'المساعد الطبي', email: 'assistant@mediflow.tn', phone: '+216 71 100 003', password: 'Assis2024!', role: 'assistant', branchId: branch._id },
  ]);
  console.log('👷 Staff created');

  // ── Doctors ───────────────────────────────────────────────────────────────
  const doctorData = [
    { name: 'د. أحمد بن علي', email: 'dr.ahmed@mediflow.tn', phone: '+216 71 200 001', specialty: 'طب عام', commission: 30 },
    { name: 'د. فاطمة المرزوقي', email: 'dr.fatima@mediflow.tn', phone: '+216 71 200 002', specialty: 'أمراض القلب', commission: 35 },
    { name: 'د. محمد التريكي', email: 'dr.mohamed@mediflow.tn', phone: '+216 71 200 003', specialty: 'طب الأطفال', commission: 30 },
    { name: 'د. سامية بوعزيزي', email: 'dr.samia@mediflow.tn', phone: '+216 71 200 004', specialty: 'أمراض العيون', commission: 35 },
    { name: 'د. كريم الغربي', email: 'dr.karim@mediflow.tn', phone: '+216 71 200 005', specialty: 'أمراض الجهاز الهضمي', commission: 30 },
  ];

  const doctors = [];
  for (const d of doctorData) {
    const user = await User.create({
      fullName: d.name,
      email: d.email,
      phone: d.phone,
      password: 'Dr2024!',
      role: 'doctor',
      branchId: branch._id,
    });
    const doc = await Doctor.create({
      userId: user._id,
      specialty: d.specialty,
      serviceIds: services.map((s) => s._id),
      branchIds: [branch._id],
      commissionType: 'percent',
      commissionValue: d.commission,
      isActive: true,
      schedule: [1, 2, 3, 4, 0].map((day) => ({
        dayOfWeek: day,
        startTime: '08:30',
        endTime: '18:00',
        slotDuration: 20,
        branchId: branch._id,
      })),
    });
    doctors.push({ user, doc });
  }
  console.log('👨‍⚕️ Doctors created');

  // ── Patients ──────────────────────────────────────────────────────────────
  const patients = [];
  let pCode = 1001;

  for (let i = 0; i < 30; i++) {
    const isMale = i < 15;
    const name = ALL_NAMES[i];
    const phone = tuniPhone(i + 10);
    const email = `patient${i + 1}@test.tn`;
    const city = pick(CITIES);
    const age = 20 + Math.floor(Math.random() * 55);
    const isChronic = i % 5 === 0;
    const isHighRisk = i % 8 === 0;

    const user = await User.create({
      fullName: name,
      email,
      phone,
      password: 'Patient2024!',
      role: 'patient',
      branchId: branch._id,
    });

    const patient = await Patient.create({
      userId: user._id,
      patientCode: String(pCode++),
      fullName: name,
      phone,
      email,
      age,
      gender: isMale ? 'male' : 'female',
      bloodType: pick(BLOOD_TYPES),
      address: `${city}، تونس`,
      allergies: isChronic ? [pick(ALLERGIES)] : [],
      chronicConditions: isChronic ? [pick(CHRONIC)] : [],
      isChronic,
      isHighRisk,
      flags: isHighRisk ? ['حساسية', 'مزمن'] : isChronic ? ['مزمن'] : [],
      healthSummary: isChronic ? `مريض مزمن — ${pick(CHRONIC)}. يحتاج متابعة دورية.` : '',
      branchId: branch._id,
    });

    patients.push({ user, patient });
  }
  console.log('🧑‍🤝‍🧑 Patients created');

  // ── Appointments ──────────────────────────────────────────────────────────
  const appointments = [];
  const SOURCES = ['admin', 'patient_portal', 'public_site', 'phone', 'walk_in'];

  // Past completed (35)
  for (let i = 0; i < 35; i++) {
    const p = patients[i % patients.length];
    const doc = doctors[i % doctors.length];
    const daysBack = 5 + Math.floor(Math.random() * 85);
    const h = pick(HOURS);
    const scheduledAt = setHour(daysAgo(daysBack), h);
    const completedAt = new Date(scheduledAt.getTime() + 25 * 60000);

    const appt = await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: pick(services)._id,
      branchId: branch._id,
      scheduledAt,
      durationMinutes: 20,
      status: 'completed',
      source: pick(SOURCES),
      queueNumber: (i % 15) + 1,
      checkedInAt: scheduledAt,
      startedAt: scheduledAt,
      completedAt,
    });
    appointments.push(appt);
  }

  // Past cancelled (5)
  for (let i = 0; i < 5; i++) {
    const p = patients[(i + 5) % patients.length];
    const doc = doctors[i % doctors.length];
    const daysBack = 3 + i * 10;
    const scheduledAt = setHour(daysAgo(daysBack), pick(HOURS));
    await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: pick(services)._id,
      branchId: branch._id,
      scheduledAt,
      status: 'cancelled',
      source: pick(SOURCES),
      cancelledAt: daysAgo(daysBack - 1),
      cancelReason: pick(['تعارض في الوقت', 'سفر', 'تحسن الحالة', 'ظروف عائلية']),
    });
  }

  // Past no_show (2)
  for (let i = 0; i < 2; i++) {
    const p = patients[(i + 10) % patients.length];
    const doc = doctors[i % doctors.length];
    await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: pick(services)._id,
      branchId: branch._id,
      scheduledAt: setHour(daysAgo(7 + i * 5), pick(HOURS)),
      status: 'no_show',
      source: 'admin',
    });
  }

  // Today in_progress (2)
  for (let i = 0; i < 2; i++) {
    const p = patients[(i + 15) % patients.length];
    const doc = doctors[i % doctors.length];
    const scheduledAt = setHour(new Date(), 9 + i);
    await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: services[i]._id,
      branchId: branch._id,
      scheduledAt,
      status: 'in_progress',
      source: 'admin',
      queueNumber: i + 1,
      checkedInAt: scheduledAt,
      startedAt: scheduledAt,
    });
  }

  // Today waiting (3)
  for (let i = 0; i < 3; i++) {
    const p = patients[(i + 18) % patients.length];
    const doc = doctors[(i + 1) % doctors.length];
    const scheduledAt = setHour(new Date(), 10 + i);
    await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: pick(services)._id,
      branchId: branch._id,
      scheduledAt,
      status: 'waiting',
      source: pick(SOURCES),
      queueNumber: i + 3,
      checkedInAt: new Date(),
    });
  }

  // Today confirmed (2)
  for (let i = 0; i < 2; i++) {
    const p = patients[(i + 22) % patients.length];
    const doc = doctors[(i + 2) % doctors.length];
    await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: pick(services)._id,
      branchId: branch._id,
      scheduledAt: setHour(new Date(), 14 + i),
      status: 'confirmed',
      source: 'patient_portal',
    });
  }

  // Upcoming pending (8)
  for (let i = 0; i < 8; i++) {
    const p = patients[(i + 5) % patients.length];
    const doc = doctors[i % doctors.length];
    await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: pick(services)._id,
      branchId: branch._id,
      scheduledAt: setHour(daysFromNow(i + 1), pick(HOURS)),
      status: 'pending',
      source: pick(['patient_portal', 'public_site', 'phone']),
    });
  }

  // Upcoming confirmed (4)
  for (let i = 0; i < 4; i++) {
    const p = patients[(i + 12) % patients.length];
    const doc = doctors[(i + 1) % doctors.length];
    await Appointment.create({
      patientId: p.patient._id,
      doctorId: doc.doc._id,
      serviceId: pick(services)._id,
      branchId: branch._id,
      scheduledAt: setHour(daysFromNow(i + 3), pick(HOURS)),
      status: 'confirmed',
      source: 'admin',
    });
  }

  console.log('📅 Appointments created');

  // ── Visits (for completed appointments) ───────────────────────────────────
  const completedAppts = appointments.slice(0, 20);
  let visitsCreated = 0;

  for (let i = 0; i < completedAppts.length; i++) {
    const appt = completedAppts[i];
    const idx = i % COMPLAINTS.length;

    const visit = await Visit.create({
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      appointmentId: appt._id,
      branchId: branch._id,
      serviceId: appt.serviceId,
      visitDate: appt.scheduledAt,
      status: 'completed',
      complaint: COMPLAINTS[idx],
      diagnosis: DIAGNOSES[idx],
      plan: PLANS[idx],
      decision: DECISIONS[idx],
      vitals: {
        bloodPressure: `${110 + (i % 4) * 10}/${70 + (i % 3) * 5}`,
        heartRate: 65 + (i % 20),
        temperature: 36.5 + (i % 3) * 0.3,
        weight: 55 + (i % 40),
      },
      startedAt: appt.scheduledAt,
      endedAt: appt.completedAt,
      durationMinutes: 20,
    });

    // Update appointment with visitId
    await Appointment.findByIdAndUpdate(appt._id, { visitId: visit._id });

    // Update patient stats
    await Patient.findByIdAndUpdate(appt.patientId, {
      $inc: { totalVisits: 1 },
      $set: { lastVisitAt: appt.scheduledAt },
    });

    // Some prescriptions
    if (i % 3 === 0) {
      const rx = await Prescription.create({
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        visitId: visit._id,
        branchId: branch._id,
        issuedAt: appt.scheduledAt,
        medications: [
          {
            name: pick(['أموكسيسيلين 500mg', 'إيبوبروفين 400mg', 'أوميبرازول 20mg', 'باراسيتامول 1g', 'سيتيريزين 10mg']),
            dosage: pick(['قرص واحد', 'قرصان', 'نصف قرص']),
            frequency: pick(['مرتان يومياً', 'ثلاث مرات يومياً', 'مرة واحدة يومياً']),
            duration: pick(['7 أيام', '10 أيام', 'شهر كامل']),
            instructions: pick(['بعد الأكل', 'قبل النوم', 'على معدة فارغة']),
          },
        ],
      });
      await Visit.findByIdAndUpdate(visit._id, { $push: { prescriptionIds: rx._id } });
      await Patient.findByIdAndUpdate(appt.patientId, { $inc: { totalPrescriptions: 1 } });
    }

    // Some lab tests
    if (i % 4 === 0) {
      const lab = await LabTest.create({
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        visitId: visit._id,
        branchId: branch._id,
        requestedAt: appt.scheduledAt,
        status: 'completed',
        tests: [
          { name: pick(['تحليل دم شامل (NFS)', 'تحليل البول', 'سكر الصيام', 'وظائف الكبد', 'وظائف الكلى']), code: 'LAB', notes: '' },
        ],
        resultText: 'النتائج ضمن المعدل الطبيعي',
        resultEnteredAt: new Date(appt.scheduledAt.getTime() + 2 * 24 * 60 * 60000),
      });
      await Visit.findByIdAndUpdate(visit._id, { $push: { labTestIds: lab._id } });
      await Patient.findByIdAndUpdate(appt.patientId, { $inc: { totalLabTests: 1 } });
    }

    visitsCreated++;
  }

  console.log(`📋 ${visitsCreated} Visits + prescriptions + labs created`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('✅  SEED TERMINÉ');
  console.log('══════════════════════════════════════════');
  console.log('\n🔐 Comptes demo :');
  console.log('   Admin     : admin@mediflow.tn      / Admin2024!');
  console.log('   Réception : reception@mediflow.tn  / Recep2024!');
  console.log('   Assistant : assistant@mediflow.tn  / Assis2024!');
  console.log('   Médecins  : dr.ahmed@mediflow.tn   / Dr2024!');
  console.log('             : dr.fatima@mediflow.tn  / Dr2024!');
  console.log('             : dr.karim@mediflow.tn   / Dr2024!');
  console.log('   Patient   : patient1@test.tn       / Patient2024!');
  console.log('             : patient2@test.tn       / Patient2024!');
  console.log('\n📊 Données créées :');
  console.log('   1 Branche — 6 Services — 3 Staff');
  console.log('   5 Médecins — 30 Patients');
  console.log('   ~60 Rendez-vous — 20 Visites');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
