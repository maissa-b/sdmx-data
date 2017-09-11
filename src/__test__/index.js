import should from 'should';
import axios from 'axios';

import config from '../../config';
import run from '../run';

const { describe, it } = global;

describe('Pong test', () => {
  it('Should be equal to pong', (done) => {
    run({ config }).then(() => axios.get('http://localhost:3004/ping'))
      .then(({ data: { ping } }) => {
        should(ping).eql('pong');
        done();
      }).catch(done);
  });
});
