import {html, render} from '/node_modules/lit-html/lit-html.js';
import '../component/bunny-progress.js'
import '../component/bunny-spinner.js'
import '../component/bunny-box.js'

class PatchDownload extends HTMLElement {

    static get is() {
        return 'patch-download';
    }

    constructor() {
        super();
        this.downloading = false;
        this.patch = {};

        application.onCharacterSelect((event) => {
            this.status = "Checking version..";
            this.initializing = false;
            this.downloading = false;
            this.server = event.server;
            this.realm = event.realm;
            this.character = event.character;
            this.render();

            import('../script/service/patcher.js').then(() => {
                fetch(`${this.realm.resources}/metadata.json`)
                    .then(response => response.json())
                    .then((json) => {
                        this._onPatchMetadata(json);
                    });
            });
        });
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'})
    }

    _onPatchMetadata(data) {
        this.initializing = true;
        this.status = "Calculating download size..";
        this.render();

        this.patch = data;
        this.patch.bandwidth = 0;
        this.patch.transferred = 0;
        this.patch.current = 0;
        this.patch.downloaded = 0;

        patcher.load({
            upToDate: () => {
                this.status = "Loading files..";
                this._download();
            },
            beginUpdate: () => {
                this.downloading = true;
                this._download();
            }
        }, this.patch, this.realm.resources);
    }

    _download() {
        patcher.update({
            started: (name, version, size, files) => {
                this.patch.size = size;
                this.patch.files = files;
                this.patch.file = {};
                this.render();
            },
            completed: (file) => {
                window.server = this.server;
                window.character = this.character;
                window.patch = this.patch;

                if (file) {
                    this.patch.downloaded = file.size;
                    this.patch.transferred = this.patch.size;
                }

                this.downloading = false;
                this.render();

                import('./game-view.js')
                customElements.whenDefined('game-view').then(() => {
                    application.updateComplete({
                        server: this.server,
                        realm: this.realm,
                        character: this.character,
                        patch: this.patch,
                        status: (text) => {
                            this.downloading = false;
                            this.status = text;
                            this.render();
                        }
                    });
                });
            },
            progress: (bandwidth, transferred, downloaded, current) => {
                this.fileName = Object.keys(this.patch.files)[current];
                this.patch.bandwidth = bandwidth;
                this.patch.transferred = transferred;
                this.patch.downloaded = downloaded;
                this.patch.file = this.patch.files[this.fileName];
                this.patch.current = current + 1;
                this.totalPercent = ((transferred * 100) / this.patch.size).toFixed(0);
                this.status = "Loading files.. " + this.totalPercent + "%";
                this.render();
            }
        });
    }

    formatBytes(bits) {
        return (bits / 1024 / 1024).toFixed(2) + " MB";
    }

    formatBitRate(bits) {
        return (bits / 1024 / 1024).toFixed(0) + " kbps";
    }

    get template() {
        return html`
            <style>
            :host {
                display: block;
                padding-top: 128px;
            }

            .container {
                height: 318px;
                width: 80%;
                max-width: 825px;
                display: block;
                margin: auto;
                position: relative;
            }
            
            .noselect {
                user-select: none;
            }

            .download-progress {
                margin-left: auto;
                margin-right: auto;
                width: 95%;
                top: 121px;
                position: absolute;
            }

            .total-progress {
                padding-top: 128px;
            }
            
            bunny-progress {
                padding: 16px;
                --bunny-progress-transition-duration: 0.04s;
            }

            .patch-name {
                position: absolute;
                top: 20px;
                display: block;
                right: 0;
                left: 0;
                text-align: center;
                font-size: 22px
            }

            .patch-version {
                display: block;
                position: absolute;
                top: 48px;
                left: 0;
                right: 0;
                font-size: small;
                text-align: center;
            }

            .patch-count {
                display: block;
                position: absolute;
                left: 0;
                right: 0;
                text-align: center;
                bottom: 72px;
            }

            .patch-file {
                position: absolute;
                display: block;
                left: 0;
                right: 0;
                text-align: center;
                bottom: 14px;
            }

            .patch-bandwidth {
                position: absolute;
                display: inline;
                left: 0;
                right: 0;
                text-align: center;
                top: 98px;
            }

            .patch-size {
                position: absolute;
                right: 22px;
                top: 146px;
            }

            .patch-transferred {
                position: absolute;
                left: 22px;
                top: 146px
            }

            bunny-spinner {
                top: 76px;
                position: relative;
            }

            @media (max-width: 728px) {
                :host {
                    padding-top: 36px;
                }

                .container {
                    width: 100%;
                }
            }

        </style>

        <bunny-box class="container noselect">

            <span class="patch-name">${this.patch.name}</span>
            <span class="patch-version">${this.patch.version}</span>

            ${this.downloading ? html`
                <bunny-progress class="download-progress" max="${this.patch.size}"
                            value="${this.patch.transferred}"></bunny-progress>

                <bunny-progress class="download-progress total-progress" max="${this.patch.file.size}"
                                value="${this.patch.downloaded}"></bunny-progress>

                <span class="patch-count">${this.patch.current}/${this.patch.count}</span>
                <span class="patch-file">${this.fileName}</span>
                <span class="patch-bandwidth">${this.formatBitRate(this.patch.bandwidth)}</span>
                <span class="patch-size">${this.formatBytes(this.patch.size)}</span>
                <span class="patch-transferred">${this.formatBytes(this.patch.transferred)}</span>
            `: ''}

            <bunny-spinner class="loader" text="${this.status}" ?enabled="${!this.downloading}" ?spinner="${this.initializing}"></bunny-spinner>

        </bunny-box>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(PatchDownload.is, PatchDownload);