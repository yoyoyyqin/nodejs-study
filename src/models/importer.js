const EventEmitter = require('events');
const _ = require('underscore')._;

const { promisify } = require('util');
var Q = require('q');

const fs = require('fs');
const readFileAsync = promisify(fs.readFile); 



export default class Importer extends EventEmitter {
    constructor(dirwatcher) {
        super();
        this.watcher = dirwatcher;
        this.watcher.on('changed', (files) => {
            // this.import(files).then((results)=>{
            //     _.each(results,(data)=>{
            //         console.log(data.message,data.filePath,data.text);
            //     })
            // });
            let results = this.importSync(files);
            _.each(results,(data)=>{
                console.log(data.message,data.filePath,data.text);
            });
        });
    }

    import(files) {
        let path = files.path;
        let addedResult = this.handle(files.added,'add new file',path);
        let removedResult =this.remove(files.removed,'remove file',path);
        let updatedResult = this.handle(files.changed,'update file',path);
        let resultArray = addedResult.concat(removedResult).concat(updatedResult);
        return Q.all(resultArray);
    }

    importSync(files){
        let path = files.path;
        let addedResult = this.readFilesSync(files.added,'add new file',path);
        let removedResult = this.removeSync(files.removed,'remove file',path);
        let updatedResult = this.readFilesSync(files.changed,'update file',path);
        let resultArray = addedResult.concat(removedResult).concat(updatedResult);
        return resultArray;
    }

    handle(files,message,path){
        let promiseArray = [];
        _.each(files, (file)=> {
            let filePath = path+file;
            let promise = this.readFile(filePath).then(function(text){
                return {
                    message:message,
                    filePath:filePath,
                    text:text
                }
            });
            promiseArray.push(promise);
        });

        return promiseArray;

    }

    remove(files,message,path){
        let promiseArray = [];
        _.each(files,(file)=>{
            let filePath = path+file;
            promiseArray.push(Q({
                message:message,
                filePath:filePath,
                text:""
            }));
        });
        return promiseArray;
    }

    removeSync(files,message,path){
        let result = [];
        _.each(files,(file)=>{
            let filePath = path+file;
            result.push({
                message:message,
                filePath:filePath,
                text:""
            });
        });
        return result;
    }

    readFile(path) {
        return readFileAsync(path, { encoding: 'utf8' })
            .then((text) => {
                return text;
            })
            .catch((err) => {
                throw err;
            });
    }

    readFilesSync(files,message,path){
        let result = [];
        _.each(files,(file)=>{
            let filePath = path+file;
            let content = this.readFileSync(filePath);
            result.push({
                message:message,
                filePath:filePath,
                text:content
            });
        });
        return result;
    }

    readFileSync(path){
        return fs.readFileSync(path,{ encoding: 'utf8' });
    }

    
}
