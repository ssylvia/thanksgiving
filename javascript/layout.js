dojo.provide("utilities.layout");

utilities.layout = {};
dojo.mixin(utilities.layout,{
    
    foods : {
        "turkey" : {
            "layerName" : "turkey",
            "linkText" : "Turkey",
            "description" : "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.<br><br>It is a paradisematic country, in which roasted parts of sentences fly into your mouth. Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way."
        },
        "sweetPotatoes" : {
            "layerName" : "potatoes",
            "linkText" : "Sweet Potatoes",
            "description" : "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.<br><br>Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane."
        },
        "cranberries" : {
            "layerName" : "cranberries",
            "linkText" : "Cranberries",
            "description" : "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.<br><br>Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar."
        },
        "greenBeans" : {
            "layerName" : "greenbeans",
            "linkText" : "Green Beans",
            "description" : "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia.<br><br>Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean. A small river named Duden flows by their place and supplies it with the necessary regelialia."
        }
    },
    
    initApp : function(){
        $("#description").html(this.foods.turkey.description);
        dojo.forEach(this.getLayerByName(map,"thanksgiving",true,false),function(lyr){
            lyr.setOpacity(0);
        });
        dojo.forEach(this.getLayerByName(map,this.foods.turkey.layerName,true,false),function(lyr,i){
            utilities.layout.fadeLayerIn(map,lyr);
        });
    },
    
    getLayerByName : function(mapVariable,layerName,searchMainLayers,searchGraphicsLayers){
        var layers = [];
        
        if(searchMainLayers !== false){
            dojo.forEach(mapVariable.layerIds,function(lyr){
                if(lyr.toLowerCase().search(layerName.toLowerCase()) !== -1){
                    layers.push(mapVariable.getLayer(lyr));
                }
            });
        }
        if(searchGraphicsLayers !== false){
            dojo.forEach(mapVariable.graphicsLayerIds,function(lyr){
                if(lyr.toLowerCase().search(layerName.toLowerCase()) !== -1){
                    layers.push(mapVariable.getLayer(lyr));
                }
            });
        }
        
        return layers;
    },
    
    startFade : function(layer){
        dojo.forEach(this.getLayerByName(map,"thanksgiving",true,false),function(lyr){
            lyr.fading = false;
            if (lyr === layer) {
                setTimeout(function() {
                    lyr.fading = true;
                    utilities.layout.fadeLayerIn(map,lyr);
                }, 11);
            }
            else{
                setTimeout(function() {
                    lyr.fading = true;
                    utilities.layout.fadeLayerOut(map,lyr);
                }, 11);
            }
        });
    },
    
    fadeLayerIn : function(mapVariable,layer){
        if(!layer.fading){
            layer.fading = true;
        }
        if(layer.opacity < 1 && layer.fading === true){
            layer.setOpacity(layer.opacity + 0.05);
            setTimeout(function() {
                utilities.layout.fadeLayerIn(mapVariable,layer);
            }, 10);
        }
        else{
            layer.setOpacity(1);
            layer.fading = false;
        }
    },
    
    fadeLayerOut : function(mapVariable,layer){
        if(!layer.fading){
            layer.fading = true;
        }
        if(layer.opacity > 0 && layer.fading === true){
            layer.setOpacity(layer.opacity - 0.05);
            setTimeout(function() {
                utilities.layout.fadeLayerOut(mapVariable,layer);
            }, 10);
        }
        else{
            layer.setOpacity(0);
            layer.fading = false;
        }
    }
    
});