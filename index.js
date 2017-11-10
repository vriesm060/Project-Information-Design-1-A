
	// Rewriting the region codes into readable words:
	var regions = {
		'NL01': 'Nederland',
		'PV20': 'Groningen',
		'PV21': 'Friesland',
		'PV22': 'Drenthe',
		'PV23': 'Overijssel',
		'PV24': 'Flevoland',
		'PV25': 'Gelderland',
		'PV26': 'Utrecht',
		'PV27': 'Noord-Holland',
		'PV28': 'Zuid-Holland',
		'PV29': 'Zeeland',
		'PV30': 'Noord-Brabant',
		'PV31': 'Limburg'
	};

	// Define the margins:
	var margin = {
		left: 50,
		right: 50,
		top: 30,
		bottom: 30
	};
	
	// Define the size of the svg:
	var width = screen.width - margin.left - margin.right;
	var height = 750 - margin.top - margin.bottom;

	// Create the svg:
	var svg = d3.select('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);

/*
====================
		MAP
====================
*/

	// Set the current region:
	var currentRegion = 'Nederland';
	var curIdx = Object.values(regions).indexOf(currentRegion);

	// Define the size of the map:
	var widthMap = width * .45;
	var heightMap = height;
	var widthMapLegend = 250;

	// Scale the map according to the size of the group:
	var scaleMap = widthMap * 13;
	var scaleLeft = scaleMap * -.055;
	var scaleTop = scaleMap * 1.115;

	// Define a projection for the geoPath:
	var projection = d3.geoMercator()
		.scale(scaleMap)
		.translate([scaleLeft, scaleTop]);

	// Define the path for the map:
	var path = d3.geoPath()
	  .projection(projection);

	// Create an ordinal scale for the map legend:
	var xMap = d3.scaleOrdinal()
		.range([0, widthMapLegend]);

	// Add this scale to an x axis:
	var xAxisMap = d3.axisBottom(xMap);

	// Create a linear scale for the color range:
	var colorsMap = d3.scaleLinear()
		.range(['#3df9f4', '#1d797d']);

/*
====================
		DONUT CHART
====================
*/

	// Defining the size of the donut chart:
	var widthDonut = width * .25;
	var heightDonut = 350;

	// Define the radius of the donut chart:
	var radius = widthDonut / 2;

	// Create an ordinal scale for the color range:
	var colorsDonut = d3.scaleOrdinal()
		.range(['#1D797D', '#35C4B0', '#9AC49F', '#DADD7F', '#DDC7A7', '#DDA86A', '#D9A19C', '#A6658F', '#844C73']);

	// Define the size of the arcs of the donut chart:
	var arc = d3.arc()
		.outerRadius(radius)
		.innerRadius(radius / 1.5);

	// Returning the value within our data to create the donut chart:
	var pie = d3.pie()
		.sort(null)
		.value(function (d) { return d.value; });

/*
====================
		BAR CHART
====================
*/

	// Define the size of the bar chart:
	var widthBar = width * .25;
	var heightBar = height - heightDonut - margin.bottom - 25;

	// Define the scale for the x axis:
	var xBar = d3.scaleBand()
		.rangeRound([0, widthBar])
		.padding(.25);

	// Define the scale for the y axis:
	var yBar = d3.scaleLinear()
		.range([heightBar, 0]);

	// Create the axis:
	var xAxisBar = d3.axisBottom(xBar);
	var yAxisBar = d3.axisLeft(yBar);

/*
====================
		LOADING DATA
====================
*/

	// Import all the data files simultaneously:
	// Helpful source: https://stackoverflow.com/questions/21842384/importing-data-from-multiple-csv-files-in-d3
	d3.queue()
		.defer(d3.json, 'nl.json')
		.defer(d3.text, 'dataset_bevolking.txt')
		.defer(d3.text, 'dataset_eenzaamheid_provincie.txt')
		.await(function (err, nl, doc0, doc1) {
			if (err) throw err;
			onload(nl, [doc0, doc1]);
		});

/*
====================
		CLEANING DATA
====================
*/

	function onload (nl, docs) {

		// Cleaning the docs:
		for (var i = 0; i < docs.length; i++) {
			var header = docs[i].indexOf('BEGIN DATA');
			var start = docs[i].indexOf('\n', header);
			var footer = docs[i].indexOf('END DATA.');
			docs[i] = docs[i].slice(start, footer);
			docs[i] = docs[i].replace(/,+/g, '.')
				.replace(/ \n+/g, '\t')
				.replace(/ +/g, '\t')
				.replace(/\t+/g, ',')
				.trim();
		}

		docs[0] = docs[0].replace(/\n+/g, ',')
			.replace(/,NL+/g, '\nNL')
			.replace(/,PV+/g, '\nPV');

		var data0 = d3.csvParseRows(docs[0], map0);
		var data1 = d3.csvParseRows(docs[1], map1);

		function map0 (d) {
			return {
				'region': regions[d[0]],
				'year': d[1].slice(0, 4),
				'totalPopulation': Number(d[2]),
				'age': [
					{
						'type': 'Jonger dan 5 jaar',
						'value': Number(d[3])
					},
					{
						'type': '5 tot 10 jaar',
						'value': Number(d[4])
					},
					{
						'type': '10 tot 15 jaar',
						'value': Number(d[5])
					},
					{
						'type': '15 tot 20 jaar',
						'value': Number(d[6])
					},
					{
						'type': '20 tot 25 jaar',
						'value': Number(d[7])
					},
					{
						'type': '25 tot 45 jaar',
						'value': Number(d[8])
					},
					{
						'type': '45 tot 65 jaar',
						'value': Number(d[9])
					},
					{
						'type': '65 tot 80 jaar',
						'value': Number(d[10])
					},
					{
						'type': '80 jaar of ouder',
						'value': Number(d[11])
					}
				]
			}
		}

		function map1 (d) {
			return {
				'region': regions[d[0]],
				'loneliness': [
					{
						'type': 'Matig eenzaam',
						'value': Number(d[1])
					},
					{
						'type': '(Zwaar) ernstig eenzaam',
						'value': Number(d[2])
					}
				]
			}
		}

/*
====================
		DRAW MAP
====================
*/

		// Define the domain of the color scale to extent between the min. and the max. percentage of lonely people:
		colorsMap.domain(d3.extent(data1, function (d) { if (d.region !== 'Nederland') return d.loneliness[0].value; }));

		// Draw a group for the map:
		var map = svg.append('g')
			.attr('class', 'map')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// Draw the map:
		// Helpful source: https://bl.ocks.org/mbostock/4060606
		map.selectAll('.region')
			.data(topojson.feature(nl, nl.objects.subunits).features)
			.enter()
				.append('g')
					.attr('class', 'region')
					.on('click', changeRegion);

		// Color the regions according to the percentage of lonely people:
		map.selectAll('.region')
			.append('path')
				.attr('fill', function (d, i) { return colorsMap(data1[i+1].loneliness[0].value); })
				.attr('d', path);

		// Add the region names to the map:
		// Helpful source: https://stackoverflow.com/questions/13897534/add-names-of-the-states-to-a-map-in-d3-js
		map.selectAll('.region')
			.append('text')
				.text(function (d) { return d.properties.name; })
				.attr('x', function (d) { return path.centroid(d)[0]; })
				.attr('y', function (d) { return path.centroid(d)[1]; })
				.attr('text-anchor', 'middle');

/*
=======================
		DRAW MAP LEGEND
=======================
*/

		// Drawing a linear gradient using the colors to fill the map:
		// Helpful source: https://www.w3schools.com/graphics/svg_grad_linear.asp
		map.append('defs')
			.append('linearGradient')
				.attr('id', 'gradient_legend')
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '100%')
				.attr('y2', '0%')
					.append('stop')
						.attr('offset', '0%')
						.style('stop-color', colorsMap(colorsMap.domain()[0]));

		map.select('linearGradient')
			.append('stop')
				.attr('offset', '100%')
				.style('stop-color', colorsMap(colorsMap.domain()[1]));

		// Set the domain for the legend between 0 and the max. number of lonely people:
		xMap.domain([0, d3.max(data1, function (d) { return d.loneliness[0].value; })]);

		// Draw the legend's x axis and append a label to it:
		map.append('g')
			.attr('class', 'x-axis_map')
			.attr('transform', 'translate(0, 50)')
			.call(xAxisMap)
				.append('text')
					.attr('x', 0)
	  			.attr('y', -35)
	  			.attr('fill', '#000')
	  			.style('text-anchor', 'start')
	  			.text('Percentage eenzame mensen (%)');
		
		// Draw the rectangle for the legend and fill this with the gradient:
		map.selectAll('.x-axis_map')
			.append('rect')
				.attr('x', 0)
				.attr('y', -25)
				.attr('width', widthMapLegend)
				.attr('height', 25)
				.attr('fill', 'url(#gradient_legend)');

/*
========================
		DRAW DONUT CHART
========================
*/

		// Draw a group for the donut chart:
		var donut = svg.append('g')
			.attr('class', 'donut')
			.attr('transform', 'translate(' + (margin.left + widthMap + margin.right) + ',' + margin.top + ')');

		// Add the name of the region into the center of the donut chart:
		donut.append('text')
			.attr('transform', 'translate(' + radius + ',' + (radius - 10) + ')')
			.attr('text-anchor', 'middle')
			.text(data0[curIdx].region);

		// Add the population number of the region into the center of the donut chart:
		donut.append('text')
			.attr('transform', 'translate(' + radius + ',' + (radius + 15) + ')')
			.attr('text-anchor', 'middle')
			.text('Inwoners: ' + data0[curIdx].totalPopulation);

		// Draw the arcs:
		donut.selectAll('.arc')
			.data(pie(data0[curIdx].age))
			.enter()
				.append('g')
					.attr('class', 'arc')
					.attr('transform', 'translate(' + radius + ', ' + radius + ')');
		
		// Select the arcs and fill them with the color that corresponds with the value:
		donut.selectAll('.arc')
			.append('path')
				.attr('fill', function (d) { return colorsDonut(d.data.value); })
				.attr('d', arc)
				.each(function (d) { this._current = d; });

		// Select the arcs and add the label to it that corresponds with the value:
		donut.selectAll('.arc')
			.append('text')
				.attr('transform', function (d) { return 'translate(' + arc.centroid(d) + ')'; })
				.attr('text-anchor', 'middle')
	      .attr('dy', '.35em')
	      .text(function (d) { if (d.data.value !== 0) return Math.round(d.data.value / 1000); })
	      .each(function (d) { this._current = d; });

/*
============================
		DRAWING DONUT LEGEND
============================
*/

		// Short form for better readability:
		var age = data0[curIdx].age;

		// Function to determine if the index of the age group is odd or even,
		// in order to place the legend item next or under the other item:
		var outcome = function (d) {
			if (age.indexOf(d) % 2 === 0) {
				return 0;
			} else {
				return 15;
			}
		}

		// Create a group for the donut legend:
		donut.append('g')
			.attr('id', 'donut_legend')
				.append('text')
					.attr('x', (widthDonut + margin.right))
					.attr('y', margin.top)
					.text('Inwoners per leeftijdsgroep (x1000)');

		// Select and place all the legend items according to the outcome function:
		donut.select('#donut_legend')
			.selectAll('.donut_legend_item')
			.data(age)
			.enter()
				.append('g')
					.attr('class', 'donut_legend_item')
						.append('rect')
							.attr('x', function (d) { return (age.indexOf(d) % 2 === 0 ? (widthDonut + margin.left) : (widthDonut * 1.5) + margin.left); })
							.attr('y', function (d) { return 50 + (age.indexOf(d) * 15) - outcome(d); })
							.attr('width', 25)
							.attr('height', 25)
							.attr('fill', function (d) { return colorsDonut(d.value); })
			.exit()
			.remove();

		// Place the label next to the corresponding legend items:
		donut.selectAll('.donut_legend_item')
			.append('text')
				.attr('transform', function (d) {
					return 'translate(' + (age.indexOf(d) % 2 === 0 ? (widthDonut + margin.left + 30) : (widthDonut * 1.5) + margin.left + 30) +
								 ', ' + (50 + (age.indexOf(d) * 15) - outcome(d) + 15) +
								 ')';
				})
				.text(function (d) { return d.type; });

/*
======================
		DRAW BAR CHART
======================
*/

		// Setting the domains of the x and y axis for the bar chart:
		xBar.domain(data1[0].loneliness.map(function (d) { return d.type; }));
		yBar.domain([0, 70]);

		var barchart = svg.append('g')
			.attr('class', 'barchart')
			.attr('transform', 'translate(' + (margin.left + widthMap + margin.right) + ',' + (margin.top + heightDonut + margin.bottom) + ')');

		barchart.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + heightBar + ')')
			.call(xAxisBar)
		  	.append('text')
		    	.attr('class', 'label')
		    	.attr('x', (widthBar / 2))
		    	.attr('y', 40)
		    	.style('text-anchor', 'middle')
		    	.text('Soort eenzaamheid');

		barchart.append('g')
			.attr('class', 'y axis')
			.call(yAxisBar)
		  	.append('text')
		    	.attr('class', 'label')
		    	.attr('transform', 'rotate(-90)')
		    	.attr('y', 6)
		    	.attr('dy', '.71em')
		    	.style('text-anchor', 'end')
		    	.text('Percentage (%)');

		barchart.selectAll('.bar')
			.data(data1[curIdx].loneliness)
			.enter()
				.append('rect')
					.attr('class', 'bar')
		    	.attr('x', function (d) { return xBar(d.type); })
		    	.attr('y', function (d) { return yBar(d.value); })
		    	.attr('width', xBar.bandwidth())
		    	.attr('height', function (d) { return heightBar - yBar(d.value); })
		    	.attr('fill', '#1D797D')
		    	.on('mouseover', function (d) {
		    		// Helpful source: https://bl.ocks.org/sarubenfeld/56dc691df199b4055d90e66b9d5fc0d2
		    		var xPosition = parseFloat(d3.select(this).attr('x')) + widthMap + 90;
		    		var yPosition = parseFloat(d3.select(this).attr('y')) + heightDonut + 50;

		    		d3.select('#tooltip')
		    			.style('left', xPosition + 'px')
		    			.style('top', yPosition + 'px')
		    			.select('#value')
		    			.text(d.value + '%');

		    		d3.select('#tooltip').classed('hidden', false);
		    	})
		    	.on('mouseout', function () {
		    		d3.select('#tooltip').classed('hidden', true);
		    	})
		  .exit()
		  .remove();

/*
======================
		INTERACTION
======================
*/

	  // Activate this function whenever you change a region:
	  function changeRegion (d) {
	  	// Change the current region:
	 		currentRegion = d.properties.name;
	 		curIdx = Object.values(regions).indexOf(currentRegion);

	 		// Donut chart:
	 		donut.selectAll('text')
	 			.filter(function (d, i) { return i === 0; })
	 			.transition()
	 				.duration(375)
	 				.style('opacity', 0)
	 			.transition()
	 				.duration(375)
	 				.style('opacity', 1)
	 			.text(data0[curIdx].region);

	 		donut.selectAll('text')
	 			.filter(function (d, i) { return i === 1; })
	 			.transition()
	 				.duration(375)
	 				.style('opacity', 0)
	 			.transition()
	 				.duration(375)
	 				.style('opacity', 1)
	 			.text('Inwoners: ' + data0[curIdx].totalPopulation);

	 		donut.selectAll('.arc')
	 			.data(pie(data0[curIdx].age));

	 		donut.selectAll('.arc')
	 			.select('path')
	 			.transition()
	 				.delay(375)
	 				.duration(375)
	 				.attrTween('d', arcTween);

	 		donut.selectAll('.arc')
	 			.select('text')
	 			.transition()
	 				.duration(375)
	 				.style('opacity', 0)
	 			.transition()
	 				.duration(375)
	 				.style('opacity', 1)
	 			.attrTween('transform', labelArcTween)
	 			.text(function (d) { if (d.data.value !== 0) return Math.round(d.data.value / 1000); });

	 		// Barchart:
	 		barchart.selectAll('.bar')
	 			.data(data1[curIdx].loneliness);

	 		barchart.selectAll('.bar')
	 			.transition()
 					.duration(375)
	 			.attr('y', function (d) { return yBar(d.value); })
	 			.attr('height', function (d) { return heightBar - yBar(d.value); });
		}
	}

// This function makes sure when the donut chart animates, the arc stay in a circle and don't bend:
// Helpful source: https://bl.ocks.org/mbostock/1346410
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

// This function makes sure when the donut chart animates, the labels in the arcs stay in a circle:
function labelArcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
  	return 'translate(' + arc.centroid(i(t)) + ')';
  };
}