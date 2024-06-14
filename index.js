const width = 1200
const height = 400
const csvDataDict = {};
const csvDataDict2 = {}; //proccessing only
let selectedyear = '2020'

const svg = d3.select('#map').append('svg').attr('width', width).attr('height', height);

const projection = d3.geoMercator().scale(1300).center([120, 2]).translate([width / 1.8, height / 3]);
const path = d3.geoPath().projection(projection);

const div = d3.select("#tooltip");

let indo;

Promise.all([
    d3.json('provinces-simplified-topo.json'),
    d3.dsv(';', 'data-stunting-indonesia.csv'),
    d3.dsv(';', 'data-stunting-indonesia_for_counting.csv')
]).then(data => {

    const [provincesData, stuntingData, stuntingData2] = data;
    const provinces = topojson.feature(provincesData, provincesData.objects.provinces).features;
    
    stuntingData.forEach(row => {
        csvDataDict[row.Provinsi] = row;
    });

    stuntingData2.forEach(row => {
      csvDataDict2[row.Provinsi] = row;
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

    function click(d) {
        const provinceName = d.properties.provinsi;
        showBarChart(provinceName);
    }

    indo = svg.selectAll('path')
    .data(provinces)
    .enter().append('path')
    .attr('class', 'province')
    .attr('d', path)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("click", click);

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
      const additionalInfo = csvDataDict2[provinceName];
      const dat = parseFloat(additionalInfo[selectedyear]);
      console.log(selectedyear);
      console.log(provinceName + " " + dat);
      if(dat >= 0 && dat < 8){
          return "#bad0e6";
      }
      else if(dat >= 8 && dat < 16){
          return "#95c0e8";
      }
      else if(dat >= 16 && dat < 24){
          return "#5695cf";
      }
      else if(dat >= 24 && dat < 32){
          return "#3882dd";
      }
      else{
          return "#2068c1";
      }
  });
}

function setYear(year) {
    selectedyear = year;
    d3.select('#judul').text("Data Stunting Indonesia (" + selectedyear + ")");
    if (typeof updateMapColors === "function") {
      updateMapColors(); // Call the update function
  } else {
      console.log("updateMapColors is not defined");
  }
}

function showBarChart(provinceName){
  const provincedata = csvDataDict2[provinceName];
  const tahun = ['2020', '2021', '2022', '2023'];
  const data = tahun.map(th => ({
    Tahun: th,
    nilai: parseFloat(provincedata[th]) 
  }));

  const margin = {top: 30, right: 30, bottom: 40, left: 40};
  const chartWidth = 300 - margin.left - margin.right;
  const chartHeight = 200 - margin.top - margin.bottom;
  const x = d3.scaleBand()
      .domain(data.map(d => d.Tahun))
      .range([0, chartWidth])
      .padding(0.1);

  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.nilai)])
      .range([chartHeight, 0]);

      d3.select("#barchart").selectAll("*").remove(); // Clear any existing chart
      
      const svg = d3.select("#barchart")
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("g")
      .selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("x", d => x(d.Tahun))
      .attr("y", d => parseFloat(y(d.nilai)))
      .attr("width", x.bandwidth())
      .attr("height", d => parseFloat(chartHeight) - parseFloat(y(d.nilai)))
      .attr("fill", "#69b3a2");

  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(d3.axisBottom(x));

  svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2f")));

  svg.append("text")
      .attr("x", (chartWidth / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px") 
      .style("text-decoration", "underline")  
      .text(provinceName);
}