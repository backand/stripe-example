(function() {
  'use strict';

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
  });

  function config(BackandProvider, $stateProvider, $urlRouterProvider, $logProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/');
    $logProvider.debugEnabled(true);

    BackandProvider.manageDefaultHeaders();
    BackandProvider.setAppName('integration');
    BackandProvider.setAnonymousToken('4f81b419-e533-4f2b-8d2d-86fda2824b90');

    $httpProvider.interceptors.push('httpInterceptor');
    $stateProvider
      .state('root', {
        views: {
          'header': {
            templateUrl: 'src/common/header.tpl.html',
            controller: 'HeaderCtrl'
          },
          'footer': {
            templateUrl: 'src/common/footer.tpl.html',
            controller: 'FooterCtrl'
          }
        }
      });
  }

  function MainCtrl($log) {
    $log.debug('MainCtrl loaded!');
  }

  function run($log) {
    $log.debug('App is running!');
  }

  angular.module('app', [
      'ui.router',
      'angular-stripe',
      'backand',
      'ngCookies',
      'home',
      'getting-started',
      'common.header',
      'common.footer',
      'common.services.backand',
      'common.services.data',
      'common.directives.version',
      'common.filters.uppercase',
      'common.interceptors.http',
      'templates'
    ])
    .config(config)
    .config(function (stripeProvider) {
      //Enter your Stripe publish key or use Backand test account
      stripeProvider.setPublishableKey('pk_test_pRcGwomWSz2kP8GI0SxLH6ay');
    })
    .run(run)
    .controller('MainCtrl', MainCtrl)
    .value('version', '1.1.0');
})();
