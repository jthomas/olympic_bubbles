require(["datasift/OlympicBubbles", "datasift/TweetMonitor", "dojo/cookie", "dojo/on", "dojo/query", "dojo/topic", "dojo/NodeList-dom", "domReady!", "bootstrap"],
    function (OlympicBubbles, TweetMonitor, cookie, on, query, topic) {
        var message_count = 0;
            bubbles = new OlympicBubbles($("#chart").get(0));
            api_details = cookie("datasift_api_details");

        /**
         * Update message counter with increment message total.
         * Ensure message counter is displayed, removing connected
         * success message.
         */
        function increment_messages_received() {
            var messages = $("#messages"),
                details = $("#messages .alert-info");

            if (messages.hasClass("connected")) {
                messages.toggleClass("connected message_received");
            }

            details.text("Received " + (++message_count) + " tweets...");
        }

        /**
         * Start monitoring service, with custom user credentials.
         * On success, listen for incoming messages and display user info message.
         * On error, show error message.
         */
        function connect(details) {
            var tm = new TweetMonitor("ws://websocket.datasift.com/76601411d0ab45a89439b762f4bed120?username=" + details.username + "&api_key=" + details.key),
                promise = tm.start(),
                messages = $("#messages");

            promise.then(function () {
                messages.toggleClass("connecting connected");
                topic.subscribe("datasift/tweets/tags", increment_messages_received);
            }, function () {
                messages.toggleClass("connecting error");
            });
        }

        /**
         * Show modal login prompt to get user credentials for datasift.
         * When input fields are filled out, grab details, hide dialog
         * and trigger connection.
         * Persist details in client-side cookie so we don't ask each time.
         */
        function get_user_details() {
            var modal = $("#api_details"),
                node = modal.get(0);

            on(node, ".modal-body input:keyup", function () {
                var fields = query(".modal-body input:invalid").length;
                query(".modal-footer .btn").attr("disabled", !!fields);
            });

            on(node, ".modal-footer .btn:click", function () {
                var values = query("input").attr("value"),
                    key = values.pop(),
                    username = values.pop();

                cookie("datasift_api_details", JSON.stringify({
                    username: username,
                    key: key
                }));

                modal.modal("hide");
                connect({username: username, key: key});
            });

            modal.modal("show");
        }

        // If user hasn't previously filled out API 
        // details, then ask for them, otherwise connect!
        if (!api_details) {
            get_user_details();
        } else {
            connect(JSON.parse(api_details));
        }
    }
);
