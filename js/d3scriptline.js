function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function getTransformation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function 
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix. 
    var matrix = g.transform.baseVal.consolidate().matrix;

    // Below calculations are taken and adapted from the private function
    // transform/decompose.js of D3's module d3-interpolate.
    var { a, b, c, d, e, f } = matrix;   // ES6, if this doesn't work, use below assignment
    // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * 180 / Math.PI,
        skewX: Math.atan(skewX) * 180 / Math.PI,
        scaleX: scaleX,
        scaleY: scaleY
    };
}


function drawLineChart(params) {
    // exposed variables
    var attrs = {
        svgWidth: 700,
        svgHeight: 400,
        marginTop: 20,
        marginBottom: 50,
        marginRight: 20,
        marginLeft: 50,
        data: null,
        transTimeOut: 5000,
        groupedData : null
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

            calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
            calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;

            

            //drawing
            var svg = d3.select(this)
                .append('svg')
                .attr('width', attrs.svgWidth)
                .attr('height', attrs.svgHeight)
            // .attr("viewBox", "0 0 " + attrs.svgWidth + " " + attrs.svgHeight)
            // .attr("preserveAspectRatio", "xMidYMid meet")



            var chart = svg.append('g')
                .attr('width', calc.chartWidth)
                .attr('height', calc.chartHeight)
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + (calc.chartTopMargin + 20) + ')')


            var chartTitle = svg.append('g')
                .attr('transform', 'translate(' + calc.chartLeftMargin + ',' + calc.chartTopMargin + ')');

            // pie title 
            chartTitle.append("text")
                .text(attrs.data.title)
                .attr('fill', 'black')
                .style('font-weight', 'bold');

            debugger;



            var color = d3.scaleOrdinal(d3.schemeCategory20b);


            chart.append("g")
                .attr("transform", "translate(0," + calc.chartHeight + ")")
                .attr('stroke-width', '2')
                .attr("class", "xaxis");


            chart.append("g")
                .attr('stroke-width', '2')
                .attr("class", "yaxis");



            renderPieChart(attrs, calc);




            // ################################ Update Chart ##########################################################
            updateData = function () {
                debugger;
                renderPieChart(attrs, calc);
            }

            // ################################ Render Chart ##########################################################
            function renderPieChart(attrs, calc) {
                // -----------------------------------  Process Data -----------------------------------


                var xScale = d3.scalePoint()
                    .domain(attrs.data.data.map(function (d) { return Number(d.year); }).filter(onlyUnique))
                    .range([0, calc.chartWidth]);

                var yScale = d3.scaleLinear()
                    .domain(d3.extent(attrs.data.data, function (d) { return Number(d.value); }))
                    .range([calc.chartHeight, 0]);

                debugger;
                var groupedData = attrs.data.groupedData;  // GetGroupedDataForLineChart(attrs.data.data);

                var yAxis = d3.axisLeft().scale(yScale).tickSize(-calc.chartWidth);;
                var xAxis = d3.axisBottom().scale(xScale).tickSize(-calc.chartHeight);
                chart.selectAll("g .xaxis").transition().duration(attrs.transTimeOut).call(xAxis);
                chart.selectAll("g .yaxis").transition().duration(attrs.transTimeOut).call(yAxis);

                chart.selectAll(" .tick line")
                     .attr('stroke','lightgrey')
                     .attr('stroke-width','0.7px')
                     .attr('stroke-dasharray','5,3');
               
                chart.selectAll('.domain')
                    .attr('stroke-width','0.1px')
                    .attr('stroke','lightgrey');

                var pathline = d3.line()
                    .curve(d3.curveBasis)
                    .x(function (d) { return xScale(d.year); })
                    .y(function (d) { return yScale(d.value); });

                var line = chart.selectAll(".pathline")
                    .data(groupedData);

                var lineExit = line.exit().remove();


                line = line.enter()    
                    .append('path')
                
                    .merge(line)
                    .attr("stroke", function (d) {
                        return color(d.region);
                    })
                    .attr('stroke-width', '2')
                    .attr("fill", 'none')
                    .attr('class', 'pathline')
                    .transition()
                    .duration(attrs.transTimeOut)
                    .attr("d", function (d) { return pathline(d.data) });


                var rect = chart.selectAll('.overlay').data(['overlay']);

                rect.enter().append('rect')
                    .attr('width', calc.chartWidth)
                    .attr('height', calc.chartHeight)
                    .attr('fill', 'white')
                    .attr('class', 'overlay')
                    .transition().duration(2000)
                    .attr('transform', `translate(${calc.chartWidth})`)
                    .attr('width', 0)

                // -----------------------------------  Events  -----------------------------------
                // path.on('mouseenter', function (d) {

                // });


                // path.on('mouseout', function (d) {

                // });
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


    return main;
}
