import should from 'should';
import axios from 'axios';
import config from '../../config';
import run from '../run';

const { describe, it } = global;

const data = {
  types: [
    {
      type: '1',
      avatar: 'a',
    },
    {
      type: '2',
      avatar: 'b',
    },
  ],
  dataflows: [
    {
      type: '1',
    },
    {
      type: '1',
    },
  ],
};

describe('Pong test', () => {
  it('Should be equal to pong', (done) => {
    run({ config })
      .then(({ http }) => {
         axios.get(`${http.url}/ping`)
        .then(({ data: { ping } }) => {
          should(ping).eql('pong');
          done();
          http.close();
        })
      })
      .catch(done);
  });
});

describe('groupBy test', () => {
  it('Should have data grouped', (done) => {
    run({ config, data })
      .then(({ http }) => {
        return axios.get(`${http.url}/groupBy`)
        .then(({ data }) => {
          should(data).eql({ a: 2 });
          done();
          http.close();
        })
      })
      .catch(done);
  });
});
