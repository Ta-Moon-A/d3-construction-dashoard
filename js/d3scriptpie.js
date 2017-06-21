


function renderPieChart(params) {
    // exposed variables
    var attrs = {
        svgWidth: 420,
        svgHeight: 400,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 5,
        showCenterText:false,
        data: null,
        radius : 100
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


var dataset = [
          { label: 'Abulia', value: 10 },
          { label: 'Betelgeuse', value: 20 },
          { label: 'Cantaloupe', value: 30 },
          { label: 'Dijkstra', value: 40 }
        ];

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
                //.attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')')
                .attr('transform', 'translate(' + (calc.chartWidth / 2) +',' + (calc.chartHeight / 2) + ')');

            var color = d3.scaleOrdinal(d3.schemeCategory20b);

            var arc = d3.arc()
                        .innerRadius(0)
                        .outerRadius(attrs.radius);

            var pie = d3.pie()
                        .value(function(d){ return  d.value;  })
                        .sort(null);



            var path = chart.selectAll('path')
                            .data(pie(attrs.data.data))
                            .enter()
                            .append('path')
                            .attr('d', arc)
                            .attr('fill', function(d,i){
                               return color(d.data.label);
                            });
             

            // smoothly handle data updating
            updateData = function () {


            }


        });
    };





    ['svgWidth', 'svgHeight','showCenterText'].forEach(key => {
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
