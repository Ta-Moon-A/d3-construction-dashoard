

function GetRegionData(initialData)
{
     var nestedData = d3.nest().key(function(d){ return d.region; })
                               .rollup(function(leaves){ 
                                          return { 
                                                   "label": leaves[0].region, 
                                                   "value": d3.sum(leaves, function(d) {return parseFloat(d.value);})
                                                 } 
                         }).entries(initialData);

      return nestedData.map(function(d){return d.value;});
}



function GetYearlyData(initialData)
{
     var nestedData = d3.nest().key(function(d){ return d.year; })
                               .rollup(function(leaves){ 
                                          return { 
                                                   "label": leaves[0].year, 
                                                   "value": Math.round(d3.mean(leaves, function(d) {return parseFloat(d.value);}), -2) 
                                                 } 
                         }).entries(initialData);

      return nestedData.map(function(d){return d.value;});
}
