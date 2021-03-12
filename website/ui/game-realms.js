import {html, render} from '/node_modules/lit-html/lit-html.js';
import {BunnyStyles} from '../component/styles.js';
import '/component/bunny-box.js'
import '/component/bunny-pages.js'
import '/component/bunny-tab.js'
import '/component/bunny-spinner.js'
import '/component/bunny-tooltip.js'
import '/component/bunny-icon.js'

class GameRealms extends HTMLElement {

    static get is() {
        return 'game-realms';
    }

    constructor() {
        super();
        this.page = 0;
        this.realms = [];
        this.trustedservers = true;
        this.sort = this.favoriteSort.bind(this);
        this.select = this.select.bind(this);

        application.subscribe('view', (view) => {
            if (view === GameRealms.is) {
                // skips waiting for next update if already updated before.
                if (this.realms.length === 0) {
                    this.loading = true;
                    this.render();
                }
                this.update();
                this.timer = setInterval(this.update.bind(this), 3000);
            }
        });
        application.onLogout(() => clearInterval(this.timer));
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();
    }

    order(sortType) {
        switch (sortType) {
            case "name":
                this.sort = this.nameSort;
                break;
            case "type":
                this.sort = this.typeSort;
                break;
            case "lifetime":
                this.sort = this.lifetimeSort;
                break;
            case "players":
                this.sort = this.playerSort;
                break;
            case "ping":
                this.sort = this.pingSort;
                break;
        }
        this.realms = this.realms.sort(this.sort);
        this.render();
    }

    favourite(realm) {
        return true;//this.favourites[realm];
    }

    favoriteSort(a, b) {
        if (this.favourite(a.name) && !this.favourite(b.name))
            return -1;

        if (!this.favourite(a.name) && this.favourite(b.name))
            return 1;

        return this.nameSort(a, b);
    }

    nameSort(a, b) {
        if (a.name === b.name)
            return 0;
        return a.name < b.name ? -1 : 1;
    }

    typeSort(a, b) {
        if (a.type === b.type)
            return 0;
        return a.type < b.type ? -1 : 1;
    }

    lifetimeSort(a, b) {
        if (a.lifetime === b.lifetime)
            return 0;
        return a.lifetime < b.lifetime ? -1 : 1;
    }

    playerSort(a, b) {
        if (a.players === b.players)
            return 0;
        return a.players < b.players ? -1 : 1;
    }

    pingSort(a, b) {
        if (a.ping === b.ping)
            return 0;
        return a.ping < b.ping ? -1 : 1;
    }

    update() {
        if (!this.realmregistry) {
            import('../script/service/realmregistry.js').then(() => {
                this.realmregistry = new RealmRegistry();
                this.update();
            });
        } else {
            this.realmregistry.list({
                accepted: (data) => {
                    this.load(data.realms);
                    this.loading = (data.realms.length === 0);
                    this.render();
                },
                failed: (error) => {
                    clearInterval(this.timer);
                    application.error("Failed to retrieve realm list from realm registry.");
                    this.loading = false;
                    this.render();
                }
            });
        }
    }

    load(realmlist) {
        this.refresh(realmlist);
        this.purge(realmlist);

        // let initial load complete before pinging, to increase accuracy of first update.
        setTimeout(this.pingAll.bind(this), 512);

        if (realmlist.length > 0) {
            if (application.development.selectFirstRealm) {
                this.select(this.realms[0]);
            }
            application.realmList(this.realms);
        }
    }

    refresh(realmlist) {
        for (let updated of realmlist) {
            let exists = false;

            for (let realm of this.realms) {
                if (updated.name === realm.name) {
                    Object.assign(realm, updated);
                    this.apply(realm);
                    exists = true;
                }
            }
            if (!exists)
                this.realms.push(updated);
        }
        this.realms = this.realms.sort(this.sort);
        this.render();
    }

    purge(realmlist) {
        for (let i = 0; i < this.realms.length - 1; i++) {
            let removed = true;

            for (let j = 0; j < realmlist.length; j++) {
                if (this.realms[i].name === realmlist[j].name)
                    removed = false;
            }

            if (removed) {
                this.realms.splice(i, 1);
                i -= 1;
            }
        }
    }

    trusted() {
        this.trustedservers = true;
        this.applyAll();
    }

    untrusted() {
        this.trustedservers = false;
        this.applyAll();
    }

    applyAll() {
        if (this.realms) {
            for (let realm of this.realms) {
                this.apply(realm, true);
            }
        }
        this.render();
    }

    apply(realm, skip) {
        if (!realm.ping)
            realm.ping = '-';

        realm.hidden = this.hidden(realm);
        realm.populationColor = this.populationColor(realm);
        realm.pingColor = this.pingColor(realm);
        if (!skip) {
            this.realms = this.realms.sort(this.sort);
            this.render();
        }
    }

    pingColor(realm) {
        if (realm.ping < 50)
            return "green";
        if (realm.ping < 100)
            return "yellow";
        if (realm.ping < 150)
            return "orange";
        if (realm.ping >= 150 || realm.ping === "?")
            return "red";
        return "";
    }

    populationColor(realm) {
        const index = realm.players / realm.size;

        if (index > 0.9)
            return "red";
        if (index > 0.8)
            return "orange";
        if (index > 0.3)
            return "yellow";

        return "green";
    }

    hidden(realm) {
        return !(realm.trusted === this.trustedservers);
    }

    pingAll() {
        for (let i = 0; this.realms && i < this.realms.length; i++) {

            setTimeout(() => {
                this.ping(this.realms[i]);
            }, i * 200);
        }
    }

    ping(realm) {
        if (!window.RealmServer) {
            import('../script/service/realmserver.js').then(() => {
                this.ping(realm);
            });
        } else {
            const start = performance.now();
            RealmServer.ping({
                accepted: () => {
                    const ping = parseInt((performance.now() - start), 10);
                    realm.ping = ping;
                    this.apply(realm);
                },
                failed: () => {
                    realm.ping = '?';
                    this.apply(realm);
                }
            }, realm);
        }
    }

    select(realm) {
        clearInterval(this.timer);
        application.selectRealm(realm);
    }

    render() {
        render(this.template, this.shadowRoot);
    }

    get template() {
        return html`
            <style>
                ${BunnyStyles.variables}
                ${BunnyStyles.icons}
                ${BunnyStyles.noselect}
                :host {
                    padding-bottom: 16px;;
                }

                .icon {
                    fill: red;
                }

                .icon:hover {
                    fill: red;
                    cursor: var(--bunny-cursor);
                }

                .icons {
                    display: inline-flex;
                }

                :host {
                    display: block;
                    padding-top: 128px;
                }

                .container {
                    width: 80%;
                    max-width: 825px;
                    display: block;
                    margin: auto;
                }

                .description {
                    width: 65%;
                    font-size: 12px;
                }

                .red {
                    color: rgba(255, 87, 34, 1)
                }

                .orange {
                    color: rgba(239, 108, 0, 1)
                }

                .yellow {
                    color: rgba(255, 214, 0, 1);
                }

                .green {
                    color: rgba(85, 139, 47, 1);
                }

                .mod-warning {
                    text-align: center;
                    width: 100%;
                    position: absolute;
                    font-size: smaller;
                    margin-top: 14px;
                }

                .realm-icon {
                    color: #ff0000;
                }

                .realm-icon:hover {
                    color: #ff0000;
                    cursor: var(--bunny-cursor);
                }

                bunny-tab {
                    --bunny-tab-background-active: #00000000;
                    --bunny-tab-background: #00000000;
                }

                @media (max-width: 728px), (max-height: 768px) {
                    :host {
                        padding-top: 36px;
                    }

                    .container {
                        width: 100%;
                        max-width: unset;
                    }

                    .type {
                        display: none;
                    }

                    .reset {
                        display: none;
                    }
                }

                .realm-table {
                    text-align: center;
                    width: 100%;
                    margin-top: 8px;
                }

                .realm-info {
                    position: relative;
                    display: block;
                    margin-top: 14px;
                    margin-right: 2px;
                }

                .realm-items {
                    cursor: var(--bunny-cursor-pointer);
                }

                .realm-items:hover {
                    background-color: #ffffff32;
                }

                .realm-item {
                    padding: 12px;
                }

                .realm-item.name {
                    text-align: left;
                }

                .icons {
                    position: relative;
                    display: flex;
                }

                .tooltip-area {
                    display: inline;
                }

                .icon-info {
                    color: #fff !important;
                    fill: #fff !important;
                }

                th, td {
                    padding: 0;
                }

                table {
                    border-collapse: collapse;
                    border-spacing: 0;
                }

            </style>

            <bunny-box class="container noselect">
                <bunny-pages id="tabs">
                    <div slot="tabs">
                        <bunny-tab @down="${this.trusted.bind(this)}" active>Game Worlds</bunny-tab>
                    </div>
                    <div slot="pages">
                        <div>
                            <div ?hidden="${this.trustedservers}" class="mod-warning">
                                <h5><span class="red"> Warning:</span> These servers may contain resources and code not
                                    provided by &trade;.</h5>
                            </div>

                            <bunny-spinner class="loader" text="Loading realms.."
                                           ?enabled="${this.loading}"></bunny-spinner>

                            <div ?hidden="${this.loading}">
                                <table class="realm-table">
                                    <tr class="realm-header">
                                        <th></th>
                                        <th>
                                            <bunny-button @mousedown="${this.order.bind(this, "name")}">Name
                                            </bunny-button>
                                        </th>
                                        <th class="type">
                                            <bunny-button @mousedown="${this.order.bind(this, "type")}">Type
                                            </bunny-button>
                                        </th>
                                        <th class="reset">
                                            <bunny-button @mousedown="${this.order.bind(this, "lifetime")}">Reset
                                            </bunny-button>
                                        </th>
                                        <th>
                                            <bunny-button @mousedown="${this.order.bind(this, "players")}">Players
                                            </bunny-button>
                                        </th>
                                        <th>
                                            <bunny-button @mousedown="${this.order.bind(this, "ping")}">Ping
                                            </bunny-button>
                                        </th>
                                        <th></th>
                                    </tr>

                                    ${this.renderRealms()}
                                </table>
                            </div>
                        </div>
                    </div>
                </bunny-pages>
            </bunny-box>
        `;
    }

    renderRealms() {
        let list = [];

        for (let realm of this.realms) {
            let template = html`
                <tr class="realm-items noselect" @click="${this.select.bind(this, realm)}" id="realm-${realm.id}">
                    <td class="realm-item">
                        <span class="icons">
                            <div ?hidden="${!this.favourite(realm.id)}">
                                    <bunny-icon icon="favorite" class="realm-icon" id="fav-icon"></bunny-icon>
                                    <bunny-tooltip for="fav-icon" location="bottom">favorite realm</bunny-tooltip>
                            </div>
            
                            <div ?hidden="${!realm.secure}">
                                <div class="tooltip-area">
                                    <bunny-icon icon="secure" class="realm-icon" id="secure"></bunny-icon>
                                    <bunny-tooltip for="secure" location="bottom">secure connection</bunny-tooltip>
                                </div>
                            </div>
                        </span>
                    </td>
                    <td class="realm-item name">${realm.name}</td>
                    <td class="realm-item type">${realm.attributes.type}</td>
                    <td class="realm-item reset">${realm.attributes.lifetime}</td>
                    <td class="realm-item">
            <span class="${realm.populationColor}">
                ${realm.players}
            </span>
                    </td>
                    <td class="realm-item">
                        <span class="${realm.pingColor}">${realm.ping}</span>
                    </td>
                    <td class="realm-info">
                        <bunny-icon class="info" icon="info" id="info"></bunny-icon>
                        <bunny-tooltip for="info">
                            <span class="description">${realm.attributes.description}</span>
                        </bunny-tooltip>
                    </td>
                </tr>
            `;
            list.push(template);
        }
        return list;
    }
}

window.customElements.define(GameRealms.is, GameRealms);