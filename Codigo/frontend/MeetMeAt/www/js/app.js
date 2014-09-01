//  __  __           _   __  __              _   
// |  \/  |         | | |  \/  |        /\  | |  
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_ 
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_ 
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

(function($){
    
    'use strict';

    /**
     * Application
     */
    app = {
    	name : 'meetmeat',
    	models: {
    		_m : [],
    		all : function() {
    			return this._m;
    		},
    		register : function(name,obj) {
    			this._m[name] = obj;
    		},
    		get : function(name) {
    			return this._m[name];
    		}
    	},
    	modules: {
    		_m : [],
    		all : function() {
    			return this._m;
    		},
    		register : function(name,obj,tab) {
    			this._m[name] = { 'm': obj, 't': tab };
    		},
    		get : function(name) {
    			return this._m[name].m;
    		},
    		onTabChange : function(event) {
    			var tabMod = null;
    			for (var i in this._m) {
    				var mod = this._m[i];
    				if ( mod.t == event.index ) {
    					tabMod = mod.m;
    					break;
    				}
    			}
    			if ( tabMod != null ) {
    				tabMod.initTabbar();
    			}
    		}
    	},
    	tabs : {
    		HOME : 0,
    		EVENTS : 1
    	},
    	init : function() {
    		// Initialize models
    		var models = this.models.all();
    		for (var k in models) {
				var model = this.models.get(k);
    			model.init();
    			console.log('Model ' + i + ' Initialized');
    		}
    		// Initialize modules
    		var modules = this.modules.all();
    		for (var i in modules) {
    			var module = this.modules.get(i);
    			module.init();
    			console.log('Module ' + i + ' Initialized');
    		}
    		console.log('Application Initialized');
    	}
    };

	/**
     * Application API
     */
    app.api = {
    	endpoint : 'http://meetmeat.andreybolanos.com/rest/',
		request : function(url, params) {
            var promise = $.Deferred();
			var method = (params && params.method) ? params.method : "GET";
            //var webservice = this.endpoint + url + '.json';
            var webservice = this.endpoint + url;
            console.log('Calling WebService [' + method + ':' + webservice + ']');
    		$.ajax(webservice, {
                crossDomain: true,
    			type: method,
                dataType: 'json'
    		})
    		.done(function(data){
                promise.resolve(data);
            })
    		.fail(function(jqxhr,status,error){
                promise.reject(jqxhr,error);
            });
            return promise;
    	},
        row: function(tableName,id) {
            var promise = $.Deferred();
            this.request(tableName + '/' + id).then(function(data){
                promise.resolve(data);
            },function(jqxhr,error){
                promise.reject(error);
            });
            return promise;
        },
        table: function(tableName,callbacks) {
            var self = this;
            var promise = $.Deferred();
            this.request(tableName).then(function(data){
                var promises = [];
                $.each(data,function(i,v){
                    var row = data[i];
                    var innerPromise = $.Deferred();
                    self.row(tableName,row.value).then(function(rowData){
                        callbacks.cacheRow(rowData);
                        innerPromise.resolve(rowData);
                    },function(jqxhr,error){
                        innerPromise.reject(error);
                    });
                    promises.push(innerPromise);
                });
                $.when.apply($, promises).then(function(){
                    promise.resolve();
                });
            },function(jqxhr,error){
                if (jqxhr.responseText == "") {
                    promise.resolve();
                } else {
                    promise.reject(error);
                }
            });
            return promise;
        }
    };

    /**
     * Handlebars Helpers
     */
    Handlebars.registerHelper('events-list', function(events) {
        var html = '';
        html += '<ons-list class="events-list">';
        if ( events && events.length > 0 ) {
            for (var i=0; i < events.length; i++) {
                var event = events[i];
                var id = event.id;
                var title = event.title;
                html += '<ons-list-item class="event-list-item" modifier="tappable" data-id="' + id + '">' + title + '</ons-list-item>';
            }
        } else {
            html += '<ons-list-item>No events</ons-list-item>';
        }
        html += '</ons-list>';
        return new Handlebars.SafeString(html);
    });

    // Initialize Angular
    angular.module(app.name, ['onsen.directives']);

    // Onsen Ready
    ons.ready(function() {
    	// Tabbar change event
    	tabbar.on('postchange',function(event){
            app.modules.onTabChange.call(app.modules,event);
        });
    	// Initialize
    	app.init();
    });

}(jQuery));