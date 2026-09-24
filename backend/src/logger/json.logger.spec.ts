import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
  });

  it('formatMessage is JSON', () => {
    const parsed = JSON.parse(logger.formatMessage('log', 'hello', 'ctx'));

    expect(parsed).toEqual({
      level: 'log',
      message: 'hello',
      optionalParams: ['ctx'],
    });
  });

  it('log to console.log', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    logger.log('hi');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(spy.mock.calls[0][0]))).toMatchObject({
      level: 'log',
      message: 'hi',
    });

    spy.mockRestore();
  });
});
