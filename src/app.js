import Dirwatcher from './models/dirwatcher';
import Importer from './models/importer';

const env = require('./config/env.json');
console.log(env.name);

let dirWatcher = new Dirwatcher();
let importer = new Importer(dirWatcher);

dirWatcher.watch("./data/", 200);
