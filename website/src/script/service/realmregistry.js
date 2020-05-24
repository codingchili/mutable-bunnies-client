/**
 * Handles the connection to the realm registry.
 */
class RealmRegistry {

    constructor() {
        this.network = new Network('client.realmregistry.node');
    }

    list(callback) {
        this.network.rest(callback, 'realmlist');
    }

    realmtoken(callback, realmId) {
        this.network.rest(callback, 'realmtoken', {
           'realm': realmId,
            'token': application.token
        });
    }
}