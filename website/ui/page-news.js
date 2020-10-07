import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '../component/styles.js';

class NewsPage extends HTMLElement {

    static get is() {
        return 'page-news';
    }

    renderList(news) {
        let items = [];

        for (let item of news) {
            items.push(html`
                <div class="item">
                    <div class="title">
                        <h4>${item.title}</h4>
                    </div>

                    <div class="text">
                        <p>
                            ${item.content}
                        </p>
                    </div>

                    <div class="date">
                        ${item.date}
                    </div>
                    <hr>
                </div>
            `);
        }
        this.news = items;
    }

    get template() {
        return html`
            <style>
                ${BunnyStyles.variables}
            
            :host {
                display: inline-block;
                width: 100%;
            }

            .title {
                padding-top: 16px;
                margin-left: 16px;
            }

            .text {
                margin-left: 32px;
                margin-right: 32px;
                padding-bottom: 8px;
            }

            .item {
                
            }

            .date {
                width: 100%;
                text-align: center;
                font-size: smaller;
                padding-bottom: 24px;
            }
            
            ${BunnyStyles.hr}
        </style>

        <div class="container">
                ${this.news}
        </div>
        `;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});

        fetch('data/news.json')
            .then(response => response.json())
            .then(json => {
                this.renderList(json.list);
                render(this.template, this.shadowRoot);
            });
    }
}

window.customElements.define(NewsPage.is, NewsPage);