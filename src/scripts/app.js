/*
*  RUN
*/

let g, svg;
// fetchMapData()
// without the fetch
drawMap(detroitZipCodes)


/*
*  HELPERS
*/

function fetchMapData(){

  //FETCH EITHER ALL ZIPCODES THEN CONVERT OR JUST DETROIT ZIP CODES
  // d3.json("./geojson/zipcodes.json", (error, map) => {
  // d3.json("./geojson/detroitZipCodes.json", (error, map) => {
  //   if(error) {
  //     console.log(error)
  //     throw new Error("Chrome has strict security permissions and won't allow you to fetch from a local file system. Use `http-server` to serve these files over HTTP to make the map visualization to work.")
  //   } else {
  //     drawMap(map)
  //   }
  // })
}

function drawMap(map){
  let width = 900,
      height = 600;
  
  // SCALE AND TRANSLATE BASED ON POSITION OF DETROIT
  let projection = d3.geoAlbersUsa()
                      .scale(30000)
                      .translate([width * -5.5, height * 4]);

  // FILTER ALL ZIPCODES TO JUST DETROIT ZIPCODES
  // let zipcodes = topojson.feature(map, map.objects.zcs)
  // detroitZipCodes = zipcodes.features.filter(el => {
  //   let zc = el.properties.ZCTA5CE10
  //   return zc > 48200 && zc < 48289
  // })


  //MAP DATA TO PROPERTIES IN ZIPCODE DATA
  map.forEach(el => {
    let zcDataObj = zipcodeData[el.properties.ZCTA5CE10]
    let value = 'N/A'
    if(zcDataObj) value = zcDataObj.erVisits
    el.properties.VALUE = value
  })

  //init SCALE
  let array = Object.values(zipcodeData)
  let min = d3.min(array, el => el.erVisits)
  let max = d3.max(array, el => el.erVisits)
  updateMinAndMax(min, max)

  let scale = d3.scaleLinear()
                .domain([min, max])
                .range(['blue', 'red'])

  let path = d3.geoPath().projection(projection)
  svg = d3.select('svg').attrs({
    width: width,
    height: height
  })

  let zoom = d3.zoom()
      .on('zoom', zoomed)
  svg.call(zoom)

  g = svg.append('g').attr('class','global')
  g.selectAll('.zipcodes')
    // .data(detroitZipCodes)
    .data(map)
    .enter()
    .append('path')
    .attrs({
      d: path,
      fill: d => scale(d.properties.VALUE),
      stroke: 'white',
      'stroke-width': 0.1
    }).on('click', clicked)
}

function zoomed(){
  g.attr('transform', d3.event.transform)
}

function clicked(d){
  console.log(d)
  document.querySelector('.zipcode').innerText = d.properties.ZCTA5CE10
  document.querySelector('.result').innerText = d.properties.VALUE
  
}

function updateMinAndMax(min, max){
  document.querySelector('.min').innerText = min
  document.querySelector('.max').innerText = max
}