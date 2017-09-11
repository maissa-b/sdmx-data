import config from '../config';
import run from './run';

run({ config }).then(() => console.log('Server started')).catch(err => console.error(err));
