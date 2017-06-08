
var globalData = [];


d3.csv("data/Constructions.csv")
  .row(function(d,i) { 
           var yearlyData = [];
           
           for (var property in d) {
                if (d.hasOwnProperty(property)) {
                    if(!isNaN(property))
                    {
                         yearlyData.push({
                             year : property,
                             value : d[property]
                         });
                    }
                }
            }

          return {
                   region: d.Region, 
                   yearlyData: yearlyData
                }; 
            })
   .get(function(error, callBackData) 
      {   
           this.globalData = callBackData;
           console.log(callBackData); 
      });