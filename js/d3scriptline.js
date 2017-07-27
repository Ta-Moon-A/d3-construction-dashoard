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
        transTimeOut: 1000,
        groupedData: null,
        slicesOpacity: 0.3,
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

            //################################   FILTERS  &   SHADOWS  ##################################

            // Add filters ( Shadows)
            var defs = svg.append("defs");

            calc.dropShadowUrl = "id";
            calc.filterUrl = `url(#id)`;
            //Drop shadow filter
            var dropShadowFilter = defs
                .append("filter")
                .attr("id", 'id')
                .attr("height", "130%");
            dropShadowFilter
                .append("feGaussianBlur")
                .attr("in", "SourceAlpha")
                .attr("stdDeviation", 5)
                .attr("result", "blur");
            dropShadowFilter
                .append("feOffset")
                .attr("in", "blur")
                .attr("dx", 2)
                .attr("dy", 4)
                .attr("result", "offsetBlur");

            dropShadowFilter
                .append("feFlood")
                .attr("flood-color", "black")
                .attr("flood-opacity", "0.4")
                .attr("result", "offsetColor");
            dropShadowFilter
                .append("feComposite")
                .attr("in", "offsetColor")
                .attr("in2", "offsetBlur")
                .attr("operator", "in")
                .attr("result", "offsetBlur");

            var feMerge = dropShadowFilter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "offsetBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");

            // ################################ FILTERS  &   SHADOWS  END ##################################


            var chart = svg.append('g')

                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + (calc.chartTopMargin + 20) + ')');

                chart.append('rect')
                .attr('width', calc.chartWidth)
                .attr('height', calc.chartHeight)
                .attr('fill', 'white')
                .attr('pointer-events', 'all')
                ;

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
                    .attr('stroke', 'lightgrey')
                    .attr('stroke-width', '0.7px')
                    .attr('stroke-dasharray', '5,3');

                chart.selectAll('.domain')
                    .attr('stroke-width', '0.1px')
                    .attr('stroke', 'lightgrey');



                var pathline = d3.line()
                    .curve(d3.curveCardinal)
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
                    .attr('stroke-width', '3')
                    .attr("fill", 'none')
                    .attr('class', 'pathline');


                line.transition()
                    .ease(d3.easeLinear)
                    .duration(attrs.transTimeOut)
                    .attrTween("d", function (d) { return pathTween(pathline(d.data), 4, this) });


                var rect = chart.selectAll('.overlay').data(['overlay']);

                rect.enter().append('rect')
                    .attr('width', calc.chartWidth)
                    .attr('height', calc.chartHeight)
                    .attr('fill', 'none')
                    .attr('class', 'overlay')
                    .transition().duration(2000)
                    .attr('transform', `translate(${calc.chartWidth})`)
                    .attr('width', 0)


                var dots = chart.selectAll("circle")
                    .data(function (d) { d; return attrs.data.data; });

                var dotsExit = dots.exit().remove();


                dots = dots.enter().append("circle")
                    .merge(dots)
                    .attr("r", 3)
                    .attr("class", "circle")
                    .attr('fill', '#2F4F4F')
                    .attr('stroke', '#8FBC8F')
                    .attr("stroke-width", 5)
                    .attr('opacity', '0.5');


                dots.transition().ease(d3.easeLinear).duration(attrs.transTimeOut)
                    .attr("cx", function (d) { return xScale(Number(d.year)); })
                    .attr("cy", function (d) { return yScale(Number(d.value)); });




                // -----------------------------------  Events  -----------------------------------
                line.on('mouseenter', function (d) {
                    // shadow 
                    d3.select(this).attr('filter', calc.filterUrl);

                    // visibility 
                    line.filter(v => v != d).attr('opacity', attrs.slicesOpacity);

                    // get selected line upper 
                    chart.selectAll(".pathline").sort(function (a, b) { // select the parent and sort the path's     
                        if (a.region != d.region) return -1; // a is not the hovered element, send "a" to the back     
                        else return 1; // a is the hovered element, bring "a" to the front     
                    });

                });


                line.on('mouseout', function (d) {
                    line.attr('opacity', 1).attr('filter', 'none');
                });


                dots.on("mouseover", function (d) {
                    circle = d3.select(this);
                    circleTransition(circle);
                })
                dots.on("mouseout", function (d) {
                    circle = d3.select(this)
                        .transition()
                        .duration(500)
                        .attr("r", 3)
                        .attr("stroke-width", 5);
                });


                chart.on("mouseover", function (d) {
                  var mouseX = d3.event.pageX - calc.chartLeftMargin;
                    var mouseY = d3.event.pageY - calc.chartTopMargin - 20;

                    console.log('mouseX ' + mouseX + ' mouseY ' + mouseY);
                });





                // -------------------------------------  helpers -----------------------------------------------
                function circleTransition(circle) {

                    repeat();

                    function repeat() {
                        circle.transition()
                            .duration(500)
                            .attr('stroke-width', '5')
                            .attr("r", 3)

                            .transition()
                            .duration(500)
                            .attr('stroke-width', '0.5')
                            .attr("r", 10)
                            //.ease('sine')    
                            .on("end", repeat);
                    };

                };

                function pathTween(d1, precision, path0) {
                    var path1 = path0.cloneNode(),
                        n0 = path0.getTotalLength(),
                        n1 = (path1.setAttribute("d", d1), path1).getTotalLength();
                    // Uniform sampling of distance based on specified precision.
                    var distances = [0], i = 0, dt = precision / Math.max(n0, n1);
                    while ((i += dt) < 1) {
                        distances.push(i);
                    }
                    distances.push(1);
                    // Compute point-interpolators at each distance.
                    var points = distances.map(function (t) {
                        var p0 = path0.getPointAtLength(t * n0),
                            p1 = path1.getPointAtLength(t * n1);
                        return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
                    });
                    return function (t) {
                        return "M" + points.map(function (p) { return p(t); }).join("L");
                    };
                }
            }

        function charMouseOver() {
                    var mouseX = d3.event.pageX - calc.chartLeftMargin;
                    var mouseY = d3.event.pageY - calc.chartTopMargin - 20;

                    console.log('mouseX ' + mouseX + ' mouseY ' + mouseY);
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
