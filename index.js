const width = 1200
const height = 1000

const svg = d3.select('#map').append('svg').attr('width', width).attr('height', height);

const projection = d3.geoMercator().scale(1300).center([120, -5]).translate([width / 1.8, height / 3]);
const path = d3.geoPath().projection(projection)

const div = d3.select("#tooltip");

d3.json('provinces-simplified-topo.json')
    .then(data => {

    const provinces = topojson.feature(data, data.objects.provinces).features;
    
    function mouseover(d) {
        d3.select(this)
          .attr("stroke-width", "2px")
          .attr("fill-opacity", "0.6");
        div.style("opacity", 0.9);
        div.html(
          "<b>" +
            d.properties.provinsi +
            "</b>"
        );
      }

      function mouseout(d) {
        d3.select(this)
          .attr("stroke-width", ".3px")
          .attr("fill-opacity", "1");
        div.style("opacity", 0);
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
        div
          .html(
            "<b>" +
              d.properties.provinsi +
              "</b>"
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
});
