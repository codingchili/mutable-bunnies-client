/**
 * Realmserver api.
 */
class RealmServer {

    constructor(realm) {
        this.realm = realm;
        this.connection = new Connection(realm);
        this.connection.disconnected = () => {
            setTimeout(this.retry.bind(this), this.reconnectBackoff())
        }
    }

    reconnectBackoff() {
        if (application.development.fastReconnect) {
            return 250;
        } else {
            return 2500;
        }
    }

    connect(callback) {
        this.connection.send('connect', {
            token: this.realm.token
        }, callback);
    }

    retry() {
        application.error({
            retrying: true,
            text: `Reconnecting to ${this.realm.name}`,
            callback: application.logout
        });
        this.connection.connect().then(() => {
            this.connect(() => {
                game.onScriptsLoaded({
                    accepted: () => {
                        application.error(null);
                    },
                    error: (e) => {
                        game.shutdown(true);
                    }
                });
            });
        }).catch(() => {
            // reconnection failed, reconnect scheduled by disconnect handler.
        });
    }

    characterlist(callback) {
        this.connection.send('character.list', {}, callback);
    }

    afflictioninfo(callback) {
        this.connection.send('afflictioninfo', {}, callback);
    }

    spellinfo(callback) {
        this.connection.send('spellinfo', {}, callback);
    }

    classinfo(callback) {
        this.connection.send('classinfo', {}, callback);
    }

    create(callback, classId, characterName) {
        this.connection.send('character.create', {
            classId: classId,
            character: characterName
        }, callback);
    }

    remove(callback, characterName) {
        this.connection.send('character.remove', {
            character: characterName
        }, callback);
    }

    join(callback, characterName) {
        this.connection.send('join', {
            character: characterName
        }, callback);
    }

    leave() {
        this.connection.send('leave', {}, {
            accepted: () => {
                // disconnected successfully.
                console.log('on player leave')
            },
            error: (e) => {
                // failed to disconnect gracefully - connection might have closed already.
            }
        });
    }

    close() {
        this.connection.close();
    }

    static ping(callback, realm) {
        new Network()
            .setProtocol(realm.secure ? 'https://' : 'http://')
            .setPort(realm.port)
            .setHost(realm.host)
            .ping(callback);
    }
}

window.RealmServer = RealmServer;