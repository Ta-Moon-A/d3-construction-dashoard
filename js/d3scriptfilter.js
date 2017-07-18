function renderFilter(params) {
    // exposed variables
    var attrs = {
        svgWidth: 630,
        svgHeight: 100,
        marginTop: 50,
        marginBottom: 5,
        marginRight: 10,
        marginLeft: 50,
        data: null,
        filterHeight: 40
    };


    /*############### IF EXISTS OVERWRITE ATTRIBUTES FROM PASSED PARAM  #######  */

    var attrKeys = Object.keys(attrs);
    attrKeys.forEach(function (key) {
        if (params && params[key]) {
            attrs[key] = params[key];
        }
    })


    //innerFunctions
    var updateData;


    //main chart object
    var main = function (selection) {
        selection.each(function () {

            //calculated properties
            var calc = {}

            calc.chartLeftMargin = attrs.marginLeft;
            calc.chartTopMargin = attrs.marginTop;
            calc.marginRight = attrs.marginRight;

            calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
            calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
            calc.filterHeight = attrs.filterHeight;
            debugger;
            //drawing
            var svg = d3.select(this)
                .append('svg')
                .attr('width', attrs.svgWidth)
                .attr('height', attrs.svgHeight)
                .style('overflow', 'visible');


            var chart = svg.append('g')
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + (calc.chartTopMargin + 10) + ')')


            var chartTitle = svg.append('g')
                .attr('transform', 'translate(' + calc.chartLeftMargin + ',' + calc.chartTopMargin + ')');

            // pie title 
            chartTitle.append("text")
                .text(attrs.data.title)
                .attr('fill', 'black')
                .style('font-weight', 'bold');



            // Scale
            var xScale = d3.scalePoint()
                .domain(attrs.data.data)
                .range([0, attrs.svgWidth]);

            var brushContainer = chart.append("g")
                .attr("class", "brush")
                .attr("fill", "#b1d39c")
                .attr("fill-opacity", "0.3")
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .attr("stroke-opacity", "0.3");

            var brush = d3.brushX()
                .extent([[0, 0], [attrs.svgWidth, calc.filterHeight]])
                .on("brush end", brushed);


            // Text
            brushContainer.append("text")
                .attr("transform", "translate(" + calc.chartLeftMargin + "," + (calc.filterHeight - 10) + ")")
                .text("Click and drag here");

            // Axes
            var xAxis = d3.axisBottom().scale(xScale).tickSize(5);

            brushContainer.call(xAxis);
            brushContainer.call(brush)
                .call(brush.move, xScale.range());

            brushContainer.selectAll("rect")
                .attr("y", 0)
                .attr("height", calc.filterHeight);


            function brushed() {
               
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                // alert('dfgdfgfdg');
                // var s = d3.event.selection || x2.range();
                // x.domain(s.map(x2.invert, x2));
                // focus.select(".area").attr("d", area);
                // focus.select(".axis--x").call(xAxis);
                // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                //     .scale(width / (s[1] - s[0]))
                //     .translate(-s[0], 0));
            }


            // smoothly handle data updating
            updateData = function () {


            }


        });
    };





    ['svgWidth', 'svgHeight'].forEach(key => {
        // Attach variables to main function
        return main[key] = function (_) {
            var string = `attrs['${key}'] = _`;
            if (!arguments.length) { eval(`return attrs['${key}']`); }
            eval(string);
            return main;
        };
    });




    //exposed update functions
    main.data = function (value) {
        if (!arguments.length) return attrs.data;
        attrs.data = value;
        if (typeof updateData === 'function') {
            updateData();
        }
        return main;
    }


    main.onFilterChange = function (chartUpdateFunc) {
        //  attrs.chartUpdateFunc = chartUpdateFunc;
        return main;
    }

    return main;
}
