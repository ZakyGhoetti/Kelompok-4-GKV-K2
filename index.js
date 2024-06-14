const width = 1200
const height = 1000
let selectedyear = '2020'

const svg = d3.select('#map').append('svg').attr('width', width).attr('height', height);

const projection = d3.geoMercator().scale(1300).center([120, -5]).translate([width / 1.8, height / 3]);
const path = d3.geoPath().projection(projection);

const div = d3.select("#tooltip");

const colorScale = d3.scaleThreshold()
    .domain([8, 16, 24, 32]) 
    .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"]);

Promise.all([
    d3.json('provinces-simplified-topo.json'),
    d3.dsv(';', 'data-stunting-indonesia.csv')
]).then(data => {

    const [provincesData, stuntingData] = data;
    const provinces = topojson.feature(provincesData, provincesData.objects.provinces).features;
    
    const csvDataDict = {};
    stuntingData.forEach(row => {
        csvDataDict[row.Provinsi] = row;
    });
    
    function chooseColor(d, tahun){
        const provinceName = d.properties.provinsi;
        const additionalInfo = csvDataDict[provinceName];
        if(additionalInfo[tahun] >= 0 && additionalInfo[tahun] < 8){

        }
        else if(additionalInfo[tahun] >= 8 && additionalInfo[tahun] < 16){

        }
        else if(additionalInfo[tahun] >= 16 && additionalInfo[tahun] < 24){

        }
        else if(additionalInfo[tahun] >= 24 && additionalInfo[tahun] < 32){

        }
    }

    function mouseover(d) {
        d3.select(this)
          .attr("stroke-width", "2px")
          .attr("fill-opacity", "0.6");
        div.style("opacity", 0.9);
        const provinceName = d.properties.provinsi;
        const additionalInfo = csvDataDict[provinceName];
        div.html(
          "<b>" + provinceName + "</b><br>" +
          selectedyear + ": " + additionalInfo[selectedyear]
        );
    }

    function mouseout(d) {
        d3.select(this)
          .attr("stroke-width", ".3px")
          .attr("fill-opacity", "1");
        div.style("opacity", 0);
    }

    function updateMapColors() {
        indo.attr("fill", d => {
            const provinceName = d.properties.provinsi;
            const additionalInfo = csvDataDict[provinceName];
            if (additionalInfo) {
                return colorScale(+additionalInfo[selectedYear]);
            }
        });
    }

    var indo = svg.selectAll('path')
    .data(provinces)
    .enter().append('path')
    .attr('class', 'province')
    .attr('d', path)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

    indo.on("mousemove", function(d) {
        div.style("opacity", 0.9);
        const provinceName = d.properties.provinsi;
        const additionalInfo = csvDataDict[provinceName];
        div.html(
            "<b>" + provinceName + "</b><br>" +
            selectedyear + ": " + additionalInfo[selectedyear]
          )
          .style("left", function() {
            if (d3.event.pageX > 780) {
              return d3.event.pageX - 100 + "px";
            } else {
              return d3.event.pageX + 23 + "px";
            }
          })
          .style("top", d3.event.pageY - 20 + "px");
      })
      .on("mouseout", function() {
        return div.style("opacity", 0);
      })
      .on("mouseout", mouseout);


      updateMapColors();

      function setYear(year) {
          selectedyear = year;
          updateMapColors();
      }
});