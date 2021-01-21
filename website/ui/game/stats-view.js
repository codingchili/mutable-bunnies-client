import {html, render} from '/node_modules/lit-html/lit-html.js';

class StatsView extends HTMLElement {

    static get is() {
        return 'stats-view';
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'})
        this.compact = false;
        this.hide = ['level', 'nextlevel', 'maxhealth', 'maxenergy', 'experience', 'energy', 'health'];
    }

    set selected(value) {
        this.playerClass = value;
        if (value.id) {
            this.render();
        }
    }

    get selected() {
        return this.playerClass;
    }

    connectedCallback() {
        this.compact = this.getAttribute('compact');
        this.render();
    }

    _layout() {
        return 'attribute-' + ((this.compact) ? 'compact' : 'wide');
    }

    _visible(attribute) {
        return !this.hide.includes(attribute.name);
    }

    _format(value, type) {
        let percentage = this._asPercent(type);

        if (value > 0) {
            value = `+${value}`;
        }
        if (percentage) {
            value += '%';
        }
        return value;
    }

    _style(attribute) {
        if (attribute.value < 0) {
            return "penalty";
        } else {
            return "bonus";
        }
    }

    _toList() {
        let stats = [];

        if (this.selected && this.selected.stats) {
            Object.keys(this.selected.stats).forEach((key, index) => {
                stats.splice(index, 0, {
                    name: key,
                    value: this.selected.stats[key].toFixed(0)
                });
            });
        }
        return stats;
    }

    _toHtmlList() {
        let items = [];

        for (let attribute of this._toList()) {
            if (this._visible(attribute)) {
                let item = html`
                    <div class="content ${this._layout()}">
                        <img class="stat-icon" src="${application.realm.resources}gui/stats/${attribute.name}.svg">
                        <div class="text">
                            <div class="value ${this._style(attribute)}">
                                <i>${this._format(attribute.value, attribute.name)}</i>
                            </div>
                            <div class="name">${attribute.name}</div>
                        </div>
                    </div>
                `
                items.push(item);
            }
        }
        return items;
    }

    _asPercent(type) {
        return ['armorClass', 'magicResist'].includes(type);
    }

    get template() {
        return html`

        <style>
            :host {
                display: block;
                font-family: 'Open Sans', sans-serif;
            }

            .container {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
            }

            .attribute-wide {
                display: flex;
                width: 100%;
                margin-left: 12.5%;
                margin-right: 12.5%;
                flex-direction: row;
                justify-content: var(--stats-view-justify, space-between);
            }

            .attribute-compact {
                display: flex;
                width: 100%;
                margin-left: 20%;
                margin-right: 20%;
                flex-direction: row;
                justify-content: space-between;
            }

            .penalty {
                color: #ff0000;
            }

            .bonus {
                color: #00ff00;
            }

            .content {
                font-size: 12px;
                text-align: right;
                margin-top: 2px;
            }
            
            .stat-icon {
                width: 34px;
            }
            
            .name {
                opacity: 0.76;
            }
            
            .value {
                font-size: large;
            }

        </style>

        <div class="container">
            ${this._toHtmlList()}
        </div>

        `;
    }

    render() {
        render(this.template, this.shadowRoot);
    }
}

customElements.define(StatsView.is, StatsView);