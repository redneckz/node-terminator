const { NodeTerminator } = require('./node-terminator');

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
    nodeTerminator.attach();
    const emitTermination = proc.on.mock.calls[0][1]; // Second argument
    emitTermination();
    expect(proc.exit).toBeCalled();
  });

  it('should call "exit" function (if provided) after SIGTERM/SIGINT received', () => {
    const exit = jest.fn();
    nodeTerminator.attach(exit);
    const emitTermination = proc.on.mock.calls[0][1]; // Second argument
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
    nodeTerminator.attach();
    const emitTermination = proc.on.mock.calls[0][1]; // Second argument
    const job = jest.fn(() => Promise.resolve());
    const gracefulJob = nodeTerminator.graceful(job);
    emitTermination();
    gracefulJob();
    expect(job).not.toBeCalled();
  });

  // TODO A lot of cases should be covered
});
