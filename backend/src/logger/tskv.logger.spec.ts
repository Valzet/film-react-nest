import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
  });

  it('formatMessage -> TSKV line', () => {
    const line = logger.formatMessage('log', 'hello');

    expect(line.endsWith('\n')).toBe(true);
    expect(line).toMatch(/^level=log\tmessage=hello\n$/);
  });

  it('log() -> stdout.write', () => {
    const spy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);

    logger.log('hi');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(String(spy.mock.calls[0][0])).toContain('message=hi');

    spy.mockRestore();
  });
});
