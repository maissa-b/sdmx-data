import mongodb from 'mongodb';
import debug from 'debug';

const logger = debug('sdmx:mongo');

const init = context => {
  const { config: { mongo } } = context;
  const server = new mongodb.Server(mongo.host, mongo.port, mongo);
  const dbconnector = new mongodb.Db(mongo.database, server, mongo);
  return dbconnector.open().then(db => {
    logger('mongo ready for U...');
    return { ...context, db };
  });
};

export default init;
