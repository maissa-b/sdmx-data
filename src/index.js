import debug from 'debug';
import config from '../config';
import run from './run';

const logger = debug('sdmx');

run({ config }).then(logger('server started')).catch(console.error);
