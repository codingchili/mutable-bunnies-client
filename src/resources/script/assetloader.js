// may load multiple resources at once: but resources added after the load call starts
window.AssetLoader = class AssetLoader {

    constructor() {
        this.callbacks = [];
        this.completers = [];
        this.loading = false;
        this.queue = [];
        this.resources = PIXI.Loader.shared.resources;

        // install custom features to pixi.
        this.install();
    }

    load(callback, model) {
        let assetName = this._graphicsToUrl(model)
        this.queue.push({'assetName': assetName, "model": model, "callback": callback});
        return this;
    }

    begin(callback) {
        if (!callback) {
            callback = () => {};
        }

        if (this.queue.length === 0) {
            callback();
        } else {
            // items added to queue while processing will be processed
            // as soon as the current round have completed.
            this.callbacks.push(callback);

            if (!this.loading) {
                this.completers = this.callbacks;
                this.callbacks = [];
                this.processQueue();
            }
        }
    }

    processQueue() {
        this.loading = true;
        this.processing = this.queue;
        this.queue = [];

        let loader = PIXI.Loader.shared.pre((res, next) => {
            // load files that has been loaded by the patcher.
            if (patch.files[res.url] !== undefined) {
                res.xhr = patch.files[res.url].xhr;
                res.xhrType = 'blob';
                res.data = patch.files[res.url].data;
                res.complete();
            } else {
                // if not loaded by patcher perform on-demand xhr load.
                if (!res.url.startsWith(application.realm.resources)) {
                    res.url = application.realm.resources + res.url;
                }
            }
            next();
        });

        let isAllLoaded = true;

        this.processing.forEach((asset) => {
            let resource = PIXI.Loader.shared.resources[asset.assetName];
            if (!resource) {
                loader.add(asset.assetName);
                isAllLoaded = false;
            }
        });

        // if all the assets are loaded - make sure to mark as complete.
        if (isAllLoaded) {
            this.completed();
        }

        loader.load(() => {
            for (let i in this.processing) {
                let current = this.processing[i];
                let resource;

                if (current.assetName.endsWith('.json')) {
                    resource = PIXI.Loader.shared.resources[current.assetName].data;
                } else {
                    resource = new PIXI.Sprite(PIXI.Loader.shared.resources[current.assetName].texture);
                    resource.hitArea = new PIXI.Rectangle(0, 0, resource._texture.width, resource._texture.height);
                    resource.hitArea.contains = (x, y) => {
                        let area = resource.hitArea;

                        if (x >= area.x && x < area.x + area.width) {
                            if (y >= area.y && y < area.y + area.height) {
                                // make sure alpha is not 0, click through transparency.
                                return resource.getColorAt(x, y)[3] > 0;
                            }
                        }
                        return false;
                    };
                }
                resource.model = current.model;
                current.callback(resource);
            }
            this.loading = false;
            if (this.queue.length > 0) {
                this.completed();
                this.processQueue();
            }
        });
    }

    completed() {
        this.loading = false;
        this.completers.forEach((completer) => {
            completer();
        });
    }

    _isAnimated(model) {
        let graphics = model.graphics;
        if (graphics) {
            return !(graphics.includes('.png') || graphics.includes('.jpg'));
        } else {
            return false;
        }
    }

    toSprite(resource) {
        let model = resource.model;

        if (this._isAnimated(model)) {
            let sprite = new PIXI.spine.Spine(this._parseSpineData(resource, model));
            if (model.skin) {
                sprite.skeleton.setSkinByName(model.skin);
            }
            return sprite;
        } else {
            // the resource is already converted to a sprite by the loader.
            resource.pivot.y = resource.height + model.pivot.y;
            resource.pivot.x = (resource.width / 2) + model.pivot.x;
            resource.scale.x = model.scale;
            resource.scale.y = model.scale;
            return resource;
        }
    }

    _parseSpineData(jsondata, model) {
        const rawSkeletonData = jsondata;
        const rawAtlasData = Loader.resources[`${model.graphics}.json_atlas`].data;
        const spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, (image, callback) => {
            callback(PIXI.BaseTexture.from(this._getImageNameFrom(model.graphics, image)));
        });

        const spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
        const spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);

        spineJsonParser.scale = model.scale;

        return spineJsonParser.readSkeletonData(rawSkeletonData);
    }

    _getImageNameFrom(path, imageName) {
        let directoryName = path.substr(0, path.lastIndexOf('/'));
        return `${application.realm.resources}${directoryName}/${imageName}`;
    }

    _graphicsToUrl(model) {
        if (this._isAnimated(model)) {
            return `${model.graphics}.json`;
        } else {
            // either a model object or a direct resource uri.
            return model.graphics || model;
        }
    }

    /**
     * https://github.com/pixijs/pixi.js/wiki/v5-Hacks#pixel-perfect-interaction
     */
    install() {
        const genColorMap = this.genColorMap;
        PIXI.Sprite.prototype.getColorAt = function (eX, eY) {
            const width = this._texture.orig.width;
            const height = this._texture.orig.height;
            const x1 = -width * this.anchor.x;
            let y1 = 0;

            let flag = false;

            if (eX >= x1 && eX < x1 + width) {
                y1 = -height * this.anchor.y;

                if (eY >= y1 && eY < y1 + height) {
                    flag = true;
                }
            }

            if (!flag) {
                return [0, 0, 0, 0];
            }

            // bitmap check
            const tex = this.texture;
            const baseTex = this.texture.baseTexture;
            if (!baseTex.colormap) {
                if (!genColorMap(baseTex)) {
                    return [0, 0, 0,];
                }
            }

            const colormap = baseTex.colormap;
            const data = colormap.data;
            const res = baseTex.resolution;

            // this does not account for rotation yet!!!
            let dx = Math.round((eX - x1 + tex.frame.x) * res);
            let dy = Math.round((eY - y1 + tex.frame.y) * res);
            let num = dx + dy * colormap.width;
            return [data[num * 4], data[num * 4 + 1], data[num * 4 + 2], data[num * 4 + 3]];
        }
    }

    /**
     * https://github.com/pixijs/pixi.js/wiki/v5-Hacks#pixel-perfect-interaction
     *
     * @param baseTex
     * @returns {boolean}
     */
    genColorMap(baseTex) {
        if (!baseTex.resource) {
            //renderTexture
            return false;
        }
        const imgSource = baseTex.resource.source;
        let canvas = null;
        if (!imgSource) {
            return false;
        }
        let context = null;
        if (imgSource.getContext) {
            canvas = imgSource;
            context = canvas.getContext('2d');
        } else if (imgSource instanceof Image) {
            canvas = document.createElement('canvas');
            canvas.width = imgSource.width;
            canvas.height = imgSource.height;
            context = canvas.getContext('2d');
            context.drawImage(imgSource, 0, 0);
        } else {
            //unknown source;
            return false;
        }

        const w = canvas.width, h = canvas.height;
        baseTex.colormap = context.getImageData(0, 0, w, h);
        return true;
    }
};

var Loader = new AssetLoader();