# [backand-stripe-example](https://github.com/backand/stripe-example/)

### What and Why

Example app demonstrating the work with Stripe and Backand. Whether you’re building a marketplace, mobile app, online storefront, or subscription service, Stripe has the features you need.

With payment system you always need a backend to keep your customer secured.

In this example we use: **angular-stripe** to wrap the stripe.js file, feel free to replace it with any other solution.

## Prerequisites

Install **node.js**. Then **gulp** and **bower** if you haven't yet.

    $ npm -g install gulp bower
    
## Getting started

First, we'll create an account with Backand and create our base app:

* Navigate to [backand.com](https://www.backand.com/) and click `Sign Up`
* Create an app (named whatever you want)
* Click on your new app's URL. Don't navigate away from the next page.

Once an account has been created, we're ready to start building out the backend. In the "New Hosted Database" keep the default JSON and just click 'Next'.

After that, clone the source code: 

```bash
    $ git clone https://github.com/backand/stripe-example.git
    $ cd stripe-example
```
    
Install bower and npm dependencies, and run the application in development mode.

```bash
    $ npm install
    $ bower install
```

Before running the app, we need to change a few items in the app's code. Open the file **client/src/app/app.js** in a text editor, and make the following changes:

  * Replace **'Your-App-Name'** with the new app name you chose when creating your Backand account
  * Replace **'Your-Anonymous-Token'** with your application's Anonymous token:
    1. In Backand dashboard, under "Security & auth --> Configuration," enable Anonymous Access by clicking on the toggle on the right side of the page.
    2. Set the Anonymous users assigned role to 'User' in the provided drop down box.
    3. Copy the Anonymous Token from the text box in the Anonymous access section.
    4. Replace **Your-Anonymous-Token** with the value copied from the Backand dashboard.
  

## Configuring the App

1. Log in to [Backand](https://www.backand.com) using your admin login information
2. Open the application that you created in the previous section.

### Backand Action

Use the following steps to add the on-demand action that makes the payment to Stripe:

1. Open the Action tab for the items object (which can be found under the "Objects" menu in the Backand dashboard)
2. Click "+New Action" and enter the following details in the fields provided. Note that some fields won't be available until the prior step has been completed:
  1. Name: makePayment
  2. Event Trigger: 'On Demand - Execute via REST API'
  3. Type: Server Side JavaScript Code
  4. Input Parameters: amount, token
  5. JavaScript Code: Past this code under the `// write your code here` comment, and before the `return {}` command

    ```javascript
        
        //Secret key - copy from your Stripe account https://dashboard.stripe.com/account/apikeys
        //or user Backand test account
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

  5. Save
  
## Run the app
  
Now we're ready to run the app! In your terminal window, simply type:

```bash    
    $ gulp serve
```

You are now ready to view the app, your application is available at **[http://localhost:3000](http://localhost:3000)**.

  
## Code Review
Review the following code and copy it to your app in order for Stripe to work with Backand

#### Update publish key

In **client/src/app/app.js** file update your publish Stripe key. You can copy it from this URL: https://dashboard.stripe.com/account/apikeys or you can use Backand test account.
The resulting code will look like the following:

```javascript
    .config(function (stripeProvider) {
      //Enter your Stripe publish key or use Backand test account
      stripeProvider.setPublishableKey('pk_test_pRcGwomWSz2kP8GI0SxLH6ay');
    })
      
```

#### Calling stripe.js file to submit payment
The method **self.charge** in file **/client/src/app/home/home.js** gets the form's data and make a call to stripe, gets the token and calls Backand Action.

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

#### Backand service to call to on-demand action
The method **factory.makePayment** in file **/client/src/common/services/backandService.js** calls the on-demand action.
You must send the **token** and **amount**, and you can also send more parameters as needed.

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

### License

See LICENSE file
