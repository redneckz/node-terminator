const { JobCounter } = require('./job-counter');

describe('JobCounter', () => {
  let jobCounter;

  beforeEach(() => {
    jobCounter = new JobCounter();
  });

  it('should aggregate all registered jobs (basic scenario)', async () => {
    expect.assertions(1);
    jobCounter.registerJob(Promise.resolve(123));
    jobCounter.registerJob(Promise.resolve(456));
    expect(await jobCounter.activeJobs).toEqual([123, 456]);
  });

  it('should fail if at least one registered job fail', () => {
    jobCounter.registerJob(Promise.reject(new Error('123')));
    jobCounter.registerJob(Promise.resolve(456));
    return expect(jobCounter.activeJobs).rejects.toThrow('123');
  });

  it('should track active jobs count (advanced scenario)', async () => {
    expect.assertions(2);
    let resolveFirstJob;
    const firstJob = new Promise((resolve) => { resolveFirstJob = resolve; });
    jobCounter.registerJob(firstJob);
    let resolveSecondJob;
    const secondJob = new Promise((resolve) => { resolveSecondJob = resolve; });
    jobCounter.registerJob(secondJob);
    resolveFirstJob();
    await firstJob;
    expect(jobCounter.hasActiveJobs()).toBe(true);
    resolveSecondJob();
    await secondJob;
    expect(jobCounter.hasActiveJobs()).toBe(false);
  });

  it('should be "empty" just after the instantiation', async () => {
    expect.assertions(2);
    expect(jobCounter.hasActiveJobs()).toBe(false);
    expect(await jobCounter.activeJobs).toEqual([]);
  });
});
