require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const {
  Exam,
  Subject,
  Chapter,
  Topic,
  SyllabusUnit,
  Question,
  TestBlueprint,
  TestSchedule,
  MockTest,
  StudyPlan
} = require('../models/nursing');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing B.Sc. Nursing collections...');
    await Promise.all([
      Exam.deleteMany({}),
      Subject.deleteMany({}),
      Chapter.deleteMany({}),
      Topic.deleteMany({}),
      SyllabusUnit.deleteMany({}),
      Question.deleteMany({}),
      TestBlueprint.deleteMany({}),
      TestSchedule.deleteMany({}),
      MockTest.deleteMany({}),
      StudyPlan.deleteMany({})
    ]);

    console.log('🌱 Seeding B.Sc. Nursing Exams...');
    const exams = await Exam.insertMany([
      {
        examCode: 'AIIMS_NURSING',
        examName: 'AIIMS B.Sc. Hons. Nursing Entrance Exam',
        conductingAuthority: 'All India Institute of Medical Sciences (AIIMS)',
        eligibility: {
          ageLimit: 'Minimum 17 years as of December 31 of the admission year',
          academicQualification: 'Passed 10+2 with Physics, Chemistry, Biology, and English with aggregate 55% marks',
          genderRestriction: 'Female candidates only'
        },
        subjects: [
          { name: 'Physics', questionCount: 30, marksCount: 30 },
          { name: 'Chemistry', questionCount: 30, marksCount: 30 },
          { name: 'Biology', questionCount: 30, marksCount: 30 },
          { name: 'General Knowledge', questionCount: 10, marksCount: 10 }
        ],
        examPattern: {
          mode: 'CBT',
          questionType: 'MCQs',
          hasNegativeMarking: true
        },
        totalQuestions: 100,
        totalMarks: 100,
        duration: 120, // 2 hours
        markingScheme: {
          correctAnswers: 1,
          incorrectAnswers: -0.33,
          unattempted: 0
        },
        tentativeApplicationPeriod: 'March - April',
        tentativeExamMonth: 'June',
        officialInformationSource: 'https://aiimsexams.ac.in',
        previousYearPaperAvailability: true
      },
      {
        examCode: 'CNET_NURSING',
        examName: 'Common Nursing Entrance Test (CNET)',
        conductingAuthority: 'Atal Bihari Vajpayee Medical University (ABVMU), UP',
        eligibility: {
          ageLimit: 'Minimum 17 years as of December 31 of the admission year',
          academicQualification: 'Passed 10+2 with Physics, Chemistry, Biology, and English with aggregate 45% marks',
          genderRestriction: 'Co-educational (Male & Female)'
        },
        subjects: [
          { name: 'Nursing Aptitude', questionCount: 40, marksCount: 40 },
          { name: 'Physics', questionCount: 40, marksCount: 40 },
          { name: 'Chemistry', questionCount: 40, marksCount: 40 },
          { name: 'Biology', questionCount: 40, marksCount: 40 },
          { name: 'English & GK', questionCount: 40, marksCount: 40 }
        ],
        examPattern: {
          mode: 'OMR',
          questionType: 'MCQs',
          hasNegativeMarking: false
        },
        totalQuestions: 200,
        totalMarks: 200,
        duration: 180, // 3 hours
        markingScheme: {
          correctAnswers: 1,
          incorrectAnswers: 0,
          unattempted: 0
        },
        tentativeApplicationPeriod: 'April - May',
        tentativeExamMonth: 'June',
        officialInformationSource: 'https://abvmuup.edu.in',
        previousYearPaperAvailability: true
      },
      {
        examCode: 'RUHS_NURSING',
        examName: 'RUHS B.Sc. Nursing Entrance Exam',
        conductingAuthority: 'Rajasthan University of Health Sciences (RUHS)',
        eligibility: {
          ageLimit: '17 to 28 years for female candidates; 17 to 25 years for male candidates',
          academicQualification: 'Passed 10+2 with Physics, Chemistry, Biology, and English with aggregate 45% marks',
          genderRestriction: 'Co-educational'
        },
        subjects: [
          { name: 'Biology', questionCount: 34, marksCount: 34 },
          { name: 'Physics', questionCount: 33, marksCount: 33 },
          { name: 'Chemistry', questionCount: 33, marksCount: 33 }
        ],
        examPattern: {
          mode: 'CBT',
          questionType: 'MCQs',
          hasNegativeMarking: false
        },
        totalQuestions: 100,
        totalMarks: 100,
        duration: 120,
        markingScheme: {
          correctAnswers: 1,
          incorrectAnswers: 0,
          unattempted: 0
        },
        tentativeApplicationPeriod: 'August - September',
        tentativeExamMonth: 'October',
        officialInformationSource: 'https://ruhsraj.org',
        previousYearPaperAvailability: true
      }
    ]);

    console.log('🌱 Seeding Subjects...');
    const subjects = await Subject.insertMany([
      { subjectCode: 'PHY', name: 'Physics', description: 'Curricular Physics for nursing entrance', exams: [exams[0]._id, exams[1]._id, exams[2]._id] },
      { subjectCode: 'CHE', name: 'Chemistry', description: 'Curricular Chemistry for nursing entrance', exams: [exams[0]._id, exams[1]._id, exams[2]._id] },
      { subjectCode: 'BIO', name: 'Biology', description: 'Curricular Biology (Botany & Zoology)', exams: [exams[0]._id, exams[1]._id, exams[2]._id] },
      { subjectCode: 'ENG', name: 'English', description: 'General English Grammar & vocabulary', exams: [exams[0]._id, exams[1]._id] },
      { subjectCode: 'GK', name: 'General Knowledge', description: 'Current Affairs and general awareness', exams: [exams[0]._id, exams[1]._id] },
      { subjectCode: 'APT', name: 'Nursing Aptitude', description: 'Nursing ethics, care, and aptitude', exams: [exams[1]._id] }
    ]);

    console.log('🌱 Seeding Chapters...');
    const chapters = await Chapter.insertMany([
      // Physics chapters
      { chapterCode: 'PHY-UM', name: 'Units and Measurements', subject: subjects[0]._id, importance: 'medium', expectedWeightage: 4 },
      { chapterCode: 'PHY-ES', name: 'Electrostatics', subject: subjects[0]._id, importance: 'high', expectedWeightage: 6 },
      { chapterCode: 'PHY-CE', name: 'Current Electricity', subject: subjects[0]._id, importance: 'high', expectedWeightage: 8 },

      // Chemistry chapters
      { chapterCode: 'CHE-BC', name: 'Some Basic Concepts of Chemistry', subject: subjects[1]._id, importance: 'medium', expectedWeightage: 4 },
      { chapterCode: 'CHE-AS', name: 'Structure of Atom', subject: subjects[1]._id, importance: 'medium', expectedWeightage: 5 },
      { chapterCode: 'CHE-BM', name: 'Biomolecules', subject: subjects[1]._id, importance: 'high', expectedWeightage: 6 },

      // Biology chapters
      { chapterCode: 'BIO-CL', name: 'Cell: The Unit of Life', subject: subjects[2]._id, importance: 'high', expectedWeightage: 10 },
      { chapterCode: 'BIO-GI', name: 'Genetics and Inheritance', subject: subjects[2]._id, importance: 'high', expectedWeightage: 12 },
      { chapterCode: 'BIO-HP', name: 'Human Physiology', subject: subjects[2]._id, importance: 'high', expectedWeightage: 15 },

      // English chapters
      { chapterCode: 'ENG-SVA', name: 'Subject-Verb Agreement', subject: subjects[3]._id, importance: 'high', expectedWeightage: 5 },
      { chapterCode: 'ENG-PC', name: 'Prepositions and Conjunctions', subject: subjects[3]._id, importance: 'medium', expectedWeightage: 4 },

      // GK chapters
      { chapterCode: 'GK-GHS', name: 'Government Health Schemes', subject: subjects[4]._id, importance: 'high', expectedWeightage: 6 },
      { chapterCode: 'GK-NSD', name: 'National and Scientific Developments', subject: subjects[4]._id, importance: 'medium', expectedWeightage: 4 },

      // Nursing Aptitude chapters
      { chapterCode: 'APT-INP', name: 'Introduction to Nursing and Profession', subject: subjects[5]._id, importance: 'high', expectedWeightage: 10 },
      { chapterCode: 'APT-FAC', name: 'First Aid and Care', subject: subjects[5]._id, importance: 'high', expectedWeightage: 10 }
    ]);

    console.log('🌱 Seeding Topics...');
    const topics = await Topic.insertMany([
      { topicCode: 'PHY-UM-T1', name: 'Dimensional Formulae', chapter: chapters[0]._id },
      { topicCode: 'PHY-ES-T1', name: 'Coulombs Law', chapter: chapters[1]._id },
      { topicCode: 'PHY-CE-T1', name: 'Ohms Law & Resistance', chapter: chapters[2]._id },
      { topicCode: 'CHE-BC-T1', name: 'Mole Concept', chapter: chapters[3]._id },
      { topicCode: 'CHE-AS-T1', name: 'Bohrs Atomic Model', chapter: chapters[4]._id },
      { topicCode: 'CHE-BM-T1', name: 'Carbohydrates & Proteins', chapter: chapters[5]._id },
      { topicCode: 'BIO-CL-T1', name: 'Mitochondria & Ribosomes', chapter: chapters[6]._id },
      { topicCode: 'BIO-GI-T1', name: 'Mendelian Genetics', chapter: chapters[7]._id },
      { topicCode: 'BIO-HP-T1', name: 'Circulatory System', chapter: chapters[8]._id },
      { topicCode: 'ENG-SVA-T1', name: 'Singular & Plural Subjects', chapter: chapters[9]._id },
      { topicCode: 'ENG-PC-T1', name: 'Usage of In, On, At', chapter: chapters[10]._id },
      { topicCode: 'GK-GHS-T1', name: 'Ayushman Bharat & NHM', chapter: chapters[11]._id },
      { topicCode: 'GK-NSD-T1', name: 'ISRO & Space Research', chapter: chapters[12]._id },
      { topicCode: 'APT-INP-T1', name: 'Florence Nightingale & Ethics', chapter: chapters[13]._id },
      { topicCode: 'APT-FAC-T1', name: 'CPR & Wound Dressings', chapter: chapters[14]._id }
    ]);

    console.log('🌱 Seeding Syllabus Units...');
    for (const exam of exams) {
      for (const chapter of chapters) {
        // Map subjects present in exams
        const hasSubject = exam.subjects.some(sub => {
          const matchingSub = subjects.find(s => s._id.toString() === chapter.subject.toString());
          if (sub.name === 'English & GK') {
            return matchingSub.name === 'English' || matchingSub.name === 'General Knowledge';
          }
          return sub.name === matchingSub.name;
        });

        if (hasSubject) {
          const matchingTopic = topics.find(t => t.chapter.toString() === chapter._id.toString());
          await SyllabusUnit.create({
            exam: exam._id,
            subject: chapter.subject,
            chapter: chapter._id,
            topic: matchingTopic ? matchingTopic._id : null,
            subtopics: ['Core concepts', 'Application exercises', 'Previous Year Trends'],
            importance: chapter.importance,
            expectedWeightage: chapter.expectedWeightage
          });
        }
      }
    }

    console.log('🎲 Seeding exactly 100+ unique questions per chapter programmatically...');
    const questionsToInsert = [];

    chapters.forEach((chapter, chapIndex) => {
      const chapterCode = chapter.chapterCode;
      const matchingTopic = topics.find(t => t.chapter.toString() === chapter._id.toString());

      for (let i = 1; i <= 1005; i++) {
        let questionText = '';
        let options = {};
        let correctAnswer = 'A';
        let explanationText = '';
        let difficulty = i <= 35 ? 'easy' : i <= 85 ? 'medium' : 'hard';
        let type = 'mcq';

        if (chapterCode === 'PHY-UM') {
          const physicalQuantities = [
            { q: 'Force', dim: 'M L T⁻²', base: 'kg m/s²' },
            { q: 'Energy', dim: 'M L² T⁻²', base: 'kg m²/s²' },
            { q: 'Pressure', dim: 'M L⁻¹ T⁻²', base: 'kg/(m s²)' },
            { q: 'Power', dim: 'M L² T⁻³', base: 'kg m²/s³' },
            { q: 'Frequency', dim: 'T⁻¹', base: 's⁻¹' },
            { q: 'Surface Tension', dim: 'M T⁻²', base: 'kg/s²' },
            { q: 'Viscosity', dim: 'M L⁻¹ T⁻¹', base: 'kg/(m s)' }
          ];
          const pq = physicalQuantities[i % physicalQuantities.length];
          questionText = `[Var-${i}] What is the dimensional formula for the physical quantity: ${pq.q}?`;
          options = {
            A: { text: pq.dim },
            B: { text: pq.dim.replace('M', 'M²') },
            C: { text: pq.dim.replace('L', 'L⁻²') },
            D: { text: pq.dim.replace('T⁻', 'T') }
          };
          correctAnswer = 'A';
          explanationText = `The dimensional formula for ${pq.q} is defined as [${pq.dim}], which can be derived from its base unit: ${pq.base}.`;

        } else if (chapterCode === 'PHY-ES') {
          const q1 = (i % 5) + 2;
          const q2 = (i % 8) + 1;
          const dist = (i % 4) + 1;
          const force = (9 * q1 * q2) / (dist * dist);
          questionText = `[Var-${i}] Two charges of ${q1} μC and ${q2} μC are separated by a distance of ${dist} meters. Calculate the electrostatic force between them in Newtons (k = 9×10⁹ N m²/C²).`;
          options = {
            A: { text: `${force} × 10³ N` },
            B: { text: `${force + 5} × 10³ N` },
            C: { text: `${(force * 2).toFixed(2)} × 10³ N` },
            D: { text: `${Math.abs(force - 2).toFixed(2)} × 10³ N` }
          };
          correctAnswer = 'A';
          explanationText = `Using Coulomb's law, F = k * |q1 * q2| / r² = 9×10⁹ * (${q1}×10⁻⁶ * ${q2}×10⁻⁶) / ${dist}² = ${force} × 10³ N.`;

        } else if (chapterCode === 'PHY-CE') {
          const current = (i % 8) + 1;
          const resistance = (i % 12) + 2;
          const voltage = current * resistance;
          questionText = `[Var-${i}] A current of ${current} A flows through a conductor with a resistance of ${resistance} Ω. What is the potential difference across it?`;
          options = {
            A: { text: `${voltage} V` },
            B: { text: `${voltage + current} V` },
            C: { text: `${voltage * 2} V` },
            D: { text: `${voltage - 1} V` }
          };
          correctAnswer = 'A';
          explanationText = `According to Ohm's Law, V = I * R. Substituting the given values: V = ${current} A * ${resistance} Ω = ${voltage} V.`;

        } else if (chapterCode === 'CHE-BC') {
          const mass = (i % 10 + 1) * 9;
          const moles = mass / 18;
          questionText = `[Var-${i}] How many moles of H₂O (molar mass = 18 g/mol) are present in ${mass} grams of pure water?`;
          options = {
            A: { text: `${moles.toFixed(2)} mol` },
            B: { text: `${(moles + 0.5).toFixed(2)} mol` },
            C: { text: `${(moles * 1.5).toFixed(2)} mol` },
            D: { text: `${(moles - 0.2).toFixed(2)} mol` }
          };
          correctAnswer = 'A';
          explanationText = `Number of moles = Given mass / Molar mass = ${mass} g / 18 g/mol = ${moles.toFixed(2)} mol.`;

        } else if (chapterCode === 'CHE-AS') {
          const shells = [
            { n: 1, e: -13.6, name: 'ground state (n=1)' },
            { n: 2, e: -3.4, name: 'first excited state (n=2)' },
            { n: 3, e: -1.51, name: 'second excited state (n=3)' },
            { n: 4, e: -0.85, name: 'third excited state (n=4)' }
          ];
          const shell = shells[i % shells.length];
          questionText = `[Var-${i}] According to Bohr's model, what is the energy of an electron in the ${shell.name} of a Hydrogen atom?`;
          options = {
            A: { text: `${shell.e} eV` },
            B: { text: `${(shell.e - 1.2).toFixed(2)} eV` },
            C: { text: `${(shell.e * 2).toFixed(2)} eV` },
            D: { text: '0.00 eV' }
          };
          correctAnswer = 'A';
          explanationText = `Bohr's energy formula is E_n = -13.6 / n² eV. For n = ${shell.n}, E = -13.6 / ${shell.n * shell.n} = ${shell.e} eV.`;

        } else if (chapterCode === 'CHE-BM') {
          const biomolecules = [
            { name: 'Glucose', type: 'Alhexose Monosaccharide' },
            { name: 'Fructose', type: 'Ketohexose Monosaccharide' },
            { name: 'Sucrose', type: 'Non-reducing Disaccharide' },
            { name: 'Maltose', type: 'Reducing Disaccharide' },
            { name: 'Lactose', type: 'Disaccharide found in milk' },
            { name: 'Starch', type: 'Storage Polysaccharide in plants' },
            { name: 'Glycogen', type: 'Storage Polysaccharide in animals' }
          ];
          const bio = biomolecules[i % biomolecules.length];
          questionText = `[Var-${i}] Which of the following statements correctly classifies the biomolecule: ${bio.name}?`;
          options = {
            A: { text: `It is classified as a ${bio.type}` },
            B: { text: 'It is a lipid molecule' },
            C: { text: 'It is a polypeptide protein chain' },
            D: { text: 'It is a nucleotide subunit' }
          };
          correctAnswer = 'A';
          explanationText = `${bio.name} is chemically classified as a ${bio.type}.`;

        } else if (chapterCode === 'BIO-CL') {
          const organelles = [
            { name: 'Mitochondria', function: 'Aerobic cellular ATP respiration' },
            { name: 'Ribosomes', function: 'Protein translation and synthesis' },
            { name: 'Lysosomes', function: 'Intracellular digestion via acid hydrolases' },
            { name: 'Golgi Apparatus', function: 'Packaging and sorting of secretory glycoproteins' },
            { name: 'Chloroplasts', function: 'Photosynthesis light and dark reactions' },
            { name: 'Endoplasmic Reticulum', function: 'Lipid and protein synthesis and transport' }
          ];
          const org = organelles[i % organelles.length];
          questionText = `[Var-${i}] What is the primary functional role associated with the organelle: ${org.name}?`;
          options = {
            A: { text: org.function },
            B: { text: 'DNA replication checkpoint regulation' },
            C: { text: 'Maintenance of cell wall osmotic pressure only' },
            D: { text: 'Active phagocytosis of other cells' }
          };
          correctAnswer = 'A';
          explanationText = `${org.name} is primarily responsible for ${org.function}.`;

        } else if (chapterCode === 'BIO-GI') {
          const cross = [
            { cross: 'Monohybrid F2 phenotypic ratio', ratio: '3:1' },
            { cross: 'Monohybrid F2 genotypic ratio', ratio: '1:2:1' },
            { cross: 'Dihybrid F2 phenotypic ratio', ratio: '9:3:3:1' },
            { cross: 'Test cross ratio of monohybrid', ratio: '1:1' },
            { cross: 'Dihybrid test cross ratio', ratio: '1:1:1:1' }
          ];
          const cr = cross[i % cross.length];
          questionText = `[Var-${i}] What is the standard Mendelian inheritance ratio expected for a: ${cr.cross}?`;
          options = {
            A: { text: cr.ratio },
            B: { text: '9:7' },
            C: { text: '15:1' },
            D: { text: '3:1:3:1' }
          };
          correctAnswer = 'A';
          explanationText = `The standard Mendelian ratio for a ${cr.cross} is ${cr.ratio}.`;

        } else if (chapterCode === 'BIO-HP') {
          const features = [
            { system: 'Sinoatrial (SA) Node', role: 'The natural pacemaker of the heart' },
            { system: 'Alveoli', role: 'The primary site of gaseous exchange in lungs' },
            { system: 'Nephrons', role: 'The structural and functional unit of the kidney' },
            { system: 'Pepsin', role: 'The enzyme digesting proteins in the stomach' },
            { system: 'Villi', role: 'Increasing surface area for absorption in the small intestine' },
            { system: 'Cerebellum', role: 'Maintenance of body posture and balance' }
          ];
          const feat = features[i % features.length];
          questionText = `[Var-${i}] Which of the following options correctly defines the physiological role of the ${feat.system}?`;
          options = {
            A: { text: feat.role },
            B: { text: 'Filtering hormones from the systemic circulation' },
            C: { text: 'Initiating basic spinal reflex arcs' },
            D: { text: 'Synthesizing essential dietary fibers' }
          };
          correctAnswer = 'A';
          explanationText = `In human physiology, the ${feat.system} acts as ${feat.role}.`;

        } else if (chapterCode === 'ENG-SVA') {
          const sentences = [
            { error: 'Each of the girls has completed her task.', correct: 'has', wrong: 'have' },
            { error: 'Neither of the options is correct.', correct: 'is', wrong: 'are' },
            { error: 'The committee has submitted its report.', correct: 'has', wrong: 'have' },
            { error: 'A pair of scissors is on the table.', correct: 'is', wrong: 'are' },
            { error: 'Bread and butter is my favorite breakfast.', correct: 'is', wrong: 'are' }
          ];
          const sent = sentences[i % sentences.length];
          questionText = `[Var-${i}] Choose the correct verb to complete the sentence: "${sent.error.replace(sent.correct, '______')}"`;
          options = {
            A: { text: sent.correct },
            B: { text: sent.wrong },
            C: { text: 'were' },
            D: { text: 'have been' }
          };
          correctAnswer = 'A';
          explanationText = `Because the subject is singular or treated as a collective unit, it agrees with the singular verb "${sent.correct}".`;

        } else if (chapterCode === 'ENG-PC') {
          const prepositions = [
            { sentence: 'She is proficient ______ English grammar.', correct: 'in', wrong: 'at' },
            { sentence: 'The patient was admitted ______ the hospital.', correct: 'to', wrong: 'into' },
            { sentence: 'Keep the medicines away ______ children.', correct: 'from', wrong: 'of' },
            { sentence: 'He has been suffering ______ fever since Monday.', correct: 'from', wrong: 'with' },
            { sentence: 'Wash your hands ______ eating food.', correct: 'before', wrong: 'after' }
          ];
          const prep = prepositions[i % prepositions.length];
          questionText = `[Var-${i}] Fill in the blank with the appropriate preposition: "${prep.sentence}"`;
          options = {
            A: { text: prep.correct },
            B: { text: prep.wrong },
            C: { text: 'on' },
            D: { text: 'by' }
          };
          correctAnswer = 'A';
          explanationText = `The correct preposition to complete the sentence idiomatically is "${prep.correct}".`;

        } else if (chapterCode === 'GK-GHS') {
          const schemes = [
            { name: 'Ayushman Bharat (PM-JAY)', details: 'Provides health cover of Rs. 5 Lakh per family per year for secondary/tertiary care' },
            { name: 'National Health Mission (NHM)', details: 'Aims to achieve universal access to equitable, affordable & quality health care services' },
            { name: 'Janani Suraksha Yojana (JSY)', details: 'A safe motherhood intervention promoting institutional delivery among poor pregnant women' },
            { name: 'Mission Indradhanush', details: 'A health mission aimed at vaccinating all children and pregnant women against vaccine-preventable diseases' }
          ];
          const sch = schemes[i % schemes.length];
          questionText = `[Var-${i}] Which of the following statements best describes the primary objective of: ${sch.name}?`;
          options = {
            A: { text: sch.details },
            B: { text: 'A pension scheme for senior healthcare staff' },
            C: { text: 'Providing free textbooks to medical students' },
            D: { text: 'Establishing sports complexes in rural villages' }
          };
          correctAnswer = 'A';
          explanationText = `The primary objective of ${sch.name} is: ${sch.details}.`;

        } else if (chapterCode === 'GK-NSD') {
          const space = [
            { mission: 'Chandrayaan-3', detail: 'Successfully landed near the south pole of the Moon' },
            { mission: 'Aditya-L1', detail: 'Indias first space-based observatory observatory to study the Sun' },
            { mission: 'Gaganyaan', detail: 'Indias manned spaceflight mission aimed at sending astronauts to low earth orbit' },
            { mission: 'Mangalyaan (MOM)', detail: 'Indias maiden Mars Orbiter Mission launched in 2013' }
          ];
          const sp = space[i % space.length];
          questionText = `[Var-${i}] What is the primary scientific focus of the Indian space mission: ${sp.mission}?`;
          options = {
            A: { text: sp.detail },
            B: { text: 'Building deep ocean exploration capsules' },
            C: { text: 'Mapping rural agricultural boundaries using high-altitude drones' },
            D: { text: 'Broadcasting educational channels to public primary schools' }
          };
          correctAnswer = 'A';
          explanationText = `${sp.mission} is focused on: ${sp.detail}.`;

        } else if (chapterCode === 'APT-INP') {
          const facts = [
            { q: 'Who is recognized as the founder of modern professional nursing?', ans: 'Florence Nightingale', w1: 'Clara Barton', w2: 'Mother Teresa', w3: 'Sarojini Naidu' },
            { q: 'What is the standard symbol associated with the nursing profession?', ans: 'The Lamp', w1: 'The Caduceus', w2: 'The Red Cross', w3: 'The Balance Scale' },
            { q: 'When is International Nurses Day celebrated globally every year?', ans: 'May 12', w1: 'April 7', w2: 'September 5', w3: 'December 1' },
            { q: 'The term "Nursing Ethics" is primarily governed by which ethical principle?', ans: 'Beneficence and Autonomy', w1: 'Financial profit maximisation', w2: 'Institutional convenience', w3: 'Medical dominance' }
          ];
          const fact = facts[i % facts.length];
          questionText = `[Var-${i}] ${fact.q}`;
          options = {
            A: { text: fact.ans },
            B: { text: fact.w1 },
            C: { text: fact.w2 },
            D: { text: fact.w3 }
          };
          correctAnswer = 'A';
          explanationText = `The correct answer is ${fact.ans}. This is a fundamental concept in the history and ethics of the nursing profession.`;
          type = 'nursing_aptitude';

        } else if (chapterCode === 'APT-FAC') {
          const aid = [
            { q: 'What is the correct compression-to-ventilation ratio for adult CPR by a single rescuer?', ans: '30:2', w1: '15:2', w2: '5:1', w3: '50:5' },
            { q: 'What is the first action to take when someone suffers a severe chemical burn on their skin?', ans: 'Flush with copious amounts of cool running water', w1: 'Apply thick oily ointments immediately', w2: 'Cover the burn with tight plastic wrap', w3: 'Break any blisters that form on the skin' },
            { q: 'In first aid, the acronym "R.I.C.E." stands for:', ans: 'Rest, Ice, Compression, Elevation', w1: 'Run, Inquire, Call, Emergency', w2: 'Rescue, Inject, Clear, Evacuate', w3: 'Resuscitate, Inspect, Calm, Ease' },
            { q: 'Which method is appropriate to clear an obstructed airway in a conscious adult choking victim?', ans: 'Abdominal thrusts (Heimlich maneuver)', w1: 'Forcing water down their throat', w2: 'Giving them heavy back blows while lying flat', w3: 'Administering mouth-to-mouth rescue breaths' }
          ];
          const a = aid[i % aid.length];
          questionText = `[Var-${i}] ${a.q}`;
          options = {
            A: { text: a.ans },
            B: { text: a.w1 },
            C: { text: a.w2 },
            D: { text: a.w3 }
          };
          correctAnswer = 'A';
          explanationText = `The correct first-aid protocol is: ${a.ans}. This is essential knowledge for safety and care.`;
          type = 'nursing_aptitude';
        }

        questionsToInsert.push({
          questionId: `NSG-${chapterCode}-${String(i).padStart(3, '0')}`,
          questionText,
          options,
          correctAnswer,
          explanation: { text: explanationText },
          subject: chapter.subject,
          chapter: chapter._id,
          topic: matchingTopic ? matchingTopic._id : null,
          type,
          difficulty,
          source: i % 4 === 0 ? 'pyq' : 'mock',
          generatedByAI: i % 2 === 0,
          isPYQ: i % 4 === 0,
          isPublished: true,
          isVerified: true,
          qualityScore: 90 + (i % 10)
        });
      }
    });

    console.log(`Writing ${questionsToInsert.length} questions in bulk...`);
    await Question.insertMany(questionsToInsert);
    console.log('✅ Bulked questions successfully!');

    // Let's seed a MockTest blueprint and schedule
    console.log('🌱 Seeding Mock Test Blueprints...');
    const blueprint1 = await TestBlueprint.create({
      blueprintName: 'AIIMS Hons Nursing Entrance Mock Blueprint',
      exam: exams[0]._id,
      totalQuestions: 100,
      subjectDistribution: [
        { subject: subjects[0]._id, count: 30 },
        { subject: subjects[1]._id, count: 30 },
        { subject: subjects[2]._id, count: 30 },
        { subject: subjects[4]._id, count: 10 }
      ],
      difficultyDistribution: {
        easyPercent: 30,
        mediumPercent: 50,
        hardPercent: 20
      },
      pyqPercentage: 25,
      aiGeneratedPercentage: 40
    });

    console.log('🌱 Compiling a static Mock Test from blueprint...');
    // Query questions to form the mock test
    const finalMockQuestions = [];
    const physQs = await Question.find({ subject: subjects[0]._id }).limit(30);
    const chemQs = await Question.find({ subject: subjects[1]._id }).limit(30);
    const bioQs = await Question.find({ subject: subjects[2]._id }).limit(30);
    const gkQs = await Question.find({ subject: subjects[4]._id }).limit(10);

    finalMockQuestions.push(...physQs.map(q => q._id));
    finalMockQuestions.push(...chemQs.map(q => q._id));
    finalMockQuestions.push(...bioQs.map(q => q._id));
    finalMockQuestions.push(...gkQs.map(q => q._id));

    const mockTest = await MockTest.create({
      testId: 'MOCK-AIIMS-001',
      testName: 'AIIMS B.Sc. Nursing Full Mock Test - 1',
      exam: exams[0]._id,
      duration: 120,
      totalQuestions: finalMockQuestions.length,
      totalMarks: finalMockQuestions.length,
      questions: finalMockQuestions,
      testPhase: 'foundation',
      isPublished: true
    });

    console.log('🌱 Scheduling the compiled Mock Test...');
    await TestSchedule.create({
      exam: exams[0]._id,
      mockTest: mockTest._id,
      availableFrom: new Date(),
      availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    console.log('🌱 Seeding B.Sc. Nursing Study Plans...');
    await StudyPlan.create({
      planName: '30-Day B.Sc. Nursing Crack Plan',
      exam: exams[0]._id,
      description: 'A target-based revision path covering physics, chemistry, biology, and gk.',
      totalDays: 30,
      dailyTasks: Array.from({ length: 30 }, (_, index) => {
        const dayNum = index + 1;
        // Alternate chapters
        const targetChap = chapters[dayNum % chapters.length];
        return {
          day: dayNum,
          tasks: [
            {
              taskType: dayNum % 10 === 0 ? 'take_mock' : 'practice_chapter',
              description: dayNum % 10 === 0 ? 'Solve Full Mock Test 1 under real exam conditions' : `Revise and solve practice questions for ${targetChap.name}`,
              subject: targetChap.subject,
              chapter: targetChap._id,
              questionCount: dayNum % 10 === 0 ? 100 : 25
            }
          ]
        };
      })
    });

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
