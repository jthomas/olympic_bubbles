define(["compose/compose", "dojo/topic", "dojo/Deferred", "./Topics"],
    /**
     * Broadcast real-time mentions of Olympic sport categories, 
     * simple bridge between WebSocket channel delivering tagged
     * messages and client-side pub-sub.
     *
     * On each new message, find and broadcast tagged categories 
     * with single occurance count.
     *
     * @author James Thomas
     * @class
     */
    function (compose, topic, Deferred, Topics) {

        /**
         * Initialise with DataSift WebSocket endpoint to receive
         * tagged olympic sport messages.
         *
         * @param {String} endpoint - WebSockets endpoint
         * @constructor
         */
        var ctor = function (endpoint) {
            this.endpoint = endpoint;
        };

        return compose(ctor, {
            /**
             * WebSocket connection reference.
             * 
             * @type {WebSocket} socket - Current connection
             */
            socket: null,

            /**
             * Start listening for messages from backend
             * endpoint.
             *
             * @return {Promise} Deferred connection response
             */
            start: function () {
                var deferred = new Deferred();

                this.socket = new WebSocket(this.endpoint);
                this.socket.onmessage = this.onmessage;
                this.socket.onopen = deferred.resolve;
                this.socket.onerror = deferred.reject;

                return deferred.promise;
            },

            /**
             * Stop listening for messages from backend
             * endpoint.
             */
            stop: function () {
                this.socket.close();
            },

            /**
             * Event handler for new websocket messages,
             * re-broadcast sport categories locally.
             *
             * @param {Object} message - Message details
             */
            onmessage: function (message) {
                var stats = JSON.parse(message.data),
                    tags = stats.interaction.tags || [];

                tags.forEach(function (tag) {
                    var message = {};
                    message[tag] = 1;
                    topic.publish(Topics.TAGS, message);
                }, this);
            }
        });
});
