let options = {
  minColor: 'blue',
  maxColor: 'red',
  minZip: 48200,
  maxZip: 48289,
  propToScaleBy: 'visits',
  exampleObject: {}
}
console.log('running')
/*
*  RUN
*/

let width = 900,
    height = 600,
    g, stats;

let svg = d3.select('svg').attrs({
    width: width,
    height: height
  })
// let zips = filterZipsAndMapData(zipcodes, options.minZip, options.maxZip)
// without the fetch
loadData()
// drawMap(zips)


/*
*  HELPERS
*/

function loadData(){
  d3.csv('../../data.csv', (d)=>{
   return {
     zipcode: +d['Trimmed Zipcode'],
     visits: +d['Number of ED visits'],
     admissions: +d['Number of Admissions']
   } 
  }, d=>{
    console.log(d)
    let {zcsGeometryObj, extent} = formatData(zipcodes, d)
    drawMap(zcsGeometryObj, extent)
  })
}

function drawMap(data, extent){
  // SCALE AND TRANSLATE BASED ON POSITION OF DETROIT
  let projection = d3.geoAlbersUsa()
                      .scale(30000)
                      .translate([width * -5.5, height * 4]);

  //init SCALE
  let scale = d3.scaleLinear()
                .domain([extent[0], extent[1]])
                .range([options.minColor, options.maxColor])

  let path = d3.geoPath().projection(projection)
  drawLegend(data, extent, scale)

  let zoom = d3.zoom()
      .on('zoom', zoomed)
  svg.call(zoom)

  g = svg.append('g').attr('class','global')

  g.selectAll('.zipcode')
    .data(topojson.feature(data, data.objects.zcs).features)
    .enter()
    .append('path')
    .attrs({
      class:'zipcode',
      d: path,
      fill: d => {
        let value = d.properties.stats[options.propToScaleBy]
        if(value) return scale(value)
        return 'black'
      },
      stroke: 'white',
      'stroke-width': 0.1
    })
    .on('click', clicked)
}

function zoomed(){
  g.attr('transform', d3.event.transform)
}

function clicked(d){
  console.log(d)
  let stats = d.properties.stats
  document.querySelector('span.zipcode').innerText = stats.zipcode
  for(let key in options.exampleObject){
    document.querySelector(`.${key}`).innerText = stats[key]
  }
}

function drawLegend(data, e, scale){
  //update tooltip area on the side
  let statEl = document.querySelector('.stats')
  for(let key in options.exampleObject){
    let node = document.createElement('li')
    let li = statEl.appendChild(node)
    li.innerHTML = `${key.split('-').join(' ').toUpperCase()}: <span class="${key}"></span>`
  }
  let bw=20
  let d = d3.range(0,10)
  let l = svg.append('g').attrs({
    class: 'legend',
  })
  l.append('text').text(e[0]).attrs({
    x: 0,
    y: 0
  })
  let colors = l.append('g').attr('class','colors')
  colors.selectAll('rect')
    .data(d)
    .enter()
    .append('rect')
    .attrs({
      x: d => d*bw + 30,
      y: -15,
      width: bw,
      height: bw,
      fill: (d,i) => scale(i*((e[1]-e[0])/10))
    })
  l.append('text').text(e[1]).attrs({
    x: colors.node().getBBox().width + 35,
    y: 0,
  })
  let lbb = l.node().getBBox()
  l.attr('transform', `translate(${width/2-lbb.width} 20)`)
}

function formatData(zipcodeGeometries, data){
  let dataObj = {}
  options.exampleObject = data[0]
  let extent = d3.extent(data, el => el[options.propToScaleBy])
  data.forEach(el => dataObj[el.zipcode] = el)

  zipcodeGeometries.objects.zcs.geometries = zipcodeGeometries.objects.zcs.geometries.filter(obj =>{
      let z = obj.properties.ZCTA5CE10 
      obj.properties.stats = dataObj[z] || {}
      return !!dataObj[z]
  })
  return {
    zcsGeometryObj: zipcodeGeometries,
    dataObj: dataObj,
    extent,
  }
}