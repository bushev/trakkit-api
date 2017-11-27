'use strict';

const faye = require('faye');

class Trakkit {

    /**
     * TRAKKIT API Class
     *
     * @param options {object}
     * @param options.apiEndpoint {string} - TRAKKIT API endpoint ()
     * @param options.token {string} - API token
     * @param [options.debug] {boolean} - Enable debug mode
     */
    constructor(options) {

        if (!options.apiEndpoint) throw new Error(`Trakkit: apiEndpoint required`);
        if (!options.token) throw new Error(`Trakkit: token required`);

        this.apiEndpoint = options.apiEndpoint;
        this.token       = options.token;
        this.debug       = options.debug;

        this.fayeClient    = null;
        this.subscriptions = {};
    }

    /**
     * Subscribe on event
     *
     * @param event {string} - Event name, ex: DEVICE_LOCATION
     * @param options {object} - Subscribe information
     * @param [options.deviceId] {string} - Device ID
     * @param subscribeCallback {function} - Callback will be called on successful subscribe
     * @param eventCallback {function} - Callback will be called on event received
     */
    subscribe(event, options, subscribeCallback, eventCallback) {

        switch (event) {
            case 'DEVICE_LOCATION':
                this.doSubscribe(`/devices/${options.deviceId}/location`, subscribeCallback, eventCallback);
                break;
            default:
                subscribeCallback(new Error(`Trakkit::subscribe: unexpected event name: "${event}"`));
        }
    }

    /**
     * @private
     *
     * @param topic {string}
     * @param subscribeCallback {function}
     * @param eventCallback {function}
     */
    doSubscribe(topic, subscribeCallback, eventCallback) {

        if (this.fayeClient === null) {

            this.fayeClient = new faye.Client(this.apiEndpoint);

            this.fayeClient.addExtension({
                outgoing: (message, callback) => {
                    message.ext       = message.ext || {};
                    message.ext.token = this.token;
                    callback(message);
                }
            });

            if (this.debug) {

                this.fayeClient.bind('transport:down', () => {
                    console.log('Trakkit [ CONNECTION DOWN]');
                });

                this.fayeClient.bind('transport:up', () => {
                    console.log('Trakkit [ CONNECTION UP]');
                });
            }
        }

        if (this.subscriptions[topic]) {

            return subscribeCallback(new Error(`Trakkit::doSubscribe: Already subscribed on topic "${topic}"`));
        }

        const subscription = this.fayeClient.subscribe(topic, payload => {
            if (this.debug) console.log(payload);
            eventCallback(payload)
        });

        this.subscriptions[topic] = {
            subscription,
            unsubscribe: () => {
                if (this.debug) console.log(`Trakkit [ UNSUBSCRIBE '${topic}']`);

                this.fayeClient.unsubscribe(topic, subscription);
                delete this.subscriptions[topic];
            }
        };

        subscription.callback(() => {
            if (this.debug) console.log('Trakkit [ SUBSCRIBE SUCCEEDED]');
            subscribeCallback(null, this.subscriptions[topic]);
        });

        subscription.errback(err => {
            if (this.debug) console.log('Trakkit [ SUBSCRIBE FAILED]', err);
            delete this.subscriptions[topic];
            subscribeCallback(err);
        });
    }
}

/**
 * Export Class
 *
 * @type {Trakkit}
 */
module.exports = Trakkit;
