import express from 'express';
import http from 'http';
import debug from 'debug';
import compression from 'compression';
import morgan from 'morgan-debug';
import { map, reduce, toPairs } from 'ramda';
import initFiles from '../files';

const logger = debug('sdmx:http');

const getUrl = server => `http://${server.address().address}:${server.address().port}`;

const error = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(err.stack);
  res.status(500).json({
    message: err.toString(),
  });
};

const getCollection = (db, collectionName) => (req, res, next) => {
  const collection = db.collection(collectionName);
  collection.find().toArray((err, docs) => {
    if (err) return next(err);
    res.json(docs);
  });
};

const doSearchFilter = lang => key =>
  ({ $or: [{ [`name.${lang}`]: new RegExp(key, 'i') }, { [`description.${lang}`]: new RegExp(key, 'i') }] });

const doSearchOthersFilter = lang => ([propKey, propValue]) =>
  ({ $or: [{ [`${propKey}.${lang}`]: new RegExp(propValue, 'i') }, { [`${propKey}`]: new RegExp(propValue, 'i') }] });

const filterDataflowsCollection = db => (req, res, next) => {
  const collection = db.collection('dataflows');
  const { query, fields, ...others } = req.query;
  const { lang } = req.params;
  let searchQuery = [];
  let fieldsQuery = [];
  let othersQuery = [];
  if (query) searchQuery = map(doSearchFilter(lang), query.split(','));
  if (fields) fieldsQuery = fields.split(',');
  if (others) othersQuery = map(doSearchOthersFilter(lang), toPairs(others));
  const combinedQuery = { $and: [...searchQuery, ...othersQuery] };
  collection.find(combinedQuery, fieldsQuery).toArray((err, docs) => {
    if (err) return next(err);
    res.json(docs);
  });
};

const loadTypes = db => db.collection('types').find().toArray();

const loadDataflows = db => db.collection('dataflows').aggregate([
  {
    $group:
    {
      _id: '$type',
      count: { $sum: 1 },
    },
  },
]).toArray();

const groupByTypes = db => (req, res, next) => {
  const promises = [loadTypes(db), loadDataflows(db)];
  Promise.all(promises)
    .then(([types, dataflows]) => {
      const avatarById = reduce((acc, { _id, avatar }) => ({ ...acc, [_id]: avatar }), {}, types);
      const result = map(({ _id, count }) => ({ avatar: avatarById[_id], count }), dataflows);
      res.json(result);
    })
    .catch(err => next(err));
};

const initMongo = db => {
  const app = express();
  app
    .get('/types', getCollection(db, 'types'))
    .get('/dataflows', getCollection(db, 'dataflows'))
    .get('/dataflows/:lang/', filterDataflowsCollection(db))
    .get('/groupTypes', groupByTypes(db));
  return app;
};

const init = context => {
  const { config: { server: { host, port }, data }, db } = context;
  const app = express();
  const httpServer = http.createServer(app);
  const promise = new Promise(resolve => {
    app
      .get('/ping', (req, res) => res.json({ ping: 'pong' }))
      .use(compression())
      .use(morgan('sdmx:http', 'dev'))
      .use('/files', initFiles(data))
      .use('/mongo', initMongo(db))
      .use(error);

    httpServer.listen(port, host, () => {
      httpServer.url = getUrl(httpServer);
      logger(`server started on ${httpServer.url}`);
      resolve({ ...context, http: httpServer });
    });
  });
  return promise;
};

export default init;
