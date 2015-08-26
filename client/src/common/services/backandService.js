(function () {
  'use strict';

  function backandService($http, Backand) {

    var factory = {};

    factory.listOfObjects = function() {
      return $http({
        method: 'GET',
        url: Backand.getApiUrl() + '/1/table/config',
        params: {
          pageSize: 200,
          pageNumber: 1,
          filter: '[{fieldName:"SystemView", operator:"equals", value: false}]',
          sort: '[{fieldName:"captionText", order:"asc"}]'
        }
      });
    };

    factory.objectData = function(name, pageSize, pageNumber, sort, filter) {
      return $http({
        method: 'GET',
        url: Backand.getApiUrl() +  '/1/objects/' + name,
        params: {
          pageSize: pageSize || 5,
          pageNumber: pageNumber || 1,
          filter: filter || '',
          sort: sort || ''
        }
      });
    };

    //Call makePayment on demand action
    factory.makePayment = function(amount, token){
      return $http({
        method: 'GET',
        url:  Backand.getApiUrl() + '/1/objects/action/items?name=makePayment',//
        params:{
          parameters:{
            token: token,
            amount: amount
          }
        }
      });
    };
    //Call PayPalPayment on demand action
    factory.makePayPalPayment = function(amount){
      return $http({
        method: 'GET',
        url: Backand.getApiUrl()  +  '/1/objects/action/items/1?name=PayPalPayment',
        params:{
          parameters:{
            amount: amount
          }
        }
      });
    };

    //Call PayPalApproval on demand action
    factory.makePayPalApproval = function(payerId,paymentId){
      return $http({
        method: 'GET',
        url: Backand.getApiUrl() +  '/1/objects/action/items/1?name=PayPalApproval',
        params:{
          parameters:{
            payerId: payerId,
            paymentId:paymentId
          }
        }
      });
    };
    return factory;

  }

  angular.module('common.services.backand',[])
    .factory('BackandService', ['$http','Backand', backandService]);
})();
