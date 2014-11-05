 
// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
		zoom : 3,
		center : new google.maps.LatLng(30.0, 10.0),
		mapTypeId : google.maps.MapTypeId.TERRAIN
	});

// Load the data. When the data comes back, create an overlay.
d3.json("aaa.json", function (data) {
	var overlay = new google.maps.OverlayView();
	
	// Add the container when the overlay is added to the map.
	overlay.onAdd = function () {
	
		// Add the section that will contain the markers of the data points
		var layer = d3.select(this.getPanes().overlayLayer).append("div")
			.attr("class", "stations");
		
		// Add the section that will contain the contour plot
		var cont_layer = d3.select(this.getPanes().overlayLayer).append("div")
				.attr("class","contour").append("svg:svg");
		
		// Add a group to the SVG object; groups can be affected by the opacity
		var cont_group = cont_layer.append("g").attr("opacity",0.3);
		
		// Implement the overlay.draw method
		overlay.draw = function () {
			var projection = this.getProjection(),
			padding = 10;
			
			//___Add the data markers
			
			// Draw each marker as a separate SVG element as in Mike Bostock's example for d3 and Google Maps
			var marker = layer.selectAll("svg")
				.data(d3.entries(data))
				.each(transform) // update existing markers
				.enter().append("svg:svg")
				.each(transform)
				.attr("class", "marker");
			
			// Add a circle.
			marker.append("svg:circle")
			.attr("r", 1.5)
			.attr("cx", padding)
			.attr("cy", padding);
			
			// Add a label.
			marker.append("svg:text")
			.attr("x", padding - 6)
			.attr("y", padding + 6)
			.attr("dy", ".31em")
			.text(function (d) {
				return (d.value[2].toFixed(2));//"("+d.value[0].toString()+", "+d.value[1].toString()+"): "+
			});
			
			
			//___Add the contour plot
			
			// The data is provided as an array of [lat, lon, value] arrays and it need to be mapped to a grid.
			// Determine the min and max latitudes and longitudes
			var maxY = data[0][0];
			var minY = data[0][0];
			var maxX = data[0][1];
			var minX = data[0][1];
			var spacingX = 2.5;
			var spacingY = 2.5;
			data.forEach(function(val){
				maxX=maxX>val[1]?maxX:val[1];
				minX=minX<val[1]?minX:val[1];
				maxY=maxY>val[0]?maxY:val[0];
				minY=minY<val[0]?minY:val[0];
			});
			console.log("Mx = "+maxX+"  mx = "+minX+"  My = "+maxY+"  my = "+minY + " => " +(maxX-minX)/spacingX+":"+(maxY-minY)/spacingY);
			
			// Create a properly dimensioned array
			var grid=new Array((maxX-minX)/spacingX+1);
			for (var i=0;i<grid.length;i++)
				grid[i] = Array((maxY-minY)/spacingY+1);
			
			// Fill the grid with the values from the data array
			data.forEach(function(val){grid[(val[1]-minX)/spacingX][(val[0]-minY)/spacingY]=val[2];});
			
			//Add a "cliff edge" to force contour lines to close along the border.			
			var cliff = -100;
			grid.push(d3.range(grid[0].length).map(function() { return cliff; }));
			grid.unshift(d3.range(grid[0].length).map(function() { return cliff; }));
			grid.forEach(function(nd) {
			  nd.push(cliff);
			  nd.unshift(cliff);
			});
			
			// determine the size of the SVG
			var c2 = projection.fromLatLngToDivPixel(new google.maps.LatLng(minY, maxX));
			var c1 = projection.fromLatLngToDivPixel(new google.maps.LatLng(maxY, minX));
			
			var svgHeight = 8000; // c2.y - c1.y;  
			var svgWidth = 8000;  // c2.x - c1.x;
			var padX = -4000;
			var padY = -4000;
			
			console.log(svgHeight,svgWidth);
			
			// set the size of the SVG contour layer
			cont_layer
				.attr("width",svgWidth)
				.attr("height",svgHeight)
				.style("position","absolute")
				.style("top",padX)
				.style("left",padY);
			
			// conrec.js requires two arrays that represent the row and column coordinates. 
			// In this case these are an array of latitudes and one of longitudes
			var latpy = new Array();
			var lonpx = new Array();
			
			// Adding the cliff implies extending the latitude and longitude arrays beyound the minimum and maximum
			for (var i = 0; i < grid[0].length; i++)
				latpy[i] = minY + 2.5 * (i-1);
			
			for (var i = grid.length-1; i>=0; i--)
				lonpx[i] = minX + 2.5 * (i-1);
			
			// define the colours to be used and the corresponding limits
			var colours = ['#000099','#0000FF','#3399FF','#00CCFF','#00CC00','#66FF00','#FFFF00','#CC0000','#FF6633'],
				zs = [-0.1, 20.0, 50.0, 75.0, 90.0, 95.0, 98.0, 99.0, 99.9, 100.1];
			
			// create a Conrec object and compute the contour
			var c = new Conrec();
			c.contour(grid, 0, lonpx.length-1, 0, latpy.length-1, lonpx, latpy, zs.length, zs);
			
			// draw the contour plot following Jason Davies example for conrec.js and d3
			var cont = cont_group.selectAll("path").data(c.contourList())
				// update existing paths
				.style("fill",function(d) { 
					return colours[zs.indexOf(d.level)-1];
				})
				.style("stroke","black")
				.attr("d",d3.svg.line()
					// the paths are given in lat and long coordinates that need to be changed into pixel coordinates
					.x(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).x - padX; })
					.y(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).y - padY; })
					)
				.enter().append("svg:path")
				.style("fill",function(d) { 
				return colours[zs.indexOf(d.level)-1];
				})
				.style("stroke","black")
				.attr("d",d3.svg.line()
					// the paths are given in lat and long coordinates that need to be changed into pixel coordinates
					.x(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).x - padX; })
					.y(function(d) { return (projection.fromLatLngToDivPixel(new google.maps.LatLng(d.y, d.x))).y - padY; })
				);
			
			// function for transforming the data marker
			function transform(d) {
				d = new google.maps.LatLng(d.value[0], d.value[1]);
				d = projection.fromLatLngToDivPixel(d);
				return d3.select(this)
				.style("left", (d.x - padding) + "px")
				.style("top", (d.y - padding) + "px");
			}
		};
	};
	
	// Bind our overlay to the map…
	overlay.setMap(map);
});
