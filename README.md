# [backand-Payment-example (Stripe/PayPal)](https://github.com/backand/stripe-example/)

### Quick-and-Easy Third Party Integration With Stripe and PayPal

This is an example app demonstrating how to integrate Stripe with a Backand application. Stripe is a popular third-party API offering payment-related functionality, allowing you to accept payments for yourself as well as your customers. Whether you’re building a marketplace, mobile app, online storefront, or subscription service, [Stripe](https://stripe.com) has the features you need.

Payment systems should always be built with a solid back-end, in order to protect the security of your users and customers. With Backand's server-side actions, we'll be able to provide the piece of mind that comes with a custom-built server back end, but without the expense and effort.

In this example we will use **angular-stripe** to wrap Stripe's stripe.js file. You can either use this in your own applications, or make use of any other solution you choose.

## Prerequisites

You will need to have **node.js** set up on your machine before beginning. Once you've set up Node, you'll also need to install **gulp** and **bower**. Luckily, Node Package Manager (NPM) makes this simple:

```bash
  $ npm -g install gulp bower
```
    
## Getting started

First, we need to create an account with Backand and create the base app:

* Navigate to [backand.com](https://www.backand.com/) and click `Sign Up`
* Create an app. You can name the app whatever you like, but make sure to make note of the title you select.
* Click on your new app's URL. Don't navigate away from the next page.

Once an account and app have been created, we're ready to start building out the back end. In the "New Hosted Database" section of the current page, keep the default JSON and just click 'Next'.

Next, clone the application's source code onto your local machine: 

```bash
  $ git clone https://github.com/backand/stripe-example.git
  $ cd stripe-example
```
    
Before we can run the app, we need to use npm and bower to install the associated dependencies for the stripe example project:

```bash
  $ npm install
  $ bower install
```

Once the dependencies have been installed, we need to update the app's code to point at your new Backand application. Open the file **client/src/app/app.js** in a text editor, and make the following changes:

  * Replace **'Your-App-Name'** with the app name you selected when creating your Backand account
  * Replace **'Your-Anonymous-Token'** with your application's Anonymous token, obtained as follows:
    1. In Backand dashboard, under "Security & auth --> Configuration," enable Anonymous Access by clicking on the toggle on the right side of the page.
    2. Set the Anonymous users assigned role to 'User' in the provided drop down box.
    3. Copy the Anonymous Token from the text box in the Anonymous Access section.
    4. Replace **Your-Anonymous-Token** in your local copy of app.js with the value copied from the Backand dashboard.
  

## Configuring the App

Below we'll configure your Backand application. To get started:

1. Log in to [Backand](https://www.backand.com) using your admin login information
2. Open the application that you created in the previous section.

# Stripe

For Paypal integration please see [here](#paypal)
 
### Backand Action

Use the following steps to add an on-demand action that registers a payment with Stripe:

1. Open the Action tab for the `items` object (which can be found under the "Objects" menu in the Backand dashboard)
2. Click "+New Action" and enter the following details in the fields provided. Note that some fields for a step won't be available until the prior step has been completed:
  1. **Name:** makePayment
  2. **Event Trigger:** 'On Demand - Execute via REST API'
  3. **Type:** Server Side JavaScript Code
  4. **Input Parameters:** amount, token
  5. **JavaScript Code:** Past this code under the `// write your code here` comment, and before the `return {}` command

    ```javascript
      //Secret key - copy from your Stripe account https://dashboard.stripe.com/account/apikeys
      //or use Backand's test account
      var user = btoa("sk_test_hx4i19p4CJVwJzdf7AajsbBr:");
              
      response = $http({
        method: "POST",
        url: "https://api.stripe.com/v1/charges",
        params: {
            "amount":parameters.amount,
            "currency":"usd",
            "source": parameters.token
        },
        headers: {
            "Authorization": "Basic " + user,
            "Accept" : "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
      });
      
    return {"data":response};
    ```

  5. Press "Save"
  
## Run the app
  
Now we're ready to run the app! In your terminal window, simply type:

```bash    
  $ gulp serve
```

At this point, your application is running! You can access it at **[http://localhost:3000](http://localhost:3000)**.

  
## Code Review

From this point, we only have a few steps left before we can complete our Stripe integration. Review the following code and copy it into your app in order to get your Backand app talking to Stripe.

#### Update publish key

In the file **client/src/app/app.js**, update your publishable Stripe key. You can copy it from your Stripe dashboard at https://dashboard.stripe.com/account/apikeys, or you can use Backand's test account in the code below. The resulting code will look like the following:

```javascript
  .config(function (stripeProvider) {
    //Enter your Stripe publish key or use Backand test account
    stripeProvider.setPublishableKey('pk_test_pRcGwomWSz2kP8GI0SxLH6ay');
  }) 
```

#### Calling Stripe.js to Submit a Payment

The method **self.charge** in file **/client/src/app/home/home.js** gets the form's data and makes a call to Stripe, getting the payment token and calling the makePayment function, which is a wrapper for the Backand Action we created earlier (more on this in a moment).

```javascript
  self.charge = function(){

    self.error = "";
    self.success = "";

    //get the form's data
    var form = angular.element(document.querySelector('#payment-form'))[0];

    //Use angular-stripe service to get the token
    return stripe.card.createToken(form)
      .then(function (token) {
        console.log('token created for card ending in ', token.card.last4);

        //Call Backand action to make the payment
        return BackandService.makePayment(form.amount.value, token.id )
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
```

#### Backand Service to Call an On-Demand Action

The method **factory.makePayment** in the file **/client/src/common/services/backandService.js** calls the on-demand action we declared earlier in the dashboard. You must send the parameters **token** and **amount**, though you can send additional parameters as needed.

```javascript
  factory.makePayment = function(amount, token){
    return $http({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/objects/action/items?name=makePayment',
      params:{
        parameters:{
          token: token,
          amount: amount
        }
      }
    });
  }
```
## Adding additional functionality

After reviewing the code, you should have noticed that, under the covers, all that we are really doing is wrapping [Stripe's REST API](https://stripe.com/docs/api#intro). This API is provided both as a series of language libraries (there are versions for Ruby, Python, Go, and other languages), and as a series of HTTP endpoints. In fact, the code-based libraries simply wrap calls to the Stripe HTTP endpoints, giving you convenient function calls instead of HTTP request and response code to handle the functionality.

What this means is that, when adding new functionality, we can handle it through a back-end custom action however we see fit. As we are simply using JavaScript to fire off HTTP requests at Stripe's API, we can easily add additional calls to enhance our application. Explore Stripe's API docs in order to see what exactly is available to your app.

## A Note on Security

As Stripe is a payments platform, user security will be high on the list of priorities for developers using Backand to drive a Stripe integration. Below are a few notes on the security concerns associated with a payments platform, and details on how Backand addresses these issues.

#### PCI DSS Compliance

One of the first issues faced by any company taking payment information from customers is the need for compliance with the Payment Card Industry Data Security Standard, or [PCI DSST](https://en.wikipedia.org/wiki/Payment_Card_Industry_Data_Security_Standard). This is a set of standards developed by the payment card industry for all companies handling processing of charges for major brand credit cards. It consists of a number of security standards that your organization must meet, based upon your level of integration. Being compliant with PCI DSS is a vital step in deploying a payments application. [This site](http://pcidsscompliance.net/) has more info on compliance data.

The reason this is mentioned is that through Backand's solution, you get major portions of PCI-DSS for basically free. Stripe's JS is hosted on Stripe's servers, meaning that any payment data sent from the front end (in the payment tokenization call) is already being handled in a secure environment on a secure and certified-compliant machine. As we never physically pull down the Stripe.js file into our project's code, and instead link to the script on Stripe's servers, we can piggyback off of Stripe's compliance and use that in place of our own.

#### Backend Data Concerns

While the tokenization on the front-end of our application handles many of the security concerns for handling customer payment data, it is important to note that our back-end - through Backand's application - needs to be verified as well. While the above PCI-DSS information is useful for making sure the back end is compliant, there are a few important things to note:

* You cannot store complete credit card numbers on back-end servers. It is possible to do so, but attempting to store this data requires a much more robust security infrastructure than this application provides.
* You also cannot store the CVV code (the number on the back of the card) on your back-end servers. Once again, it's possible to do so if you are willing to take substantial ownership of the back-end, but most payment application's won't actually need this data

Additionally, it's important to note that the method we use with Stripe creates a single-use token. You can store the token, but it can only be used for a charge once. Review Stripe's API documentation for more info on how to generate multi-use tokens for your users.

# PayPal

### Backand Action

Use the following steps to add an on-demand action that registers a payment with PayPal:

1. Open the Action tab for the `items` object (which can be found under the "Objects" menu in the Backand dashboard)
2. Click "+New Action" and enter the following details in the fields provided. Note that some fields for a step won't be available until the prior step has been completed:
  1. **Name:** PayPalPayment
  2. **Event Trigger:** 'On Demand - Execute via REST API'
  3. **Type:** Server Side JavaScript Code
  4. **Input Parameters:** amount
  5. **JavaScript Code:** Past this code under the `// write your code here` comment, and before the `return {}` command

    ```javascript
      //Secret key and ClientId - copy from your PayPal account click on the app here https://developer.paypal.com/developer/applications/  
      //or use Backand's test account
      var paypalUrl='https://api.sandbox.paypal.com/';
    	var getAccessToken = function(){
                var token = cookie.get('paypal_token'); 
                if (!token) { 
                    var ClientId = 'AeRyp1axlX-6Lr730vW1mUA3Q5iKz9NOWFkGuZG1ws6vpGZ1a_5O20y3CIp6RYekmr0ilfkWBXpkwsHR'; 
                    var Secret = 'ELKeNR8vXKRT6JxAVHJZVHWxcS2GUrGxxwnJeiddaKKDQ6ZXWhZe7d-1H6toxBaOoO3uhS41i50QlyYy'; 
                    var user =  btoa(ClientId + ":" + Secret); 
                    try{
                        token = $http(
                            {
                                method:'POST',
                                url:paypalUrl+'v1/oauth2/token',
                                data:'grant_type=client_credentials',
                                headers:{
                                    "Accept-Language":"en_US",
                                    "Authorization":"Basic " + user
                                    }
                                
                            });
                    } 
                    catch(err){
                        if (err.name == 401){
                            var e = new Error("Unauthorized (401), check client id and secret"); 
                            e.name = err.name;
                            throw e;
                        }
                        else{
                            throw err;
                        }
                    }
                    cookie.put('paypal_token',token);
                }
                return token;
            };
        var postPayment = function(){
            authorization = "Bearer " + getAccessToken().access_token;
            var payment = {
                "intent":"sale",
                "redirect_urls":{
                    "return_url":"http://localhost:3000/#/paypal",
                    "cancel_url":"http://localhost:3000/#/paypal?fail=true"
                },
                "payer":{"payment_method":"paypal"},
                "transactions":[
                    {"amount":
                        {
                            "total":parameters.amount,
                            "currency":"USD"
                        }
                        
                    }
                ]
                
            };
                return $http({
                    method:'POST',
                    url:paypalUrl+'v1/payments/payment',
                    data:payment,
                    headers:{
                        "Content-Type":"application/json",
                        "Accept-Language":"en_US",
                        "Authorization":authorization
                        
                    }});
            }
        try{
            
            var payment= postPayment();
             cookie.put(payment.id,dbRow.Id);
          return payment.links[1].href;
        }
        catch(err){
            
            if (err.name == 401){
                cookie.remove('paypal_token');
                var payment= postPayment();
                cookie.put(payment.id,dbRow.Id);
                return payment;
            }
            else{
                throw err;
            }
        }
    ```

  6. Press "Save"
  
3. Click "+New Action" and enter the following details in the fields provided. Note that some fields for a step won't be available until the prior step has been completed:
  1. **Name:** PayPalApproval
  2. **Event Trigger:** 'On Demand - Execute via REST API'
  3. **Type:** Server Side JavaScript Code
  4. **Input Parameters:** amount
  5. **JavaScript Code:** Past this code under the `// write your code here` comment, and before the `return {}` command

    ```javascript
      //Secret key and ClientId - copy from your PayPal account click on the app here https://developer.paypal.com/developer/applications/  
      //or use Backand's test account
      // for paying , use can use the account credentials  username:paypalTest1@backand.com password:12345678 
      var paypalUrl='https://api.sandbox.paypal.com/';
     	var getAccessToken = function(){
                 var token = cookie.get('paypal_token'); 
                 if (!token) { 
                     var ClientId = 'AeRyp1axlX-6Lr730vW1mUA3Q5iKz9NOWFkGuZG1ws6vpGZ1a_5O20y3CIp6RYekmr0ilfkWBXpkwsHR'; 
                     var Secret = 'ELKeNR8vXKRT6JxAVHJZVHWxcS2GUrGxxwnJeiddaKKDQ6ZXWhZe7d-1H6toxBaOoO3uhS41i50QlyYy'; 
                     var user =  btoa(ClientId + ":" + Secret); 
                     try{
                         token = $http(
                             {
                                 method:'POST',
                                 url:paypalUrl+'v1/oauth2/token',
                                 data:'grant_type=client_credentials',
                                 headers:{
                                     "Accept-Language":"en_US",
                                     "Authorization":"Basic " + user
                                     }
                                 
                             });
                     } 
                     catch(err){
                         if (err.name == 401){
                             var e = new Error("Unauthorized (401), check client id and secret"); 
                             e.name = err.name;
                             throw e;
                         }
                         else{
                             throw err;
                         }
                     }
                     cookie.put('paypal_token',token);
                 }
                 return token;
             };
             var postApproval = function(){
              authorization = "Bearer " + getAccessToken().access_token;
             var payer = {"payer_id":parameters.payerId};
            
             return $http({
                 method:'POST',
                 url:paypalUrl+ 'v1/payments/payment/' + parameters.paymentId + '/execute/',
                 data:JSON.stringify(payer),
                 headers:{"Content-Type":"application/json","Accept-Language":"en_US","Authorization":authorization}
                 });
             
             }
             try{
                 return postApproval();
             }
             catch(err){
                 if (err.name == 401){
                     cookie.remove('paypal_token');
                     return postApproval();
                 }
                 else{
                     throw err;
                 }
             };
    ```

  6. Press "Save"
  
  
## Run the app
  
Now we're ready to run the app! In your terminal window, simply type:

```bash    
  $ gulp serve
```

At this point, your application is running! You can access it at **[http://localhost:3000](http://localhost:3000)**.

When redirected to PayPal site use this credentials 
username:paypalTest1@backand.com password:12345678 
## Code Review

From this point, we only have a few steps left before we can complete our PayPal integration. Review the following code and copy it into your app in order to get your Backand app talking to PayPal.


#### Calling Back& action to prepare a PayPal payment

The method **self.charge** in file **/client/src/app/paypal/paypal.js** gets the form's data and makes a call to makePayPalPayment function which is a wrapper for the Backand Action -PayPalPayment ,
we created earlier on step 2. This  sets up a payment in PayPal, by getting the PayPal token and calling the PayPal payment API (more on this in a moment).
The first payment object that PayPal return contains the url of the user confirm payment form in PayPal, the on-demand action -PayPalPayment will return this url and the code redirect the user to PayPal confirmations form 

```javascript
  self.charge = function () {
        self.error = "";
        self.success = "";
  
        //get the form's data
        var form = angular.element(document.querySelector('#paypal-form'))[0];
  
        //Call Backand action to prepare the payment
        var paypalUrl = BackandService.makePayPalPayment(form.amount.value)
          .then(function (payment) {
            var paypalResponse = payment;
            //redirect to PayPal - for user approval of the payment
            $window.location.href = paypalResponse.data;
          })
          .catch(function (err) {
            if (err.type) {
              self.error = 'PayPal error: ' + err.message;
            } else {
              self.error = 'Other error occurred, possibly with your API' + err.message;
            }
          });
      }
```
After the user confirm the payment in PayPal , PayPal then redirect to this page again but now it adds the payments details to the query string, these parameters should be sent again to PayPal to conclude the payment( which is done by using makePayPalApproval Backand service and the Backand Action from step 3 )
```javascript
//check if this is a redirect from PayPal , after the user approves the payment
    // PayPal adds PayerID and  paymentId to the return url we give them
    if ($location.search().PayerID && $location.search().paymentId) {

      //Call Backand action to approve the payment by the facilitator
      BackandService.makePayPalApproval($location.search().PayerID, $location.search().paymentId)
        .then(function (payment) {
          // remove PayPal query string from url
          $location.url($location.path());
          self.success = 'successfully submitted payment for $' + payment.data.transactions[0].amount.total;
        }
      )
    }
```
#### Backand Service to Call an On-Demand Action

The method **factory.makePayPalPayment** in the file **/client/src/common/services/backandService.js** calls the on-demand action -PayPalPayment we declared earlier in step 2. You must send the parameter **amount**, though you can send additional parameters as needed.

```javascript
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
    }
```

The method **factory.makePayPalApproval** in the file **/client/src/common/services/backandService.js** calls the on-demand action -PayPalApproval we declared earlier in step 3. You must send the parameters **payerId** and **paymentId** which PayPal implanted in the return url after the user confirms the payment in PayPal site 
```javascript
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
     }
```

### License

See the LICENSE file
