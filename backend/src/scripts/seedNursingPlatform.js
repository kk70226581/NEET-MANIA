require('dotenv').config();
const connectDB = require('../config/database');
const curriculum = require('../config/nursingCurriculum');
const { Subject, Chapter, Topic } = require('../models/nursing');

const slugify = value => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function seed() {
  await connectDB();
  let chapterCount = 0;
  let topicCount = 0;

  for (const [subjectSlug, definition] of Object.entries(curriculum)) {
    const subjectPayload = {
        subjectCode: definition.code,
        name: definition.name,
        subjectSlug: slugify(subjectSlug),
        displayOrder: Object.keys(curriculum).indexOf(subjectSlug) + 1,
        description: `${definition.name} syllabus for B.Sc. Nursing entrance preparation`,
        updatedAt: new Date()
      };
    const existingSubject = await Subject.findOne({
      $or: [{ subjectCode: definition.code }, { subjectSlug: subjectPayload.subjectSlug }]
    });
    const subject = existingSubject
      ? await Subject.findByIdAndUpdate(existingSubject._id, subjectPayload, { new: true, runValidators: true })
      : await Subject.create(subjectPayload);

    for (let index = 0; index < definition.chapters.length; index += 1) {
      const chapterName = definition.chapters[index];
      const chapterCode = `${definition.code}-${String(index + 1).padStart(3, '0')}`;
      const chapterPayload = {
          chapterCode,
          subjectId: subject._id,
          classLevel: ['BIO', 'CHE', 'PHY'].includes(definition.code) ? 'General' : 'Skill',
          unitName: definition.name,
          fullChapterName: chapterName,
          chapterSlug: `${slugify(definition.name)}-${slugify(chapterName)}`,
          displayOrder: index + 1,
          shortDescription: `Editable syllabus chapter for ${chapterName}.`,
          learningObjectives: [`Understand and apply the core concepts of ${chapterName}.`],
          targetQuestionCount: 200,
          status: 'active',
          source: 'admin_master_syllabus',
          lastVerifiedAt: new Date(),
          updatedAt: new Date()
        };
      const existingChapter = await Chapter.findOne({
        $or: [{ chapterCode }, { chapterSlug: chapterPayload.chapterSlug }]
      });
      const chapter = existingChapter
        ? await Chapter.findByIdAndUpdate(existingChapter._id, chapterPayload, { new: true, runValidators: true })
        : await Chapter.create(chapterPayload);
      chapterCount += 1;

      const topicName = `Core concepts of ${chapterName}`;
      const topicPayload = {
          topicCode: `${chapterCode}-T01`,
          name: topicName,
          topicSlug: `${chapter.chapterSlug}-core-concepts`,
          chapterId: chapter._id,
          displayOrder: 1,
          learningObjective: `Explain and solve entrance-level questions on ${chapterName}.`,
          targetQuestionCount: 40,
          updatedAt: new Date()
        };
      const existingTopic = await Topic.findOne({
        $or: [{ topicCode: topicPayload.topicCode }, { topicSlug: topicPayload.topicSlug }]
      });
      if (existingTopic) await Topic.findByIdAndUpdate(existingTopic._id, topicPayload, { runValidators: true });
      else await Topic.create(topicPayload);
      topicCount += 1;
    }
  }

  console.log(`Nursing platform taxonomy ready: ${Object.keys(curriculum).length} subjects, ${chapterCount} chapters, ${topicCount} starter topics.`);
  process.exit(0);
}

seed().catch(error => {
  console.error('Nursing taxonomy seed failed:', error);
  process.exit(1);
});
