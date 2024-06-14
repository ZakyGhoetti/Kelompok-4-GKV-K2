const width = 1200
const height = 1000
const csvDataDict = {};
let selectedyear = '2020'

const svg = d3.select('#map').append('svg').attr('width', width).attr('height', height);

const projection = d3.geoMercator().scale(1300).center([120, -5]).translate([width / 1.8, height / 3]);
const path = d3.geoPath().projection(projection);

const div = d3.select("#tooltip");

let indo;

Promise.all([
    d3.json('provinces-simplified-topo.json'),
    d3.dsv(';', 'data-stunting-indonesia.csv')
]).then(data => {

    const [provincesData, stuntingData] = data;
    const provinces = topojson.feature(provincesData, provincesData.objects.provinces).features;
    
    stuntingData.forEach(row => {
        csvDataDict[row.Provinsi] = row;
    });

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

    indo = svg.selectAll('path')
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

});

function updateMapColors() {
  indo.style("fill", d => {
      const provinceName = d.properties.provinsi;
      const additionalInfo = csvDataDict[provinceName];
      const dat = parseFloat(additionalInfo[selectedyear]);
      console.log(selectedyear);
      console.log(provinceName + " " + dat);
      if(dat >= 0 && dat < 8){
          return "#bad0e6";
      }
      else if(dat >= 8 && dat < 16){
          return "#84b0d9";
      }
      else if(dat >= 16 && dat < 24){
          return "#6ba2d6";
      }
      else if(dat >= 24 && dat < 32){
          return "#4fafe8";
      }
      else{
          return "#3182bd";
      }
  });
}

function setYear(year) {
    selectedyear = year;
    d3.select('#judul').text("Data Stunting Indonesia " + selectedyear);
    if (typeof updateMapColors === "function") {
      updateMapColors(); // Call the update function
  } else {
      console.log("updateMapColors is not defined");
  }
}