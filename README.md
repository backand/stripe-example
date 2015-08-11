# [backand-stripe-example](https://github.com/backand/stripe-example/)

### Quick-and-Easy Third Party Integration With Stripe

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

### License

See the LICENSE file
