import { assert } from 'chai';
import * as sinon from 'sinon';
import { getAutocompletion } from '../autocomplete';
import { Log } from '../../widgets/log';

describe('#autocomplete', () => {
  let log = ({
    addMessage: () => {},
  } as unknown) as Log;
  let addMessageSpy: sinon.SinonSpy<[string], void>;

  beforeEach(() => {
    addMessageSpy = sinon.spy(log, 'addMessage');
  });

  afterEach(() => {
    addMessageSpy.restore();
  });

  it('should no autocomplete if there are no options', () => {
    const text = 'text';
    const options: string[] = [];
    const result = getAutocompletion(log, text, options);
    assert.equal(result.text, text);
    assert.isFalse(!!result.exact);
    assert.isFalse(addMessageSpy.called);
  });

  it('should no autocomplete if there are no matches', () => {
    const text = 'text';
    const options: string[] = ['options', 'dont', 'match'];
    const result = getAutocompletion(log, text, options);
    assert.equal(result.text, text);
    assert.isFalse(!!result.exact);
    assert.isFalse(addMessageSpy.called);
  });

  it('should show all options if there is no text', () => {
    const text = '';
    const options: string[] = ['options', 'dont', 'match'];
    const result = getAutocompletion(log, text, options);
    assert.equal(result.text, text);
    assert.isFalse(!!result.exact);
    assert.isTrue(addMessageSpy.calledWithExactly('options dont match'));
  });

  it('should show only the matching options', () => {
    const text = 'm';
    const options: string[] = ['match1', 'match2', 'notMatch'];
    const result = getAutocompletion(log, text, options);
    assert.equal(result.text, 'match');
    assert.isFalse(!!result.exact);
    assert.isTrue(addMessageSpy.calledWithExactly('match1 match2'));
  });

  it('should autocomplete when exact', () => {
    const text = 'on';
    const options: string[] = ['onlyMatch', 'notMatch1', 'notMatch2'];
    const result = getAutocompletion(log, text, options);
    assert.equal(result.text, 'onlyMatch');
    assert.isTrue(!!result.exact);
    assert.isFalse(addMessageSpy.called);
  });
});
