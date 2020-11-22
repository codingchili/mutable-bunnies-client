/**
 * @author Robin Duda
 *
 * Handles the loading of game resources.
 */
class Patcher {

    constructor() {
        this.name = "patcher";
        this.onLoad = [];
        this._init();
    }

    load(callback, patch, url) {
        this.patch = patch;
        this.index = 0;
        this.transferred = 0;
        this.downloaded = 0;
        this.chunks = 0;
        this.delta = performance.now() - 1000;
        this.url = url;

        // copy files from the executables into the download section.
        for (let i = 0; i < patch.executable.length; i++) {
            if (!patch.files[patch.executable[i]]) {
                patch.files[patch.executable[i]] = {};
            }
        }

        this.patch.count = Object.keys(patch.files).length;

        if (this.isUpToDate(patch.version)) {
            callback.upToDate();
        } else {
            this.patchSize(callback.beginUpdate);
        }
    }

    update(worker) {
        this.worker = worker;

        if (this.patch.version === this.getVersion()) {
            this.getFiles(worker, this.worker.completed.bind(this));
        } else {
            worker.started(this.patch.name, this.patch.version, this.patch.size, this.patch.files);

            if (this.patch.count > 0) {
                this.download(Object.keys(this.patch.files)[this.index]);
            } else {
                this.worker.completed();
            }
        }
    }

    isUpToDate(version) {
        return this.getVersion() === version;
    }

    getFiles(worker, callback) {
        this.patch.size = Object.keys(this.patch.files).length;
        let transferred = 0;

        worker.started(this.patch.name, this.patch.version, this.patch.size, this.patch.files);

        for (let key in this.patch.files) {
            let keys = Object.keys(this.patch.files);

            this._loadDb(key, value => {
                this.patch.files[key] = value;

                worker.progress(0, transferred++, 0, keys.indexOf(key));

                if (transferred === keys.length) {
                    callback();
                }
            });
        }
    }

    setFiles(files) {
        let count = Object.keys(files).length;
        let latch = () => {
            if (--count === 0) {
                this.setVersion(this.patch.version);
            }
        };

        for (let key in files) {
            let file = {
                data: files[key].data,
                name: key,
                xhr: {},
            };
            if (key.endsWith('.atlas') || key.endsWith('.json') || key.endsWith('.js')) {
                file.xhr.responseType = 'text';
            } else {
                file.xhr.responseType = 'blob';
            }
            this._storeDb(file, key, latch.bind(this));
        }
    }

    patchSize(done) {
        let latch = this.patch.count;
        let patch = this.patch;
        patch.size = 0;

        function countdown(file) {
            patch.size += file.size;
            latch--;
            if (latch === 0) {
                done();
            }
        }

        Object.keys(patch.files).forEach((key, index) => {
            let file = patch.files[key];

            if (file.size === undefined) {
                let xhr = new XMLHttpRequest();
                xhr.open("HEAD", this.url + key, true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 2) {
                        file.size = parseInt(xhr.getResponseHeader("Content-Length"));

                        if (isNaN(file.size)) {
                            file.size = 0; // some webservers don't return a length for certain resource types.
                        }
                        countdown(file);
                    }
                };
                xhr.send();
            } else {
                countdown(file);
            }
        });
    }

    download(fileName) {
        const xhr = new XMLHttpRequest();
        this.patch.files[fileName].xhr = xhr;
        xhr.open('GET', this.url + fileName, true);

        if (fileName.endsWith(".png")) {
            xhr.responseType = 'blob';
        } else if (fileName.endsWith(".atlas") || fileName.endsWith('.js')) {
            xhr.responseType = 'text';
        } else if (fileName.endsWith('.json')) {
            xhr.responseType = 'json';
        } else {
            throw Error('unsupported type ' + fileName);
        }

        this.downloaded = 0;
        xhr.onload = (event) => this.completeHandler(event);
        xhr.addEventListener('progress', (event) => this.progressHandler(event));
        xhr.onreadystatechange = (event) => this.errorHandler(event);
        xhr.send();
    }

    progressHandler(event) {
        this.chunks += (event.loaded - this.downloaded);
        this.transferred += (event.loaded - this.downloaded);
        this.downloaded = event.loaded;

        if ((performance.now() - this.delta) >= 1000) {
            this.bandwidth = this.chunks * 1000;
            this.delta = performance.now();
            this.chunks = 0;
        }

        this.worker.progress(
            parseFloat(this.bandwidth).toFixed(2),
            this.transferred,
            this.downloaded,
            this.index
        );
    }

    completeHandler(event) {
        if (event.target.status === 200) {
            let file = this.patch.files[Object.keys(this.patch.files)[this.index]];
            file.data = event.target.response;
            this.index += 1;

            if (this.index < this.patch.count) {
                this.download(Object.keys(this.patch.files)[this.index]);
            } else {
                this.setFiles(this.patch.files);
                this.worker.completed(file);
            }
        }
    }

    errorHandler(event) {
        if (event.target.status === 409) {
            this.reset();
        } else if (event.target.status === 404) {
            application.error("Failed to retrieve file " + Object.keys(this.patch.files)[this.index]);
        }
    }

    _from(tag) {
        this.from = performance.now();
        this.tag = tag;
    }

    _to() {
        let now = performance.now();
        console.log(`${this.tag} took ${now - this.from}ms`);
    }

    _clear() {
        localStorage.clear();
    }

    getVersion() {
        return localStorage.getItem("version@" + this.url);
    }

    setVersion(version) {
        localStorage.setItem("version@" + this.url, version);
        console.log(`client updated to ${version}`);
    }

    _init() {
        let indexedDB = window.indexedDB;
        let request = indexedDB.open(this.name, 255);

        request.onsuccess = (event) => {
            this.db = request.result;

            this.db.onerror = (event) => {
                application.error(event.message);
            };
            this._loaded();
        }
        request.onerror = (event) => {
            console.log(event);
        };
        request.onupgradeneeded = (event) => {
            this.db = event.target.result;
            if (this.db.objectStoreNames.contains(this.name)) {
                this.db.deleteObjectStore(this.name);
            }
            this.db.createObjectStore(this.name, {keyPath: 'id'});
        }
    }

    _storeDb(blob, id, callback) {
        this._delayed(() => {
            let transaction = this.db.transaction(this.name, "readwrite");
            let put = transaction.objectStore(this.name).put({
                value: blob,
                id: btoa(id)
            });
            put.onsuccess = (event) => {
                callback();
            };
            put.onerror = (event) => {
                application.error(event.message);
            };
        });
    }

    _loadDb(id, callback) {
        this._delayed(() => {
            let transaction = this.db.transaction(this.name, "readonly");
            transaction.objectStore(this.name).get(btoa(id)).onsuccess = (event) => {
                //event.target.result.value.xhr.response = event.target.result.value.data;
                callback(event.target.result.value);
            };
        });
    }

    _delayed(action) {
        if (this.loaded) {
            action();
        } else {
            this.onLoad.push(action);
        }
    }

    _loaded() {
        this.loaded = true;
        this.onLoad.forEach(action => action());
    }
}

window.patcher = new Patcher();