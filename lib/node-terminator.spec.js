const { NodeTerminator } = require('./node-terminator');
const { JobCounter } = require('./job-counter');

jest.mock('./job-counter', () => ({
  JobCounter: jest.fn(() => ({
    registerJob: jest.fn(),
    hasActiveJobs: jest.fn(),
    activeJobs: jest.fn(),
  })),
}));

describe('NodeTerminator', () => {
  let nodeTerminator;
  let proc;

  beforeEach(() => {
    JobCounter.mockClear();
    nodeTerminator = new NodeTerminator();
    proc = {
      on: jest.spyOn(process, 'on').mockImplementation(() => {}),
      exit: jest.spyOn(process, 'exit').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    Object.values(proc).map(_ => _.mockRestore());
  });

  it('should attach itself to SIGTERM and SIGINT signals', () => {
    nodeTerminator.attach();
    expect(proc.on).toBeCalledWith('SIGTERM', expect.any(Function));
    expect(proc.on).toBeCalledWith('SIGINT', expect.any(Function));
  });

  it('should "exit" process after SIGTERM/SIGINT received', () => {
    const emitTermination = attachNodeTerminator();
    emitTermination();
    expect(proc.exit).toBeCalled();
  });

  it('should call "exit" function (if provided) after SIGTERM/SIGINT received', () => {
    const exit = jest.fn();
    const emitTermination = attachNodeTerminator(exit);
    emitTermination();
    expect(exit).toBeCalled();
  });

  it('should decorate async job (to handle graceful shutdown)', async () => {
    expect.assertions(2);

    const job = jest.fn((...args) => Promise.resolve(args));
    const gracefulJob = nodeTerminator.graceful(job);
    const jobPromise = gracefulJob(1, 2, 3);
    expect(job).toBeCalledWith(1, 2, 3);
    expect(await jobPromise).toEqual([1, 2, 3]);
  });

  it('should "terminate" decorated jobs after SIGTERM/SIGINT received', () => {
    const emitTermination = attachNodeTerminator();
    const job = jest.fn(() => Promise.resolve());
    const gracefulJob = nodeTerminator.graceful(job);
    emitTermination();
    gracefulJob();
    expect(job).not.toBeCalled();
  });

  it('should wait for active jobs to finish before "exit"', async () => {
    expect.assertions(2);

    const exit = jest.fn();
    const emitTermination = attachNodeTerminator(exit);

    const jobCounter = JobCounter.mock.results[0].value;
    jobCounter.hasActiveJobs.mockReturnValue(true);
    let resolveActiveJobs;
    const activeJobs = new Promise((resolve) => {
      resolveActiveJobs = resolve;
    });
    jobCounter.activeJobs.mockReturnValue(activeJobs);
    emitTermination();
    expect(exit).not.toBeCalled();

    jobCounter.hasActiveJobs.mockReturnValue(false);
    resolveActiveJobs();
    await activeJobs;
    expect(exit).toBeCalled();
  });

  function attachNodeTerminator(exit) {
    nodeTerminator.attach(exit);
    const emitTermination = proc.on.mock.calls[0][1]; // Second argument
    return emitTermination;
  }
});
