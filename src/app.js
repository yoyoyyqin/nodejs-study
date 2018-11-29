import Product from './models/Product';
import User from './models/User';

const env =require('./config/env.json');
console.log(env.name);

let user = new User();
let product = new Product();
