const env = require('./env.json');

export default class Config{
    constructor(){
        console.log(env.name,'z');
    }
}