


function renderPieChart(params) {
    // exposed variables
    var attrs = {
        svgWidth: 420,
        svgHeight: 400,
        marginTop: 20,
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 70,
        showCenterText: false,
        data: null,
        radius: 150,
        slicesOpacity: 0.3
    };

    var METRONIC_DARK_COLORS = [//"#c5bf66","#BF55EC","#f36a5a","#EF4836","#9A12B3","#c8d046","#E26A6A","#32c5d2",
        //"#8877a9","#ACB5C3","#e35b5a","#2f353b","#e43a45","#f2784b","#796799","#26C281",
        //"#555555","#525e64","#8E44AD","#4c87b9","#bfcad1","#67809F","#578ebe","#c5b96b",
        "#4DB3A2", "#e7505a", "#D91E18", "#1BBC9B", "#3faba4", "#d05454", "#8775a7", "#8775a7",
        "#8E44AD", "#f3c200", "#4B77BE", "#c49f47", "#44b6ae", "#36D7B7", "#94A0B2", "#9B59B6",
        "#E08283", "#3598dc", "#F4D03F", "#F7CA18", "#22313F", "#2ab4c0", "#5e738b", "#BFBFBF",
        "#2C3E50", "#5C9BD1", "#95A5A6", "#E87E04", "#29b4b6", "#1BA39C"];



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

            calc.radius = Math.min(calc.chartWidth, calc.chartHeight) / 3;
            calc.labelArcRadius = calc.radius / 2;
           
           var format = d3.format(".2s");
           attrs.data.data.forEach(function(d){
              d.formatedValue = format(d.value);
           });

            //drawing
            var svg = d3.select(this)
                .append('svg')
                .attr('width', attrs.svgWidth)
                .attr('height', attrs.svgHeight)
                .style('overflow', 'visible');
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
            .attr("id",'id')
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

            // ------------------------------------------------------------------- filters end -----------------------------------------------------

            var chart = svg.append('g')
                .attr('transform', 'translate(' + ((calc.chartWidth / 2) + calc.chartLeftMargin) + ',' + (calc.chartHeight / 2 + calc.chartTopMargin) + ')');


            var chartTitle = svg.append('g')
                .attr('transform', 'translate(' + calc.chartLeftMargin + ',' + 0+ ')');
            
            // pie title 
            chartTitle.append("text")
                .text(attrs.data.title)
                .attr('fill', 'black')
                .style('font-weight', 'bold');


            //var color = d3.interpolateRgbBasis(["#26C281", '#EF4836']);
            //var color = d3.scaleOrdinal().range(METRONIC_DARK_COLORS);
            var color = d3.scaleOrdinal(d3.schemeCategory20b);


            var pie = d3.pie()
                .value(function (d) { return d.value; })
                .sort(null);

            var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(calc.radius);


            var labelArc = d3.arc()
                .innerRadius(calc.labelArcRadius)
                .outerRadius(calc.labelArcRadius);

            var legendInnerArc = d3.arc()
                .innerRadius(calc.radius * 0.8)
                .outerRadius(calc.radius * 0.8);


            var legendMiddleArc = d3.arc()
                .innerRadius(calc.radius * 1.3)
                .outerRadius(calc.radius * 1.3);

            var legendOuterArc = d3.arc()
                .innerRadius(calc.radius * 2)
                .outerRadius(calc.radius * 2);


            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }


            var shuffled = [];
            
            if (attrs.data.shuffleSlices)
            {
                debugger;
                // shuffle array slices by angle size
                var sorted = attrs.data.data.sort(function(a,b){  return d3.ascending(a.value, b.value); });
                
                for(var i = 0; i < sorted.length/2; i++)
                {
                    shuffled[2*i] = sorted[i];
                    shuffled[2*i+1] = sorted[sorted.length -i-1];
                }
             }
            else{
                 shuffled = attrs.data.data.slice(0);
            }
            
           

            var slices = chart.append("g")
                .attr("class", "slicesGroup")
                .selectAll('g')
                .data(pie(shuffled))
                .enter()
                .append('g')
                .attr("class", "sliceGroup");


            var path = slices
                .append('path')
                .attr('d', arc)
                .attr('fill', function (d, i, arr) {
                    return color(d.data.label);
                    // return attrs.color;
                })
                //.attr('opacity', (d, i, arr) => (i + 1) / arr.length)
                .attr('stroke', 'white')
                .attr("class", "slicePath");



            //var innerLabels = chart.append("g").attr("class", "innerLables");
            var innerLabel = slices
                .append('text')
                .text(function (d) { return d.data.label; })
                .attr('x', function (d) { return labelArc.centroid(d)[0]; })
                .attr('y', function (d) { return labelArc.centroid(d)[1]; })
                .attr('fill', 'white')
                .attr('text-anchor', 'middle')
                .attr('display', function (d) { return Math.abs((d.startAngle - d.endAngle) * (180 / Math.PI)) < 30 ? 'none' : 'block'; })
                .style('pointer-events', 'none')
                .attr("class", "innerLabel");



            //   legend lines 
            var lines = chart.append("g").attr("class", "lines");
            var line = svg.select(".lines")
                .selectAll("line")
                .data(pie(shuffled), function (d) { return d.data.label });

            pie(shuffled).forEach(function (d) {
                d.data.lineStartX = legendInnerArc.centroid(d)[0];
                d.data.lineStartY = legendInnerArc.centroid(d)[1];
                d.data.lineMiddleX = legendMiddleArc.centroid(d)[0];
                d.data.lineMiddleY = legendMiddleArc.centroid(d)[1];
                d.data.lineEndX = legendMiddleArc.centroid(d)[0] > 0 ? (calc.radius + calc.radius / 3) : (-calc.radius - calc.radius / 3);
                d.data.lineEndY = legendMiddleArc.centroid(d)[1];
            });


            line.enter().append("line").attr("class", "startLines")
                .attr("x1", function (d) { return d.data.lineStartX })
                .attr("y1", function (d) { return d.data.lineStartY })

                .attr("x2", function (d) { return d.data.lineMiddleX })
                .attr("y2", function (d) { return d.data.lineMiddleY })
                .style("stroke", "grey")
                .attr('display', function (d) { return Math.abs((d.startAngle - d.endAngle) * (180 / Math.PI)) > 30 ? 'none' : 'block'; });

            line.enter().append("line").attr("class", "endLines")
                .attr("x1", function (d) { return d.data.lineMiddleX })
                .attr("y1", function (d) { return d.data.lineMiddleY })

                .attr("x2", function (d) { return d.data.lineEndX; })
                .attr("y2", function (d) { return d.data.lineEndY; })
                .style("stroke", "grey")
                .attr('display', function (d) { return Math.abs((d.startAngle - d.endAngle) * (180 / Math.PI)) > 30 ? 'none' : 'block'; });


            var outerLabels = chart.append("g").attr("class", "outerLabels");
            var outerLabel = outerLabels.selectAll('text')
                .data(pie(shuffled))
                .enter()
                .append('text')
                .text(function (d) { return d.data.label; })
                .attr('x', function (d) { return d.data.lineEndX })
                .attr('y', function (d) { return d.data.lineEndY; })
                .attr('fill', 'grey')
                .attr('text-anchor',  function(d){ return d.endAngle * (180 / Math.PI) > 180 ? 'end' : 'start';})
                .attr('alignment-baseline', 'middle')
                .attr('display', function (d) { return Math.abs((d.startAngle - d.endAngle) * (180 / Math.PI)) > 30 ? 'none' : 'block'; })
                .style("font-size", "12px")
                .attr('class', 'outerLabel');

            // events 

            slices.on('mouseenter', function (d) {
                displayTooltip(
                    true,
                    chart,
                    attrs.tooltipRows,
                    'right',
                    0,
                    0,
                    d.data,
                    calc.dropShadowUrl
                );


                d3.select(this).attr('filter', calc.filterUrl);

                slices.filter(v => v != d) .attr('opacity', attrs.slicesOpacity);

            });


            slices.on('mouseout', function (d) {
                displayTooltip(false, chart);
                slices.attr('opacity', 1).attr('filter','none');

            });

            // smoothly handle data updating
            updateData = function () {
               debugger;

            }


        });
    };





    ['svgWidth', 'svgHeight', 'showCenterText', 'color', 'tooltipRows'].forEach(key => {
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
