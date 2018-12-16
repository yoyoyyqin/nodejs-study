const EventEmitter = require('events');
const fs = require('fs');
const util = require('util');
const _ = require('underscore')._;

export default class Dirwatcher extends EventEmitter {

    constructor() {
        super();
        this.files = [];
        this.fileStates = [];
    }

    watch(path, delay) {

        if (this.interval) {
            this.cancel();
        }

        this.interval = setInterval(() => {
            this.readDir(path);
        }, delay);


    }

    readDir(path) {

        fs.readdir(path, (error, files) => {
            if (error) {
                console.log(error);
                return;
            }

            let result = this.compare(this.files, files, path);
            if (result.added.length > 0 || result.removed.length > 0 || result.changed.length > 0) {
                this.emit('changed', result);
            }
        });
    }

    cancel() {
        clearInterval(this.interval);
        this.interval = null;
    }

    compare(older, newer, path) {
        let removed = _.difference(older, newer);
        let added = _.difference(newer, older);

        let exists = _.intersection(older, newer);
        let changed = this.getModification(exists, path);

        this.files = newer;
        this.fileStates = this.getFileStates(this.files, path);

        return {
            removed: removed,
            added: added,
            changed: changed,
            path:path
        };

    }

    getModification(files, path) {
        let changed = [];

        let newFileStates = this.getFileStates(files, path);
        _.each(this.fileStates, (fileInfo) => {
            let matcher = _.find(newFileStates, (itme) => {
                return itme.name === fileInfo.name;
            });
            if (matcher && (matcher.mtime - fileInfo.mtime) > 0) {
                changed.push(matcher.name);
            }
        });
        return changed;
    }



    getFileStates(files, path) {
        let fileTimes = [];
        _.each(files, (file) => {
            let fileInfo = fs.statSync(path + file);
            fileTimes.push({ name: file, mtime: fileInfo.mtimeMs });
        });
        return fileTimes;
    }




}