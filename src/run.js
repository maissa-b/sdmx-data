import initHttp from './http';
import initMongo from './mongo';

const run = context => initHttp(context).then(initMongo);

export default run;
