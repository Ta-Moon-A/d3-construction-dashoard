

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



function GetGroupedDataForLineChart(initialData)
{
     var nestedData = d3.nest().key(function(d){ return d.region; })
                               .rollup(function(leaves){ 
                                          return { 
                                                   "region": leaves[0].region, 
                                                   "value": leaves
                                                 } 
                         }).entries(initialData);

   var groupedData =  nestedData.map(function(d){
                             return {
                                   region : d.key,
                                   data : d.value.value
                             };
                          });
   
    return groupedData;
}


function GetYearsForFilter(initialData)
{
     var groupedData =  initialData.map(function(d){
                             return Number(d.year);
                          });

    var uniqueYears = groupedData.filter(onlyUnique);
    return uniqueYears;
}


function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}


