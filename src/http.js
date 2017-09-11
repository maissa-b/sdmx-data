import express from 'express';
import fs from 'fs';
import http from 'http';
import {
  match,
  filter,
  groupBy,
  map,
  assoc,
  dissoc,
} from 'ramda';

const getUrl = server => `http://${server.address().adress}:${server.address().port}`;

const init = context => {
  const { config } = context;
  const { server: { host, port } } = config;
  const app = express();
  const serverHttp = http.createServer(app);
  const dataDir = `${__dirname}/../data`;

  const getTypes = (req, res, next) => fs.readFile(`${dataDir}/types.json`, 'utf-8', (err, data) => {
    if (err) return next(err);
    res.json(JSON.parse(data));
  });

  const isMatching = (lang, search) => data => {
    if ((match(search, data.name[`${lang}`]).length || match(search, data.description[`${lang}`]).length)) {
      return true;
    }
    return false;
  };

  const filterData = (lang, search, data) => {
    const result = filter(isMatching(lang, search), data);
    return {
      numFound: result.length,
      searchValue: search,
      lang,
      dataflows: result,
    };
  };

  const getDataGrouped = (req, res, next) => {
    fs.readFile(`${dataDir}/types.json`, 'utf-8', (typesErr, typesData) => {
      if (typesErr) return next(typesErr);
      const types = map(assoc('count', 0), JSON.parse(typesData));

      fs.readFile(`${dataDir}/dataflows.json`, 'utf-8', (dataflowsErr, dataflowsData) => {
        if (dataflowsErr) return next(dataflowsErr);
        const groupedDataByType = groupBy(data => data.type, JSON.parse(dataflowsData));
        const dataGrouped = map(key => {
          const tmp = key;
          tmp.count = groupedDataByType[`${key.type}`].length;
          tmp.type = key.avatar;
          return dissoc('avatar', key);
        }, types);
        res.json(dataGrouped);
      });
    });
  };

  const getDataflowsFilteredByLang = (req, res, next) => {
    fs.readFile(`${dataDir}/dataflows.json`, 'utf-8', (err, data) => {
      if (err) return next(err);
      const { search } = req.query;
      const { lang } = req.params;
      const filteredData = filterData(lang, search, JSON.parse(data));
      res.json(filteredData);
    });
  };

  const sendPingResponse = (req, res) => res.json({ ping: 'pong' });

  const promise = new Promise(resolve => {
    app.get('/ping', sendPingResponse)
      .get('/types', getTypes)
      .get('/dataflows/:lang/', getDataflowsFilteredByLang)
      .get('/groupBy', getDataGrouped);

    serverHttp.listen(port, host, () => {
      serverHttp.url = getUrl(serverHttp);
      console.log(`Server listen on port ${port}`);
      resolve({ ...context, http: serverHttp });
    });
  });
  return promise;
};

export default init;
