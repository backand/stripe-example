(function() {
  'use strict';

  /**
   * @name  config
   * @description config block
   */
  function config($stateProvider) {
    $stateProvider
      .state('root.home', {
        url: '/',
        views: {
          '@': {
            templateUrl: 'src/app/home/home.tpl.html',
            controller: 'HomeCtrl as home',
            resolve: {
              data: function(DataService) {
                return DataService.get();
              }
            }
          }
        }
      });
  }

  /**
   * @name  HomeCtrl
   * @description Controller
   */
  function HomeCtrl(stripe, BackandService) {
    var self = this;

    self.charge = function(){

      self.error = "";
      self.success = "";

      var form = angular.element(document.querySelector('#payment-form'))[0];

      return stripe.card.createToken(form)
        .then(function (token) {
          console.log('token created for card ending in ', token.card.last4);

          return BackandService.paymentExample(form.amount.value, token.id )
        })
        .then(function (payment) {
          self.success = 'successfully submitted payment for $' + payment.data.data.amount/100;
        })
        .catch(function (err) {
          if (err.type && /^Stripe/.test(err.type)) {
            self.error = 'Stripe error: ' +  err.message;
          }
          else {
            self.error = 'Other error occurred, possibly with your API' + err.message;
          }
        });
    }


  }

  angular.module('home', [])
    .config(config)
    .controller('HomeCtrl',['stripe','BackandService', HomeCtrl]);
})();
