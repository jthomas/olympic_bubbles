Olympic Bubbles
===

Experiment using D3 JavaScript visualisation library with the DataSift Streaming API
to monitor Twitter for messages about different sports in the London 2012 Olympic Games.

Custom DataSift stream categorises messages about the London Olympics that mention each of the sports,
tagging each message with a category. We use a WebSocket connection to stream discovered messages to the browser.

Uses the D3 "pack" layout algorithm to draw circles for each of the sports, with the radius proportional
to the frequency of messages received for that sport. As the relative frequencies are changed over time,
circles are transitioned to their new position, with updated size.

How to run
--

* $ git clone git://github.com/jthomas/olympic_bubbles.git
* $ git submodule init
* $ git submodule update 
* Open "index.html" in a modern browser.

Browser Support
--

Tested in latest Chrome and Firefox. Definitely won't work in Internet Explorer 6, 7, 8...
