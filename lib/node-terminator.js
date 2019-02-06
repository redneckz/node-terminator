const { JobCounter } = require('./job-counter');

class NodeTerminator {
  constructor() {
    this.jobCounter = new JobCounter();
    this.terminating = false;
  }

  /**
   * @param {Function} exit
   */
  attach(exit = () => process.exit()) {
    const handleTermination = () => this.terminate(exit);
    process.on('SIGTERM', handleTermination);
    process.on('SIGINT', handleTermination);
  }

  graceful(job) {
    return (...args) => {
      if (this.terminating) {
        return Promise.resolve();
      }
      const jobPromise = job(...args);
      this.jobCounter.registerJob(jobPromise);
      return jobPromise;
    };
  }

  /**
   * @private
   * @param {Function} exit
   */
  async terminate(exit) {
    this.terminating = true;
    if (this.jobCounter.hasActiveJobs()) {
      await this.jobCounter.activeJobs;
    }
    exit();
  }
}

module.exports = { NodeTerminator };
