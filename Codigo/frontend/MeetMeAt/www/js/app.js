//  __  __           _   __  __              _
// |  \/  |         | | |  \/  |        /\  | |
// | \  / | ___  ___| |_| \  / | ___   /  \ | |_
// | |\/| |/ _ \/ _ \ __| |\/| |/ _ \ / /\ \| __|
// | |  | |  __/  __/ |_| |  | |  __// ____ \ |_
// |_|  |_|\___|\___|\__|_|  |_|\___/_/    \_\__|

// dependencies
var angular = angular || {},
	ons = ons || {},
	openFB = openFB || null,
	console = console || {},
	google = google || {};

// navigator (overwrite on page load)
var rootNavigator = null;

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

(function(angular, ons){

    'use strict';

	// Initialize Angular
    var module = angular.module('meetmeat', ['onsen']);
    module.constant('appName', 'MeetMeAt');
    module.constant('endpoint', 'http://meetmeat.andreybolanos.com/');
    module.constant('rest','rest/');
    module.constant('call','call/');
    module.config(function($locationProvider) {
    	$locationProvider.html5Mode(true);
    });

    /**
     * SERVICES
     */

    // User Service
    module.factory('UserService', function() {
    	var userData = null,
   			userType = 'FB',
   			access = null;

   		var UserService = {
   			isLogin : function() {
   				return (userData != null);
   			},
   			isAuth : function() {
   				return (access && access.private);
   			},
   			getUser : function() {
   				userData.type = userType;
   				return userData;
   			},
   			setUser : function(data) {
   				userData = data;
   			},
   			setAccess : function(data) {
   				if (data.id == userData.id) {
   					access = data;
   				}
   			},
   			getAccess : function() {
   				return access;
   			}
   		};

   		return UserService;
    });

   	// Authentication Service
   	module.factory('AuthenticationService', function(UserService, ApiService) { // jshint ignore:line

   		var AuthenticationService = {
   			facebookLogin : function() {
   				var self = this;
   				openFB.init({appId:'839453376075539'});
   				openFB.login(function(response) {
	                if(response.status === 'connected') {
	                    openFB.api({
	                        path: '/me',
	                        success: function(data) {
	                        	data.type = "FB";
	                        	UserService.setUser(data);
	                            self.route(true);
	                        }
	                    });
	                }
	            },{scope:'email,user_friends'}); // read_friendlists
   			},
   			testLogin : function() {
   				UserService.setUser({ id: 1, name: "User Pruebas", email: "pruebas@meetmeat.andreybolanos.com", type: 'Custom' });
   				this.route(true);
   			},
   			route : function(checkToken) {
   				// var self = this;
   				// Handshake! check token and wait for auth
   				if (checkToken) {
   					var access = UserService.getAccess();
   					if (access == null) {
   						// Enable handshake
   						// ApiService.token().then(function(){
   						// 	self.route(false);
   						// });
   						// return;
   						UserService.setAccess({ id: UserService.getUser().id, private: 't3s7' });
   					}
   				}
   				// token OK so lets route
   				if (!UserService.isLogin()) {
		    		rootNavigator.resetToPage('views/login.html');
		    	} else {
		    		rootNavigator.resetToPage('views/main.html', { animation: 'slide-left' });
		    	}
   			}
   		};

   		return AuthenticationService;
   	});

    // Api Service
    module.factory('ApiService', function($q, $http, endpoint, rest, call, UserService) {

    	var ApiService = {
    		token: function() {
   				var user = UserService.getUser(),
   					token = Math.floor(getRandomArbitrary(1,99999999999)),
   					url = rest + 'AuthCall.php?token=' + token + '&username=' + user.id;
   				return this.request(url, { method: 'GET', type: 'auth' }).then(function(data){
   					// transform access data into json
   					var access_parts = data.split(",");
   					var json = '{';
   					for (var i=0; i<access_parts.length; i++) {
   						var parts = access_parts[i].split("=");
   						access_parts[i] = parts;
   						json += '"' + parts[0] + '":"' + parts[1] + '"';
   						if (i+1 != access_parts.length) {
   							json += ',';
   						}
   					}
   					json += '}';
   					var jsonObj = jQuery.parseJSON(json);
   					console.log('Authorized', access_parts, json, jsonObj);
   					// store access token
   					UserService.setAccess(jsonObj);
   				});
   			},
    		request: function(url, params) {
    			// define parameters
	    		var method = (params && params.method) ? params.method : "GET",
    				data = (params && params.data) ? params.data : null,
    				type = (params && params.type) ? params.type : null,
    				webservice = endpoint + url;
    			// Check access always
    			if (type != 'auth' && !UserService.isAuth()) {
    				console.log('We are NOT authorized!');
    				return;
    			}
    			// process expected data type
    			switch(type) {
    				case "json":
    					webservice = webservice + '.json';
    					break;
    			}
    			// process data
    			if (data) {
    				data =  decodeURIComponent(jQuery.param(data)).replace(/&/g,"\r\n");
    			}
    			// make call
				console.log('Calling WebService', method, data, webservice);
				var promise = $http({method: method, url: webservice, data: data})
								.then(function(response){
									console.log('Success Call', method, data, webservice, response);
				    				return response.data;
				    			});
    			return promise;
    		},
    		post: function(url, obj) {
    			// append user id to create
    			var user = UserService.getUser();
    			obj.users_id = user.id;
    			// make call
    			return this.request(url, { method: 'POST', data: obj });
    		},
    		create: function(tableName, obj) {
    			var def = $q.defer(),
    				url = rest + tableName;
    			this.post(url, obj).then(function(id){
    				def.resolve(id);
    			});
    			return def.promise;
    		},
    		get: function(url, params) {
    			var getParams = $.extend({}, { method: 'GET', type: "json" }, params);
    			return this.request(url, getParams);
    		},
    		call: function(url, params) {
    			return this.request(call + url + '?' + jQuery.param(params), { method: 'GET' });
    		},
    		getTable: function(name) {
    			return this.get(rest + name, { cache: false });
    		},
    		getRow: function(tableName, id) {
    			var res = {};
    			if (id) {
    				res = this.get(rest + tableName + '/' + id, { cache: true });
    			}
    			return res;
    		},
    		getAll: function(tableName, saveRowCallback) {
    			var def = $q.defer(),
    				self = this;
    			this.getTable(tableName).then(function(data){
    				var rows = [];
    				angular.forEach(data, function(obj) {
    					var id = obj.value;
    					var idef = self.getRow(tableName, id).then(function(dataRow){
    						// transform api model to local model
    						var row = {};
    						dataRow.map(function(obj){
    							row[obj.field] = obj.value;
    						});
    						dataRow = row;
    						// return row
    						saveRowCallback(dataRow);
    					});
    					rows.push(idef);
    				});
    				$q.all(rows).then(function(){
						def.resolve();
					});
    			});
    			return def.promise;
    		}
    	};
    	return ApiService;
    });

	// Home Feed Service
	module.factory('HomeFeedService',function(UserService, ApiService) {
		var feeds = [];

		var HomeFeedService = {
			getFeeds: function() {
				return feeds;
			},
			addFeed: function(feed) {
				feeds.push(feed);
			},
			load: function() {
				var user = UserService.getUser(),
					self = this;
				feeds = [];
				return ApiService.getAll('homeFeed/events/' + user.id, function(event) {
					self.addFeed(event);
				});
			}
		};

		return HomeFeedService;
	});

	var EventAction = {
		CREATE: 1,
		EDIT: 2
	};

	var DateTransform = {
		DB: 'db',
		FORM: 'form'
	};

	// Events service
    module.factory('EventsService', function($q, ApiService) {
    	var events = [],
    		currentEvent = null,
    		table = 'events',
    		mode = null;

    	var EventsService = {
    		dateTransform : function(event, transform) {
    			switch (transform) {
    				case DateTransform.DB:
    					event.startTime = event.date + " " + event.startTime + ":00";
    					event.endTime = event.date + " " + event.endTime + ":00";
    					break;
    				case DateTransform.FORM:
    					var formRegex = /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2}):([0-9]{2})/,
    						mst = event.startTime.match(formRegex),
    						met = event.endTime.match(formRegex);
    					if (mst != null && met != null) {
    						event.startTime = mst[4] + ":" + mst[5] + ":" + mst[6];
    						event.endTime = met[4] + ":" + met[5] + ":" + met[6];
    					}
    					break;
    			}
    			return event;
    		},
    		createEvent : function(event) {
    			var self = this,
    				def = $q.defer();
    			// process dates
    			event = self.dateTransform(event, DateTransform.DB);
    			// Call api
    			ApiService.create(table, event).then(function(id) {
    				self.addEvent(event);
    				def.resolve(id);
    			});
    			return def.promise;
    		},
    		addEvent: function(event) {
    			events.push(event);
    		},
    		getEvents: function() {
    			return events;
    		},
    		load: function() {
    			var self = this;
    			events = [];
    			return ApiService.getAll(table, function(event) {
    				self.addEvent(event);
    			});
    		},
    		setCurrent: function(event) {
    			if (event != null) {
    				event = this.dateTransform(event, DateTransform.FORM);
    				// FIX!
    				event.photo = "img/party-thumb-big.jpg";
    			}
    			currentEvent = event;
    		},
    		getCurrent: function() {
    			return currentEvent;
    		},
    		setMode: function(EventAction) {
    			mode = EventAction;
    		},
    		getMode: function() {
    			return mode;
    		}
    	};

    	return EventsService;
    });

    // Friends service
    module.factory('FriendsService', function($q, ApiService){ // jshint ignore:line
    	var friends = [],
    		currentFriend = null,
    		table = 'users'; // jshint ignore:line

    	var FriendsService = {
    		addFriend: function(friend) {
    			friends.push(friend);
    		},
    		getFriends: function() {
    			return friends;
    		},
    		load: function() {
    			var def = $q.defer();
    			// friends = [];
    			// return ApiService.getAll(table, function(event) {
    			// 	self.addFriend(event);
    			// });
    			openFB.api({
    				path: '/me/friends', // friends using the app
    				success: function(list) {
    					console.log(list);
    					def.resolve();
    				},
    				error: function(error) {
    					console.log(error);
    					def.reject();
    				}
    			});
    			return def.promise;
    		},
    		setCurrent: function(friend) {
    			currentFriend = friend;
    		},
    		getCurrent: function() {
    			return currentFriend;
    		}
    	};

    	return FriendsService;
    });

    // Modal service
    module.factory('ModalService', function($rootScope) {
    	var defaults = { message: '', icon: 'ion-sad' };

    	var ModalService = {
    		set: function(msg, icon) {
    			$rootScope.modal.message = (msg) ? msg : defaults.message;
	    		$rootScope.modal.icon = (icon) ? icon  : defaults.icon;
    		},
    		get: function() {
    			return window.modal;
    		},
    		show: function() {
    			this.get().show();
	    	},
	    	hide: function() {
	    		this.get().hide();
	    	},
	    	critical: function(msg, icon) {
				this.set(msg, icon);
	    		this.show();
	    	},
	    	error: function(msg) {
	    		this.notify(msg,'ion-sad');
	    	},
	    	success: function(msg) {
	    		this.notify(msg, 'ion-happy');
	    	},
	    	notify: function(msg, icon) {
	    		var self = this;
	    		self.set(msg, icon);
	    		self.show();
	    		setTimeout(function(){
	    			self.hide();
	    		},3000);
	    	}
    	};

    	return ModalService;
    });

    // Geolocation service
    module.factory('GeolocationService', function($q) {
    	var GeolocationService = {
    		getPosition: function() {
    			var def = $q.defer();
    			navigator.geolocation.getCurrentPosition(function(position) {
    				// GetPosition object
    				def.resolve(position);
    			}, function(error) {
    				// error
    				def.reject(error);
    			});
    			return def.promise;
    		}
    	};

    	return GeolocationService;
    });

    // Map service
    module.factory('MapService', function(GeolocationService) {
    	var map = null,
    		myPositionMarker = null,
    		places = null,
    		placesMarkers = [],
    		mapOptions = {
				zoom: 14,
				draggable: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP
	        },
	        mapIcons = {
	        	STAR: "http://mt.google.com/vt/icon/name=icons/spotlight/star_L_8x.png",
	        	RED_DOT: "http://mt.google.com/vt/icon/name=icons/spotlight/measle_spotlight_L.png",
	        	GREEN_DOT: "http://mt.google.com/vt/icon/name=icons/spotlight/measle_green_8px.png"
	        };

	    var MapService = {
	    	setMap: function(id) {
	    		map = new google.maps.Map(document.getElementById(id), mapOptions);
	    	},
	    	getMyPosition: function() {
	    		return GeolocationService.getPosition();
	    	},
	    	centerMyPosition: function() {
	    		this.getMyPosition().then(function(position) {
					// Repostion map center
		    		var LatLng = new google.maps.LatLng(position.coords.latitude,
		    											position.coords.longitude);
					map.setCenter(LatLng);
					// Remove old position marker
					if (myPositionMarker != null) {
						myPositionMarker.setMap(null);
						myPositionMarker = null;
					}
					// Create my position marker
		    		myPositionMarker = new google.maps.Marker({
		    			map: map,
		    			position: LatLng,
		    			title: 'Mi posicion',
		    			icon: mapIcons.STAR
		    		});
		    	});
	    	},
	    	foursquare: function(fqr) {
	    		// Reposition map boundaries
	    		var sw = new google.maps.LatLng(fqr.suggestedBounds.sw.lat,
	    										fqr.suggestedBounds.sw.lng),
	    			ne = new google.maps.LatLng(fqr.suggestedBounds.ne.lat,
	    										fqr.suggestedBounds.ne.lng),
	    			bounds = new google.maps.LatLngBounds(sw,ne);
	    		map.fitBounds(bounds);
	    		// Clean old markers
	    		for (var j = 0; j < placesMarkers.length; j++) {
	    			placesMarkers[j].setMap(null);
	    		}
	    		placesMarkers = [];
	    		// Create new markers
	    		places = fqr.groups[0].items;
	    		for (var i = 0; i < places.length; i++) {
	    			var place = places[i],
	    				position = new google.maps.LatLng(place.venue.location.lat,
	    												  place.venue.location.lng);
	    			var marker = new google.maps.Marker({
		    			map: map,
		    			position: position,
		    			title: place.venue.name,
		    			icon: mapIcons.RED_DOT
		    		});
					placesMarkers.push(marker);
	    		}
	    	}
	    };

    	return MapService;
    });

    // Foursquare Service
    module.factory('FoursquareService', function($q, ApiService, MapService) {
    	var endpoint = "FourSquareCall.php",
    		currentVenue = null;

    	var FoursquareService = {
    		getVenues: function(params) {
    			var def = $q.defer();
    			MapService.getMyPosition().then(function(position){
    				var others = {
    					query: params.keywords,
    					venuePhotos: 1
    				};
    				if (params.radius) {
    					others.radius = params.radius;
    				}
    				var data = {
    					lat: position.coords.latitude,
    					long: position.coords.longitude,
    					otros: jQuery.param(others)
    				};
    				ApiService.call(endpoint,data).then(function(fqr){
    					MapService.foursquare(fqr.response);
    					def.resolve(fqr.response);
    				});
    			});
    			return def.promise;
    		},
    		setCurrent: function(venue) {
    			currentVenue = venue;
    		},
    		getCurrent: function() {
    			return currentVenue;
    		}
    	};

    	return FoursquareService;
    });

    /**
     * CONTROLLERS
     */

    // App Controller
    module.controller('AppController', function($http, AuthenticationService) {
    	// Setup
    	// var authToken;
		// $http.get('/auth.py').success(function(data, status, headers) {
		// 	authToken = headers('A-Token');
		// 	$scope.user = data;
		// });
    	// $http.defaults.headers.common.Authorization = 'Basic YmVlcDpib29w'
    	$http.defaults.cache = true;
    	$http.defaults.headers.post = { "Content-Type" : "text/plain" };

    	// Show initial view
    	ons.ready(function(){
    		AuthenticationService.route(false);
    	});
    });

    // Login
    module.controller('LoginController', function($scope, AuthenticationService) {
    	$scope.facebookLogin = function() {
    		AuthenticationService.facebookLogin();
    	};
    	$scope.testLogin = function() {
    		AuthenticationService.testLogin();
    	};
    });

    // Home
    module.controller('HomeController', function($scope, HomeFeedService) {
    	var nav = homeNavigator || null; // jshint ignore:line

    	$scope.loading = 'loading-in-progress';

    	HomeFeedService.load().then(function(){
    		$scope.feeds = HomeFeedService.getFeeds();
    		$scope.loading = 'loading-completed';
    	});
    });

    // Events list
	module.controller('EventsController', function($scope, EventsService) {
		var nav = eventsNavigator || null; // jshint ignore:line

		$scope.loading = 'loading-in-progress';

		EventsService.load().then(function(){
			$scope.events = EventsService.getEvents();
			$scope.loading = 'loading-completed';
		});

		$scope.view = function(index) {
			var event = $scope.events[index];
			EventsService.setCurrent(event);
			nav.pushPage('views/events/view.html');
		};

		$scope.create = function() {
			EventsService.setCurrent(null);
			EventsService.setMode(EventAction.CREATE);
			nav.pushPage('views/events/form.html');
		};
	});

	// Event view
	module.controller('EventViewController', function($scope, EventsService) {
		var nav = eventsNavigator || null; // jshint ignore:line

		$scope.event = EventsService.getCurrent();

		$scope.edit = function() {
			EventsService.setMode(EventAction.EDIT);
			nav.pushPage('views/events/form.html');
		};
	});

	// Event Form
    module.controller('EventFormController', function($scope, EventsService, ModalService) {
    	var nav = eventsNavigator || null; // jshint ignore:line

    	$scope.form = {};

    	if (EventsService.getMode() == EventAction.EDIT) {
    		$scope.form.isCreate = false;
    		$scope.event = EventsService.getCurrent();
    		var photo = $scope.event.photo;
    		$scope.event.hasPhoto = (photo !== "null" && photo !== null && photo !== "");
    	} else {
    		$scope.form.isCreate = true;
    		$scope.event = {};
    		$scope.event.hasPhoto = false;
    	}
    	$scope.form.isEdit = !$scope.form.isCreate;

    	$scope.formAction = function(action) {
    		var form = $scope.eventForm,
    			event = $scope.event;
    		if (form.$valid) {
    			EventsService.createEvent(event).then(function(id){
    				ModalService.success('Evento Creado #'+id);
    				nav.pushPage('views/events/activities.html');
    			});
    		} else {
    			ModalService.error('Revisa el formulario');
    		}
    	};
    });

    // Event Activities
    module.controller('EventActivitiesController', function($scope) {
    	var nav = eventsNavigator || null; // jshint ignore:line
    });

    // Search
    module.controller('SearchController', function($scope, MapService, FoursquareService, ModalService){
    	var nav = searchNavigator || null; // jshint ignore:line

    	$scope.loading = 'loading-on-hold';

    	$scope.results = {};
    	$scope.distances = [
    		{ name: '250mts', value: '250' },
    		{ name: '500mts', value: '500' },
    		{ name: '1km', value: '1000' },
    		{ name: '2km', value: '2000' },
    		{ name: '5km', value: '5000' },
    	];
    	$scope.search = {
    		distance: $scope.distances[0].value
    	};

    	MapService.setMap('search-map');

    	$scope.searchAction = function() {
    		var form = $scope.searchForm,
    			search = $scope.search;
    		if (form.$valid) {
    			$scope.loading = 'loading-in-progress';
    			var params = {
    				keywords: search.match,
    				radius: search.distance
    			};
    			FoursquareService.getVenues(params).then(function(fqr){
    				if (fqr.totalResults > 0) {
    					$scope.results = fqr.groups[0].items;
    				} else {
    					ModalService.error('No hay lugares para el filtro y la distancia indicados');
    				}
    				$scope.loading = 'loading-completed';
    			});
    		} else {
    			ModalService.error('¿Qué buscas?');
    		}
    	};

    	$scope.locate = function() {
    		MapService.centerMyPosition();
    	};
    	$scope.locate();

    	$scope.view = function(index) {
    		var venue = $scope.results[index].venue;
    		FoursquareService.setCurrent(venue);
    		nav.pushPage('views/places/view.html');
    	};
    });

	// Places
	module.controller('PlaceViewController', function($scope, FoursquareService) {
		var venue = FoursquareService.getCurrent();

		$scope.place = {
			id: venue.id,
			name: venue.name,
			photo: venue.featuredPhotos.items[0].prefix + "200x200" + venue.featuredPhotos.items[0].suffix,
			category: {
				name: venue.categories[0].name,
				icon: venue.categories[0].icon.prefix + "bg_32" + venue.categories[0].icon.suffix
			},
			rating: venue.rating,
			price: {
				currency: venue.price.currency,
				message: venue.price.message
			},
			stats: {
				checkins: venue.stats.checkinsCount,
				tips: venue.stats.tipCount
			}
		};
	});

	// Friends
    module.controller('FriendsController', function($scope, FriendsService) {
    	var nav = friendsNavigator || null; // jshint ignore:line

    	$scope.loading = 'loading-in-progress';

		FriendsService.load().then(function(){
			$scope.friends = FriendsService.getFriends();
			$scope.loading = 'loading-completed';
		});

		$scope.viewFriend = function(index) {
			var friend = $scope.friends[index];
			FriendsService.setCurrent(friend);
			nav.pushPage('views/friends/view.html');
		};
    });

    // Friend view
	module.controller('FriendViewController', function($scope, FriendsService) {
		$scope.friend = FriendsService.getCurrent();
	});

    // Profile
    module.controller('ProfileController', function($scope, UserService) {
    	var nav = profileNavigator || null; // jshint ignore:line

    	$scope.profile = UserService.getUser();
    });

	// Initialize
	module.run(function() {
		// Global settings

	});

})(angular, ons);