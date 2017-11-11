'use strict';

/*
*  RUN
*/

var width = 900,
    height = 600,
    g = void 0,
    stats = void 0;

var svg = d3.select('svg').attrs({
  width: width,
  height: height
});
var zips = filterZipsAndMapData(zipcodes, options.minZip, options.maxZip);
// without the fetch
drawMap(zips);

/*
*  HELPERS
*/

function drawMap(zips) {

  // SCALE AND TRANSLATE BASED ON POSITION OF DETROIT
  var projection = d3.geoAlbersUsa().scale(30000).translate([width * -5.5, height * 4]);

  //init SCALE
  var array = Object.values(zipcodeData);
  var e = d3.extent(array, function (el) {
    return el[options.propToScaleBy];
  });
  // drawLegend(e[0], e[1])

  var scale = d3.scaleLinear().domain([e[0], e[1]]).range([options.minColor, options.maxColor]);

  var path = d3.geoPath().projection(projection);

  drawLegend(e, scale);

  var zoom = d3.zoom().on('zoom', zoomed);
  svg.call(zoom);

  g = svg.append('g').attr('class', 'global');
  g.selectAll('.zipcode').data(topojson.feature(zips, zips.objects.zcs).features).enter().append('path').attrs({
    class: 'zipcode',
    d: path,
    fill: function fill(d) {
      var value = d.properties.stats[options.propToScaleBy];
      if (value) return scale(value);
      return 'black';
    },
    stroke: 'white',
    'stroke-width': 0.1
  }).on('click', clicked);
}

function zoomed() {
  g.attr('transform', d3.event.transform);
}

function clicked(d) {
  console.log(d);
  var stats = d.properties.stats;
  document.querySelector('span.zipcode').innerText = d.properties.ZCTA5CE10;
  for (var key in exampleObject) {
    document.querySelector('.' + key).innerText = stats[key] || 'N/A';
  }
}

function drawLegend(e, scale) {
  //update tooltip area on the side
  var statEl = document.querySelector('.stats');
  for (var key in exampleObject) {
    var node = document.createElement('li');
    var li = statEl.appendChild(node);
    li.innerHTML = key.split('-').join(' ').toUpperCase() + ': <span class="' + key + '"></span>';
  }
  var bw = 20;
  var d = d3.range(0, 10);
  var l = svg.append('g').attrs({
    class: 'legend'
  });
  l.append('text').text(e[0]).attrs({
    x: 0,
    y: 0
  });
  var colors = l.append('g').attr('class', 'colors');
  colors.selectAll('rect').data(d).enter().append('rect').attrs({
    x: function x(d) {
      return d * bw + 30;
    },
    y: -15,
    width: bw,
    height: bw,
    fill: function fill(d, i) {
      return scale(i * ((e[1] - e[0]) / 10));
    }
  });
  l.append('text').text(e[1]).attrs({
    x: colors.node().getBBox().width + 35,
    y: 0
  });
  var lbb = l.node().getBBox();
  l.attr('transform', 'translate(' + (width / 2 - lbb.width) + ' 20)');
}

function filterZipsAndMapData(zips, min, max) {
  zips.objects.zcs.geometries = zips.objects.zcs.geometries.filter(function (obj) {
    var z = obj.properties.ZCTA5CE10;
    obj.properties.stats = zipcodeData[z] || {};
    return z >= min && z < max;
  });
  return zips;
}
//# sourceMappingURL=app.js.map
