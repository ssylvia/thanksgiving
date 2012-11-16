  dojo.provide("utilities.main");

  dojo.require("esri.map");
  dojo.require("esri.layout");
  dojo.require("esri.widgets");
  dojo.require("esri.arcgis.utils");
  dojo.requireLocalization("esriTemplate","template");

  //Jquery Layout
    $(document).ready(function(e) {
      $("#legendToggle").click(function(){
    	if ($("#legendDiv").css('display')=='none'){
		  $("#legTogText").html(i18n.viewer.legToggle.up);
		}
		else{
		  $("#legTogText").html(i18n.viewer.legToggle.down);
		}
		$("#legendDiv").slideToggle();
	  });
    });

  utilities.main = {};
  dojo.mixin(utilities.main,{

      map:null,
      urlObject:null,
      i18n:null,

      initMap:function() {
       utilities.main.patchID();

       //get the localization strings
  	   i18n = dojo.i18n.getLocalization("esriTemplate","template");

	   dojo.byId('loading').innerHTML = i18n.viewer.loading.message;
	   dojo.byId('legTogText').innerHTML = i18n.viewer.legToggle.down;

       if(configOptions.geometryserviceurl && location.protocol === "https:"){
         configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:','https:');
       }
       esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);

       if(!configOptions.sharingurl){
         configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
       }
       esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;

       if(!configOptions.proxyurl){
         configOptions.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
       }

       esri.config.defaults.io.proxyUrl =  configOptions.proxyurl;

       esri.config.defaults.io.alwaysUseProxy = false;

       urlObject = esri.urlToObject(document.location.href);
       urlObject.query = urlObject.query || {};

       if(urlObject.query.title){
         configOptions.title = urlObject.query.title;
       }
       if(urlObject.query.subtitle){
         configOptions.subtitle = urlObject.query.subtitle;
       }
	   if(urlObject.query.legend){
         configOptions.legend = urlObject.query.legend;
       }
       if(urlObject.query.webmap){
         configOptions.webmap = urlObject.query.webmap;
       }
       if(urlObject.query.bingMapsKey){
         configOptions.bingmapskey = urlObject.query.bingMapsKey;
       }

	   	   //is an appid specified - if so read json from there
	  if(configOptions.appid || (urlObject.query && urlObject.query.appid)){
		var appid = configOptions.appid || urlObject.query.appid;
		var requestHandle = esri.request({
		  url: configOptions.sharingurl + "/" + appid + "/data",
		  content: {f:"json"},
		  callbackParamName:"callback",
		  load: function(response){
               if(response.values.webmap !== undefined){configOptions.webmap = response.values.webmap;}
			   if(response.values.title !== undefined){configOptions.title = response.values.title;}
			   if(response.values.subtitle !== undefined){configOptions.subtitle = response.values.subtitle;}
			   if(response.values.legend !== undefined){configOptions.legend = response.values.legend;}

			   utilities.main.createMap();
		  },
		  error: function(response){
			var e = response.message;
		   alert(i18n.viewer.errors.createMap +  response.message);
		  }
		});
		 }else{
			utilities.main.createMap();
		 }
	 },

     createMap: function(){

       if (configOptions.legend === "false" || configOptions.legend === false){
           $("#legendCon").hide();
	   }

	   var mapDeferred = esri.arcgis.utils.createMap(configOptions.webmap, "map", {
         mapOptions: {
           slider: true,
           sliderStyle:"small",
           nav: false,
           wrapAround180:true
         },
         ignorePopups:false,
         bingMapsKey: configOptions.bingmapskey
       });

       mapDeferred.addCallback(function (response) {

		 document.title = configOptions.title|| response.itemInfo.item.title || "";
         dojo.byId("title").innerHTML = configOptions.title ||response.itemInfo.item.title || "";
         dojo.byId("subtitle").innerHTML = configOptions.subtitle|| response.itemInfo.item.snippet || "";

         map = response.map;

		 dojo.connect(map,"onUpdateEnd",utilities.main.hideLoader);

         var layers = response.itemInfo.itemData.operationalLayers;
         if(map.loaded){
           utilities.main.initUI(layers);
           utilities.layout.initApp();
         }
         else{
           dojo.connect(map,"onLoad",function(){
             utilities.main.initUI(layers);
             utilities.layout.initApp();
           });
         }
         //resize the map when the browser resizes
         dojo.connect(dijit.byId('map'), 'resize', map,map.resize);
       });

       mapDeferred.addErrback(function (error) {
         alert(i18n.viewer.errors.createMap + dojo.toJson(error.message));
       });

     },

     initUI: function(layers) {
       //add chrome theme for popup
       dojo.addClass(map.infoWindow.domNode, "chrome");
       //add the scalebar
       var scalebar = new esri.dijit.Scalebar({
         map: map,
         scalebarUnit:i18n.viewer.main.scaleBarUnits //metric or english
       });

       var layerInfo = utilities.main.buildLayersList(layers);

       if(layerInfo.length > 0){
         var legendDijit = new esri.dijit.Legend({
           map:map,
           layerInfos:layerInfo
         },"legendDiv");
         legendDijit.startup();
       }
       else{
         $("#legendToggle").hide();
       }
     },

     //build a list of layers to dispaly in the legend
  buildLayersList: function(layers){

 //layers  arg is  response.itemInfo.itemData.operationalLayers;
  var layerInfos = [];
  dojo.forEach(layers, function (mapLayer, index) {
      var layerInfo = {};
      if (mapLayer.featureCollection && mapLayer.type !== "CSV") {
        if (mapLayer.featureCollection.showLegend === true) {
            dojo.forEach(mapLayer.featureCollection.layers, function (fcMapLayer) {
              if (fcMapLayer.showLegend !== false) {
                  layerInfo = {
                      "layer": fcMapLayer.layerObject,
                      "title": mapLayer.title,
                      "defaultSymbol": false
                  };
                  if (mapLayer.featureCollection.layers.length > 1) {
                      layerInfo.title += " - " + fcMapLayer.layerDefinition.name;
                  }
                  layerInfos.push(layerInfo);
              }
            });
          }
      } else if (mapLayer.showLegend !== false && mapLayer.layerObject) {
      var showDefaultSymbol = false;
      if (mapLayer.layerObject.version < 10.1 && (mapLayer.layerObject instanceof esri.layers.ArcGISDynamicMapServiceLayer || mapLayer.layerObject instanceof esri.layers.ArcGISTiledMapServiceLayer)) {
        showDefaultSymbol = true;
      }
      layerInfo = {
        "layer": mapLayer.layerObject,
        "title": mapLayer.title,
        "defaultSymbol": showDefaultSymbol
      };
        //does it have layers too? If so check to see if showLegend is false
        if (mapLayer.layers) {
            var hideLayers = dojo.map(dojo.filter(mapLayer.layers, function (lyr) {
                return (lyr.showLegend === false);
            }), function (lyr) {
                return lyr.id;
            });
            if (hideLayers.length) {
                layerInfo.hideLayers = hideLayers;
            }
        }
        layerInfos.push(layerInfo);
    }
  });
  return layerInfos;
  },

  patchID: function() {  //patch id manager for use in apps.arcgis.com
       esri.id._isIdProvider = function(server, resource) {
       // server and resource are assumed one of portal domains

       var i = -1, j = -1;

       dojo.forEach(this._gwDomains, function(domain, idx) {
         if (i === -1 && domain.regex.test(server)) {
           i = idx;
         }
         if (j === -1 && domain.regex.test(resource)) {
           j = idx;
         }
       });

       var retVal = false;

       if (i > -1 && j > -1) {
         if (i === 0 || i === 4) {
           if (j === 0 || j === 4) {
             retVal = true;
           }
         }
         else if (i === 1) {
           if (j === 1 || j === 2) {
             retVal = true;
           }
         }
         else if (i === 2) {
           if (j === 2) {
             retVal = true;
           }
         }
         else if (i === 3) {
           if (j === 3) {
             retVal = true;
           }
         }
       }

       return retVal;
     };
    },

    hideLoader:function(){
      $("#loadingCon").hide();
	}


  });