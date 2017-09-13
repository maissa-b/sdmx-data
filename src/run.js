import initHttp from './http';
import initData from './data';
import initMongo from './mongo';

const run = context => initData(context).then(initMongo).then(initHttp);

export default run;
