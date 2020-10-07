import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '../component/styles.js';

class PatchPage extends HTMLElement {

    static get is() {
        return 'page-patch';
    }

    renderList() {
        let items = [];

        for (let change of this.patch.changes) {
            change.list = change.list || [];
            items.push(html`
                <div class="caption">
                    ${change.title}
                </div>

                <ul class="list">
                    ${change.list.map(item => html`<li class="text">${item}</li>`)}
                </ul>
            `);
        }
        this.changes = items;
    }

    static template(page) {
        return html`
            <style>
                ${BunnyStyles.variables}
            
            :host {
                display: inline-block;
                width: 100%;
            }

            .title {
                left: 0;
                right: 0;
                font-size: 26px;
                text-align: center;
            }

            .caption {
                margin-left: 64px;
                font-size: medium;
            }

            .text {
                margin-left: 32px;
                margin-right: 32px;
                padding-bottom: 8px;
            }

            .item {
                margin-bottom: 32px;
                margin-top: 32px;
            }

            .date {
                width: 100%;
                text-align: center;
                font-size: smaller;
                padding-bottom: 24px;
                padding-top: 32px;
            }

            .version {
                padding-top: 32px;
                left: 0;
                right: 0;
                text-align: center;
                top: 26px;
            }

            .list {
                margin-left: 64px;
            }

            h4 {
                margin-top: 16px;
                margin-bottom: 16px;
            }

            .changes {
            }
        </style>

        <div class="container">
            <div class="version">
                ${page.patch.version}
            </div>

            <div class="title">
                <h4>${page.patch.name}</h4>
            </div>

            <div class="changes">
                ${page.changes}
            </div>

            <div class="date">
                ${page.patch.date}
            </div>
        </div>
        `;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        //render(this.template, this.shadowRoot);

        fetch('data/patch.json')
            .then(response => response.json())
            .then(json => {
                application.loadedVersion(json);
                this.patch = json;
                this.renderList();
                render(PatchPage.template(this), this.shadowRoot);
            });
    }
}
window.customElements.define(PatchPage.is, PatchPage);