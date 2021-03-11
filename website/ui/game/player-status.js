import {html, render} from '/node_modules/lit-html/lit-html.js';
import {repeat} from '/node_modules/lit-html/directives/repeat.js';

import '../../component/bunny-tooltip.js'
import '../../component/bunny-progress.js'
import '../../component/bunny-box.js'
import './stats-view.js'

class PlayerStatus extends HTMLElement {

    static get is() {
        return 'player-status';
    }

    constructor() {
        super();
        this.afflictions = [];
        this.compact = this.hasAttribute('compact');
        this._target = {
            stats: {}
        };

        setInterval(this.render.bind(this), 1000);

        application.onGameLoaded(this._listen.bind(this));
        application.onRealmLoaded(realm => this.realm = realm);
    }

    get target() {
        return this._target;
    }

    set target(value) {
        if (value) {
            value.stats = value.stats || {
                health: 0,
                maxhealth: 100,
                energy: 0,
                maxenergy: 100,
                experience: 0,
                nextlevel: 100
            };
            this._target = value;
            this.afflictions = this._target.afflictions || [];

            if (this.shadowRoot) {
                this.render();
            }
        }
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.render();

        if (this.compact) {
            this.query('#health-bar').classList.add('health-bar-mini');
            this.query('.frame').classList.add('frame-mini');
            this.query('#portrait').classList.add('portrait-mini');
            this.query('#afflictions').classList.add('afflictions-mini');
            this.query('#class-icon').classList.add('class-icon-mini');
            this.style.width = '276px';
        }
    }

    _targeting() {
        game.publish('character-target', this.target);
    }

    _integer(number) {
        if (number) {
            return Math.round(number).toLocaleString();
        } else {
            return 0;
        }
    }

    _listen() {
        game.subscribe('character-update', (creature) => {
            if (creature.id === this.target.id) {
                this._updatePlayerState(creature);
            }
        });
    }

    _portrait() {
        if (this.target && this.realm && this.target.classId) {
            return `${this.realm.resources}/gui/class/${this.target.classId}.svg`;
        } else {
            //return 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
            if (this.target?.model?.graphics?.endsWith('.png')) {
                return `${this.realm.resources}${this.target.model.graphics}`
            } else {
                return "";
            }
        }
    }

    _updatePlayerState(target) {
        if (target.afflictions) {
            this.afflictions = target.afflictions;
        }

        this.render();
        this.query('#stats').selected = target;
    }


    _description(affliction) {
        return eval('`' + affliction.description + '`');
    }

    get template() {
        let percent = (this.target.stats.experience / this.target.stats.nextlevel * 100).toFixed(1);

        return html`
            <style>
                :host {
                    position: absolute;
                    left: 16px;
                    top: 16px;
                    width: 408px;
                    z-index: 600;
                }

                .frame {
                    display: block;
                    height: 68px;
                    z-index: 400;
                }

                .portrait {
                    max-height: 42px;
                    margin: auto;
                    display: block;
                }

                .name {
                    display: block;
                    position: absolute;
                    left: 66px;
                    opacity: 0.86;
                    top: 12px;
                }

                .health-bar {
                    margin-left: 64px;
                    margin-right: 8px;
                    margin-top: 32px;
                    padding: 4px;
                    --bunny-progress-active-color: #8c0006;
                    --bunny-progress-container-color: #8c000632;
                }

                .energy-bar {
                    top: 32px;
                    left: 64px;
                    margin-left: 64px;
                    margin-right: 8px;
                    margin-top: 4px;
                    padding: 4px;
                    --bunny-progress-active-color: #4db6ac;
                    --bunny-progress-container-color: #4db6ac32;
                }

                .level {
                    display: block;
                    position: absolute;
                    top: 8px;
                    right: 14px;
                    width: 48px;
                    text-align: right;
                    font-size: larger;
                }

                .exp-bar {
                    width: 46px;
                    margin-top: -12px;
                    padding: 4px;
                    margin-left: 6px;
                    --bunny-progress-active-color: #DBC501;
                    --bunny-progress-container-color: #DBC50164;
                }

                .health-bar > paper-progress {
                    width: 100%;
                }

                .energy-bar > paper-progress {
                    width: 100%;
                }

                .exp-bar > paper-progress {
                    width: 100%;
                }

                .class-icon {
                    position: absolute;
                    width: 42px;
                    height: 42px;
                    margin-top: 4px;
                    margin-left: 10px;
                }

                /* compact display classes ends with -mini. */
                .health-bar-mini {
                    margin-top: 8px;
                }

                .portrait-mini {
                    width: 24px;
                    height: 24px;
                    left: 8px;
                    top: -2px;
                    position: absolute;
                }

                .frame-mini {
                    height: 40px;
                    width: 276px;
                }

                .afflictions-mini {
                    position: absolute !important;
                    left: 212px;
                    top: -4px;
                }

                #afflictions {
                    margin-left: 68px;
                    display: flex;
                    flex-wrap: wrap;
                    z-index: 500;
                    flex-direction: row;
                    width: 296px;
                    position: relative;
                }

                .class-icon-mini {
                    /*position: unset;*/
                }

                @media (max-width: 868px) {
                    .gm-tag { display: none; }
                    .level { display: none; }
                    .name { display: none; }
                    
                    :host {
                        top: 0px;
                        left: 0;
                        right: 0 !important;
                        width: 20%;
                        min-width: 200px;
                    }
                    
                    .class-icon {
                        width: 24px;
                        margin-left: 22px;
                    }
                    
                    .portrait {
                        max-height: 24px;
                    }
                    
                    .health-bar {
                        margin-top: 8px;
                    }
                    
                    .frame {
                        height: 42px;
                    }
                }

                .affliction-icon {
                    max-width: 24px;
                    max-height: 24px;
                    margin: auto;
                    display: block;
                    margin-top: 4px;
                }

                @keyframes fadein {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .affliction {
                    min-width: 38px;
                    min-height: 38px;
                    padding: 4px;
                    margin-top: 2px;
                    animation: fadein 0.72s ease 1;
                }

                .duration {
                    color: #00b0ff;
                }

                .info-table {
                    margin-top: 12px;
                    width: 100%;
                }

                .title {
                    font-size: larger;
                }

                .description {
                    margin-top: 12px;
                    display: block;
                    font-size: small;
                }

                .class-stats {
                    font-size: 16px;
                    width: 176px;
                }

                .stats-tooltip {
                    margin-left: 64px;
                    z-index: 600;
                }

                .class-stats {
                    z-index: 600;
                }

                img[src=""] {
                    /*display: none;*/
                }

                .stats-level {
                    display: block;
                    right: 12px;
                    position: absolute;
                    top: 12px;
                    font-size: 16px;
                }

                .stats-description {
                    font-size: 14px;
                    display: block;
                    margin-top: 8px;
                }

                #stats {
                    margin-top: 8px;
                }

                .spell-info {
                    width: 192px;
                }

                .noselect {
                    user-select: none;
                }

                .gm-tag {
                    color: #fff900;
                    text-shadow: #212121;
                    font-weight: bold;
                    position: absolute;
                    left: 42px;
                    right: 0;
                    text-align: center;
                    font-size: small;
                    margin-top: 8px;
                    opacity: 0.86;
                }

            </style>


            <bunny-box @touchstart="${e => e.stopPropagation()}" border id="frame" class="noselect frame">

                <slot></slot>

                ${this.compact ? null : html`
                    <span class="level">${this.target.stats.level}</span>
                    <span class="name">${this.target.name}</span>
                `}

                <div @click="${this._targeting.bind(this)}" class="class-icon" id="class-icon">
                    <img id="portrait" class="portrait" src="${this._portrait(this.target, this.realm)}">
                </div>
                <bunny-tooltip animation-delay="0" position="bottom" class="stats-tooltip" for="class-icon">
                    <div class="class-stats">
                        <span class="stats-header">${this.target.name}</span>
                        ${this.target.creature ? html`
                                <span class="stats-level">lv. ${this.target.stats.level}</span>
                                <stats-view id="stats" compact="true" .selected="${this.target}"
                                            style="display:block"></stats-view>
                            ` : html`
                            `}
                        <span class="stats-description">
                            ${this.target?.attributes?.description ?? ''}
                        </span>
                    </div>
                </bunny-tooltip>

                <div class="gm-tag">${this.realm.admins.includes(this.target.account) && !this.compact ? html`&#x2B50;` : ''}</div>

                <div class="health-bar" id="health-bar">
                    <bunny-progress class="transiting" max="${this.target.stats.maxhealth}"
                                    value="${this.target.stats.health}"></bunny-progress>
                </div>
                <bunny-tooltip>
                    <span>${this._integer(this.target.stats.health)} / ${this._integer(this.target.stats.maxhealth)}</span>
                </bunny-tooltip>

                <div class="energy-bar">
                    <bunny-progress class="transiting" max="${this.target.stats.maxenergy}"
                                    value="${this.target.stats.energy}"></bunny-progress>
                </div>
                <bunny-tooltip>
                    <span>${this._integer(this.target.stats.energy)} / ${this._integer(this.target.stats.maxenergy)}</span>
                </bunny-tooltip>

                <div class="exp-bar">
                    <bunny-progress class="transiting" max="${this.target.stats.nextlevel}"
                                    value="${this.target.stats.experience}"></bunny-progress>
                </div>
                <bunny-tooltip location="right">
                    <span>${this._integer(this.target.stats.experience)} / ${this._integer(this.target.stats.nextlevel)} (${percent}
                        %)</span>
                </bunny-tooltip>

            </bunny-box>

            <div id="afflictions">
                ${repeat(this.afflictions, affliction => affliction.id, this.afflictionHtml.bind(this))}
            </div>

        `;
    }

    afflictionHtml(active) {
        return html`
            <bunny-box border class="affliction">
                <img src="${this.realm.resources}gui/afflictions/${active.affliction.id}.svg" class="affliction-icon"
                     alt="affliction">
            </bunny-box>
            <bunny-tooltip class="spell-info" position="bottom">
                <div>
                    <span class="title">${active.affliction.name}</span>

                    <table class="info-table">
                        <tr>
                            <th>Duration</th>
                        </tr>
                        <tr style="text-align: center;">
                            <td class="duration">${active.duration}s</td>
                        </tr>
                    </table>

                    <span class="description">${this._description(active.affliction)}</span>
                </div>
            </bunny-tooltip>
        `;
    }

    render() {
        render(this.template, this.shadowRoot);
        this.bind();
    }

    query(selector) {
        return this.shadowRoot.querySelector(selector);
    }

    bind() {
    }
}

customElements.define(PlayerStatus.is, PlayerStatus);