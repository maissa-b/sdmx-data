import debug from 'debug';

const logger = debug('sdmx:data');

const init = context => { // eslint-disable-line
  const promise = new Promise(resolve => {
    logger('Data loaded');
    resolve(context);
  });
  return promise;
};

export default init;
