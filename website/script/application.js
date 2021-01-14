/**
 * @author Robin Duda
 *
 * Used to pass application-level events between components.
 */

class Application {

    constructor() {
        this.bus = new EventBus();
        this.settings = localStorage.getItem('app-settings');

        if (this.settings) {
            this.settings = JSON.parse(this.settings);
        } else {
            this.settings = this.defaults();
        }
        this.development = this.settings.development;

        window.onbeforeunload = () => {
            this.publish('unload', this.settings);
            localStorage.setItem('app-settings', JSON.stringify(this.settings));
        };

        if (this.development.clearCache) {
            localStorage.clear();
        }
    }

    defaults() {
        return {
            fullscreen: true,
            development: {
                skipStart: false,
                autologin: false,
                selectFirstRealm: false,
                selectFirstCharacter: false,
                fastReconnect: false,
                clearCache: false,
                rightClick: false,
                logEvents: false,
                hardResetXY: false,
                metrics: false,
                designer: false,
                login: {
                    user: 'admin',
                    pwd: ''
                }
            }
        };
    }

    reset() {
        this.settings = this.defaults();
        location.reload();
    }

    realmLoaded(realm) {
        realm.isAdmin = (account) => realm.admins.includes(account || application.account.username);
        application.realm = realm;
        application.publish('onRealmLoaded', realm);
    }

    characterLoaded(character) {
        application.character = character;
        application.publish('onCharacterLoaded', character);
    }

    characterUpdate(character) {
        application.publish('onCharacterUpdate', character);
    }

    authenticated(authentication) {
        application.token = authentication.token;
        application.account = authentication.account;
        application.view('game-realms');
        application.publish('onAuthentication', application);
    }

    error(error) {
        if (typeof error === 'string') {
            error = {text: error, callback: application.logout};
        }
        application.publish('onError', error);
    }

    kill(disconnect) {
        if (typeof game !== 'undefined') {
            try {
                game.shutdown(disconnect);
            } catch (e) {
                console.log(e);
            }
        }
    }

    selectRealm(realm) {
        application.realm = realm;
        application.publish('onRealmSelect', application.realm);
        application.showCharacters();
    }

    logout() {
        application.publish('onLogout', {});
        application.showLogin();
    }

    selectCharacter(event) {
        this.character = event.character;
        this.server = event.server;
        application.publish('onCharacterSelect', event);
        application.showPatcher();
    }

    updateComplete(event) {
        application.publish('onCompleteUpdate', event);
    }

    loadedVersion(event) {
        application.publish('onVersion', event);
        this.version = event;
    }

    onCompleteUpdate(callback) {
        application.subscribe('onCompleteUpdate', callback);
    }

    onAuthentication(callback) {
        application.subscribe('onAuthentication', callback);
    }

    onRealmSelect(callback) {
        application.subscribe('onRealmSelect', callback);
    }

    onError(callback) {
        application.subscribe('onError', callback);
    }

    dialogEvent(dialog) {
        application.publish('dialog', dialog);
    }

    onDialogEvent(callback) {
        application.subscribe('dialog', callback);
    }

    onLogout(callback) {
        application.subscribe('onLogout', callback);
    }

    onRealmLoaded(callback) {
        if (application.realm) {
            callback(application.realm);
        }
        application.subscribe('onRealmLoaded', callback);
    }

    onCharacterSelect(callback) {
        application.subscribe('onCharacterSelect', callback);
    }

    onCharacterLoaded(callback) {
        if (application.character) {
            callback(application.character);
        }
        application.subscribe('onCharacterLoaded', callback);
    }

    onCharacterUpdate(callback) {
        application.subscribe('onCharacterUpdate', callback);
    }

    onScriptsLoaded(callback) {
        if (this.scripts) {
            callback();
        }
        application.subscribe('onScriptsLoaded', callback);
    }

    onScriptShutdown(callback) {
        application.subscribe('onScriptShutdown', callback);
    }

    scriptsLoaded() {
        this.scripts = true;
        application.publish('onScriptsLoaded', {});
    }

    onGameLoaded(callback) {
        if (this.game) {
            callback(this.game);
        }
        this.subscribe('onGameLoaded', callback);
    }

    gameLoaded(game) {
        this.game = game;
        this.publish('onGameLoaded', game);
    }

    scriptShutdown() {
        this.game = false;
        this.scripts = false;
        application.publish('onScriptShutdown', {});
    }

    onVersion(callback) {
        application.subscribe('onVersion', callback);

        if (this.version) {
            callback(this.version)
        }
    }

    showLogin() {
        application.view('page-login');
    }

    showRealms() {
        application.view('game-realms');
    }

    onRealmSelect(callback) {
        application.subscribe('onRealmSelect', callback);
    }

    showCharacters() {
        application.view('game-characters');
    }

    showPatcher() {
        application.view('patch-download');
    }

    showGame() {
        application.view('game-view');
    }

    showStart() {
        application.view('page');
        application.publish('onViewStart', {});
    }

    showOffline() {
        application.view('offline-view');
    }

    view(view) {
        this.publish('view', view);
    }

    subscribe(event, callback) {
        this.bus.subscribe(event, callback);
    }

    publish(event, data) {
        this.bus.publish(event, data);
    }
}

window.onerror = (msg, url, line, column, error) => {
    // special error handling for indirect eval of game scripts.
    // modify the error stack to remove 64kb of url encoded script.
    error.stack = error.stack.substring(0, 128);
    return false; // pass responsibility.
};

var application = new Application();