    // Variable declaration
    var geojson;
    var lyrHotels;
    var lyrTowns;
    var lyrConst;
    var lyrSearch;
    var OpenTopoMap;
    var Esri_WorldImagery;
    var streets;
    var osm;
    var map;
    var basemaps;
    var overlayMaps;
    var layerControl;
    var PercelLocationsIDs = [];

    var info = L.control();
    // map initialization
    map = L.map("map").setView([-0.2317, 36.2884], 8);
    //**************************************************************** Basemap definitions
    osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.anmart.co.ke">Anmart Developers LTD</a> Services',
    }).addTo(map);
    streets = L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          '&copy; <a href="https://www.anmart.co.ke">Anmart Developers LTD</a> Services',
        maxZoom: 17,
        id: "mapbox/streets-v11",
        // tileSize: 512,
        // zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoiZ2l0dWFqYW1lcyIsImEiOiJjajg1enNyYm8wbjV6MzNvMG1sbDVva3FoIn0.HAJTaiMAH29daebpQ-Ob_g",
      }
    );
    OpenTopoMap = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 17,
        attribution:
          '&copy; <a href="https://www.anmart.co.ke">Anmart Developers LTD</a> Services',
      }
    );
    Esri_WorldImagery = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          '&copy; <a href="https://www.anmart.co.ke">Anmart Developers LTD</a> Services',
        maxZoom: 17,
        casesensitive: false,
      }
    );
    basemaps = {
      "<span style='color':gray>Openstreetmap</span> ": osm,
      Satellite: Esri_WorldImagery,
      "Mapbox Streets": streets,
      "Topo Map": OpenTopoMap,
    };

    lyrTowns = L.geoJSON
      .ajax("data/towns.geojson", {
        pointToLayer: returnTownsMarker,
        filter: filterTown,
      })
      .addTo(map);
    lyrHotels = L.geoJSON
      .ajax("data/hetels.geojson", {
        pointToLayer: returnHotelMarker,
        filter: filterHotels,
      })
      .addTo(map);
    lyrConst = L.geoJSON
      .ajax("data/land percels.geojson", {
        style: style,
        onEachFeature:onEachFeature,
        filter:filterLandPayMode,filterLandPayMode,filterLandType,
      })
      .addTo(map);
      // search suggestions
      lyrConst.on('data:loaded', function(){
        var att = json.properties;
        PercelLocationsIDs.sort(function(a,b){return a-b});
        $("#txtFindLand").autocomplete({
          source:PercelLocationsIDs
        });
      });
    //****************************************************************Layers definition
    overlayMaps = {
      Towns: lyrTowns,
      hotels: lyrHotels,
      Constituencies: lyrConst,
    };
    //****************************************************************Layers controls bar
    layerControl = L.control.layers(basemaps, overlayMaps).addTo(map);
    //****************************************************************changing the town layer json file data color and from point to circle marker.
    function returnTownsMarker(json, latlon) {
      var att = json.properties;
      return L.circleMarker(latlon, {
        radius: 6,
        color: "deeppink",
      }).bindTooltip(
        "<h4> Town Name: " +
          att.TOWN_NAME +
          "</h4><h5> coordinate: Coordinates</h5>"
      );
    }
    //**************************************************************** Hotel makker decorations based on the proprties.
    function returnHotelMarker(json, latlon) {
      var att2 = json.properties;
      if (att2.TYPE == "tented camp") {
        var clr = "lightblue";
      } else if (att2.TYPE == "lodge") {
        var clr = "lightgreen";
      } else if (att2.TYPE == "camp site") {
        var clr = "purple";
      } else if (att2.TYPE == "hotel") {
        var clr = "yellow";
      } else {
        var clr = "orange";
      }
      return L.circleMarker(latlon, { radius: 5, color: clr }).bindTooltip(
        "<h4> Name: " +
          att2.NAME +
          "</h4><p style{color:'orange'}> Type:" +
          att2.TYPE +
          "</p>"
      );
    }
    //****************************************************************Hotel Filter function fo removing rows without a name
    function filterHotels(json) {
      var att9 = json.properties;
      if (att9.NAME != null) {
        return true;
      } else {
        return false;
      }
    }
   //****************************************************************tOWNS FILTER FUNCTION
    function filterTown(json) {
      var att1 = json.properties;
      if (att1.NAME != "") {
        return true;
      } else {
        return false;
      }
    }
    //**************************************************************** Truing to push all the results in the attributes to the search bar
    function proccessLandPercels(json,lyr) {
      var att = json.properties;
      lyr.bindTooltip("<h4>Land for sale</h4>")
      PercelLocationsIDs.push(att.const_nam.toString());
    }
    //****************************************************************Color pallet for our shapefiles constituencies
    function getColor(d) {
      return d > 1000
        ? "#f7fcfd"
        : d > 500
        ? "#e5f5f9"
        : d > 200
        ? "#ccece6"
        : d > 100
        ? "#99d8c9"
        : d > 50
        ? "#66c2a4"
        : d > 20
        ? "#41ae76"
        : d > 10
        ? "#238b45"
        : "#005824";
    }
    //****************************************************************legend addition for description of the laayers
    
    //**************************************************************** constituencies styling function
    function style(feature) {
      return {
        fillColor: getColor(feature.properties.const_no),
        weight: 1,
        opacity: 1,
        color: "orange",
        dashArray: "2",
        fillOpacity: 0.3,
      };
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
      
    }
    //****************************************************************highlight function
    function highlightFeature(e) {
      var layer = e.target;
      layer.openPopup();
      layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7,
      });
      info.update(layer.feature.properties);
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToBack();
      }
    }
    //**************************************************************** Function for resetting highlight on the layer
    function resetHighlight(e) {
      lyrConst.resetStyle(e.target);
      info.update();
    }
    //****************************************************************zoom to feature function
    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }
    //**************************************************************** Defining click listener
    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout:resetHighlight,
        click:zoomToFeature
      });
      
    }
    //***************************************************************** Custom Infrmation Information control

    var info = L.control();
    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div','info');
      this.update();
      return this._div;
    };
    // //**************************************************************** Mehthode for updating the the control based on feature properties passed
    info.update = function(lyrConst){
      this._div.innerHTML ='<h6>LAND INFORMATION</h6>'+(lyrConst?
      '<b><h6>County: </h6></b>'+lyrConst.county_nam+
      '<b><h6>Constituency: </h6>'+lyrConst.const_nam+
        '</b><br/> <h6>Land Area: </h6>'+lyrConst.Shape_Area+' km<sup>2</sup>'
      :'hover over a percel of land.')
    };
    info.addTo(map);
    //**************************************************************** Filter functionalities that show on the map.
    // **************************************************************** Search Functionalities
    function returnLandByID(id) {
        var arLayers = lyrConst.getLayers();
        for (i = 0; i < arLayers.length-1; i++) {
            var landId = arLayers[i].feature.properties.const_nam;
            // console.log(landId);
            if (landId == id ) {
                return arLayers[i];
            }
        }
        return false;
      }
    // handlincg click event of search button
    $("#btnFindLand").click(function () {
        var id = $("#txtFindLand").val(); // finding the the value in search box
        var lyr = returnLandByID(id);
        if (lyr) {     
            if (lyrSearch) {
                lyrSearch.remove();// removes the curent search entry and adds another.
            }
            lyrSearch = L.geoJSON(lyr.toGeoJSON(),{style:{color:'orange',weight:5,opacity:0.5}}).addTo(map); //Adding the searched layer to the group
            map.fitBounds(lyr.getBounds().pad(1)); //zooming to the bounds of the recent search.
           
        }else{
            $("#divLandError").html("****Location Not found***")
        }
    });
    //**************************************************************** Filter payment option
    $('input[name=fltpay]').click(function(){
      PercelLocationsIDs = [];
      lyrConst.refresh();
    })

    function filterLandPayMode(json) {
      var att = json.properties;
      var landPrice = $("input[name='fltpay']:CHECKED").val(); //jquery sudo selector for selecting the radio batton that is checked 
                                                              // retrives the value using.val() and assigns it to a variable
      if (landPrice == 'ALL') {
        return true;  // checkes if the filter function has a value of ALL and returns true hence all features will be included in the layer
                      //then every feature will be included in the filter layer
      }
      else{
        return (att.payMode == landPrice);    // returns the payment mode of the radio box selected
      }
    }
    $("#btnFilterSizes").click(function () {
      filterLandPayMode
      lyrConst.refresh();
    })
    //function for checking all check boxes using the button id listed
    $("#btnFilterall").click(function () {
      $('input[name= fltLSize]').prop('checked',true);
    })
    //jquery for unchecking all using the btn filter none
    $("#btnFilterNone").click(function () {
      $('input[name = fltSize]').prop('checked', false)
    })
    function filterLandSizes(json) {
      var arFilterLandSize=[]; // array containing the values of all checkboxes
      //selecting all the checkboxes using the name attribute
      //using jquery each function to loop through each loop checking
      $('input[name = fltSize]').each(function () {
        // checking through if statement if the checkbox is selected by accessing it through the checked varriabl
        if (this.checked) {
          //if the results are checked then we add the value to the array variable
          arFilterLandSize.push(this.value);
        }
      });

      var att = json.properties;
      //check the attribute of each feature
      switch (att.size) {
        case '50by100':
          return (arFilterLandSize.indexOf('50by100')>=0);
          break;
          case '40by80':
            return (arFilterLandSize.indexOf('40by80')>=0);
            break;
          case 'oneAcre':
            return (arFilterLandSize.indexOf('oneAcre')>=0);
            break;
          case 'twoAcre':
            return (arFilterLandSize.indexOf('twoAcre')>=0);
            break;
        default:
          return (arFilterLandSize.indexOf('other')>=0);
          break;
      }
    }
    $("#btnFilterType").click(function () {
      lyrConst.refresh();
    })

    function filterLandType(json) {
      var arFilterLandType = [];
      $('input[name= fltType]').each(function () {
        if (this.checked) {
          arFilterLandType.push(this.value);
        }
      });

      var att = json.properties;
      switch (att.type) {
        case 'Residential':
          return (arFilterLandType.indexOf('Residentual')>=0);
          break;
        case 'Apartments':
          return (arFilterLandType.indexOf('Apartments')>=0);
          break;
        case 'Ranching':
          return (arFilterLandType.indexOf('Ranching')>=0);
          break;
        case 'Farming':
          return (arFilterLandType.indexOf('Farming')>=0);
          break;
        default:
          break;
      }
      
    }
