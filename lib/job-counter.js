class JobCounter {
  constructor() {
    this.jobs = new Set();
  }

  hasActiveJobs() {
    return this.jobs.size > 0;
  }

  get activeJobs() {
    return Promise.all([...this.jobs]);
  }

  /**
   * @param {Promise<*>} jobPromise
   */
  registerJob(jobPromise) {
    this.jobs.add(jobPromise);
    const unregister = () => this.jobs.delete(jobPromise);
    jobPromise.then(unregister, unregister);
  }
}

module.exports = { JobCounter };
