define(["d3", "compose/compose", "dojo/topic", "./Topics", "./Sports"],
    /**
     * Display "bubbles" representing olympic sports, size of each 
     * bubble corresponds to relative frequency of mentions, packed together
     * in invisible parent node.
     *
     * Draw a circle for each olympic sport, using the D3 "pack" layout algorithm
     * to determine the locations, starting with equal radius sizes. Each bubble 
     * has the sport label displayed within the centre. Sports arbitarily grouped
     * into twenty distnct groups to determine "bubble" colour.
     *
     * Once rendered, start listening for messages indicating real-time sport 
     * mentions over pub-sub. Increment relative counts locally and re-render 
     * graph, transitioning nodes into new positions with updated attributes.
     *
     * @author James Thomas
     * @class
     */
    function (d3, compose, topic, Topics, Sports) {

        /**
         * Set-up instance parameters, render initial bubbles 
         * graph and start listening for sport mention counts.
         *
         * @param {DOMNode} node - DOM node to attach graph to
         * @constructor
         */
        var ctor = function (node) {
            this.node = node;
            this.sports = {};

            // Initialise frequency counts to non-zero integer 
            // to ensure equally sized bubbles rendered.
            Sports.LABELS.forEach(function (sport) {
                this.sports[sport] = 1;
            }, this);

            this.initialise();
            topic.subscribe(Topics.TAGS, this.update.bind(this));
        };

        return compose(ctor, {
            /**
             * Document node to contain rendered graph 
             *
             * @type {DOMNode}
             */
            node: null,

            /**
             * Size of rendered chart, width & height.
             *
             * @type {Number}
             */
            length: 800,

            /**
             * Duration of bubble transitions, ms.
             *
             * @type {Number}
             */
            duration: 3000,

            /**
             * Instantited D3 layout, will be "pack" algorthim.
             *
             * @type {Object}
             */
            layout: null,

            /**
             * Render "Olympic Bubbles" using as SVG chart using D3, 
             * each sport represented by a single bubble with label. 
             * Position bubbles as packed within parent bubble, using 
             * "pack" layout.
             */
            initialise: function () {
                var format = d3.format(",d"),
                    fill = d3.scale.category20c(),
                    capitalise = this._capitialise.bind(this),
                    offset = this._offset.bind(this);

                this.layout = d3.layout.pack().sort(null).size([this.length, this.length]);

                this.vis = d3.select(this.node).append("svg")
                    .attr("width", this.length)
                    .attr("height", this.length);

                // Generate SVG container node to hold text and circle elements
                this.chart = this.vis.selectAll("g.node")
                    .data(this.layout.nodes({children: d3.entries(this.sports)}))
                    .enter().append("g")
                    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });

                // Append circle with radius from layout and fill with arbitary colour
                this.chart.append("circle")
                    .attr("r", function (d) { return d.r; })
                    .style("fill", function (d) { return d.key && fill(d.key); });

                // Add text label to bubble. 
                // If label has mulitple lines, we have to manually calculate and set the 
                // vertical offset to simulate flowing text. 
                this.chart.append("text")
                    .attr("text-anchor", "middle")
                    // Ensure font-size is relative to containing radius of the circle
                    .attr("font-size", function (d) { return (d.r / 50) + "em"; })
                    .each(function (d, i) {
                        var words = (d.key || "").split("_"),
                            select = d3.select(this);

                        words.forEach(function (word, i) {
                            var dy = (i ? 1 : offset(words.length));
                            select.append("tspan")
                                .attr("dy", dy + "em")
                                .attr("x", "0")
                                .text(capitalise(word));
                        });
                    });
            },

            /**
             * Re-render sport bubbles with updated frequency counts.
             *
             * Increase sport mentions from parameter and then set up transition
             * effect to move bubble nodes to their new positions, based upon re-calculating
             * layout. Ensure label font-size and circle radiuses are also updated.
             *
             * @param {Object} sports - Count of the new mentions of olympic sports,
             *  indexed by sport name.
             */
            update: function (sports) {
                // Update internal total counts 
                d3.keys(sports).forEach(function (sport) {
                    this.sports[sport] = this.sports[sport] + sports[sport];
                }, this);

                // Re-calculate layout positions from updated data
                this.chart.data(this.layout.nodes({children: d3.entries(this.sports)}));

                // Move bubble node to new position
                var trans = this.chart
                    .transition()
                    .duration(this.duration)
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                    .attr("r", function(d) { return d.r; });

                // ... update circle radius
                trans.select("circle")
                    .transition()
                    .attr("r", function(d) { return d.r; });

                // ... update text size
                trans.select("text")
                    .transition()
                    .attr("font-size", function (d) { return ((d.r / 50)) + "em"; });
            },

            /**
             * Return capitialised version of text string,
             * i.e. word -> Word
             * 
             * @param {String} word - Single word
             * @private
             */
            _capitialise: function (word) {
                return word.charAt(0).toUpperCase() + word.substring(1);
            },

            /**
             * Return vertical offset, in ems, for text line based 
             * upon current lines left. 
             * Rough calculation for 1, 2 or 3 lines, not a generic solution.
             * 
             * @param {Number} lines - Number of text lines
             * @private
             */
            _offset: function (lines) {
                return 0.3 + ((lines - 1) * -0.5);
            }
        });
});
