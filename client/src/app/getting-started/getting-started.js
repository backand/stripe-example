(function() {
  'use strict';

  /**
   * @name  config
   * @description config block
   */
  function config($stateProvider) {
    $stateProvider
      .state('root.getting-started', {
        url: '/getting-started',
        views: {
          '@': {
            templateUrl: 'src/app/getting-started/getting-started.tpl.html',
            controller: 'GettingStartedCtrl as start'
          }
        }
      });
  }

  /**
   * @name  gettingStartedCtrl
   * @description Controller
   */
  function GettingStartedCtrl($log, $state, Backand, BackandService) {

    var start = this;

    (function init() {
      start.username = "";
      start.password = "";
      start.appName = "";
      start.objects = null;
      start.isLoggedIn = false;
      start.objectData = "{}";
      start.results = "Not connected to Backand yet";
      loadObjects();
    }());


    start.signin = function () {

      Backand.setAppName(start.appName);

      Backand.signin(start.username, start.password)
        .then(
        function () {
          start.results = "you are in";
          loadObjects();
        },
        function (data, status, headers, config) {
          $log.debug("authentication error", data, status, headers, config);
          start.results = data;
        }
      );
    };

    start.signout = function (){
      Backand.signout();
      $state.go('root.getting-started',{}, {reload: true});
    }

    function loadObjects() {
      BackandService.listOfObjects().then(loadObjectsSuccess, errorHandler);
    }

    function loadObjectsSuccess(list) {
      start.objects = list.data.data;
      start.results = "Objects loaded";
      start.isLoggedIn = true;
    }

    start.loadObjectData = function(){
      BackandService.objectData(start.objectSelected).then(loadObjectDataSuccess, errorHandler);
    }
    function loadObjectDataSuccess(ObjectData) {
      start.objectData = ObjectData.data.data;
    }

    function errorHandler(error, message) {
      $log.debug(message, error)
    }
  }

  angular.module('getting-started', [])
    .config(config)
    .controller('GettingStartedCtrl', ['$log', '$state', 'Backand','BackandService', GettingStartedCtrl]);
})();
