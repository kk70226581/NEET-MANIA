const { ExamSource, ContentCollectionJob, SourceRegistry } = require('../../models/nursing');

const domainFromUrl = value => {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ''); }
  catch { return null; }
};

class NursingScraperService {
  /**
   * Audit configured sources against the explicit allowlist.
   * This method intentionally does not fabricate events or scrape page content.
   * A real fetch/extraction connector can consume only the returned approved sources.
   */
  static async collectOfficialContent() {
    const job = await ContentCollectionJob.create({
      jobName: 'Approved Source Registry Audit',
      startedAt: new Date(),
      status: 'running'
    });

    try {
      const [configured, approved] = await Promise.all([
        ExamSource.find({ status: 'active' }).populate('exam'),
        SourceRegistry.find({ active: true, permissionStatus: 'APPROVED' }).lean()
      ]);
      const allowedDomains = new Set(approved.map(source => source.domain));
      const eligible = [];

      for (const source of configured) {
        const domain = domainFromUrl(source.url);
        if (!domain || !allowedDomains.has(domain)) {
          job.errorLogs.push(`Skipped ${source.sourceName}: domain is not APPROVED in the source registry.`);
          continue;
        }
        eligible.push(source);
        source.lastChecked = new Date();
        await source.save();
      }

      job.status = 'completed';
      job.recordsFound = eligible.length;
      job.recordsUpdated = 0;
      job.completedAt = new Date();
      await job.save();
      return { job, approvedSources: eligible };
    } catch (error) {
      job.status = 'failed';
      job.errorLogs.push(error.message);
      job.completedAt = new Date();
      await job.save();
      throw error;
    }
  }
}

module.exports = NursingScraperService;
