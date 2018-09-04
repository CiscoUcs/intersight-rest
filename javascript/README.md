# intersight-rest

Cisco has released their new Intersight platform for managing UCS Server and Hyperflex Hyperconverged infrastructure from a SaaS based interface. With high security standards, forming and signing the RESTful API calls to Intersight can be a challenge, so this package was written to do all of that work for you. All you need to provide is your Public/Private keys generated from the Intersight interface, as well at the API endpoint you'd like to target. Optionally you can add in query parameters for GET requests, and a body for POST/PATCH opterations.  

### **Overview:**
```js
intersightREST(<options>);
```

| Option | Format | Value |
| ------ | ------ | ------ |
| resource_path | &lt;String&gt; | Resource Path from https://intersight.com/apidocs |
| query_params | &lt;Object&gt; | Query Parameters from Resource Path GET |
| body | &lt;Object&gt; | Body Parameters from Resource Path POST|
| moid | &lt;String&gt; | MOID of Object to be Modified |

&nbsp;  

The HTTP verbs will be assumed as follows:
 - GET: &lt;resource_path&gt;
 - GET: &lt;resource_path&gt; + &lt;query_params&gt;
 - POST: &lt;resource_path&gt; + &lt;body&gt;
 - PATCH: &lt;resource_path&gt; + &lt;body&gt; + &lt;moid&gt;

More information about Intersight is available at: https://intersight.com  
Details on the RESTful API and documentation: https://intersight.com/apidocs  

### **NPM Installation:**

```sh
$ npm install --save intersight-rest
```

### **Usage:**

```js
// Import "intersight-rest" Package
const isREST = require('intersight-rest');

// Load Public/Private Keys
const fs = require('fs');
isREST.setPublicKey(fs.readFileSync('./keys/public_key.txt', 'utf8'));
isREST.setPrivateKey(fs.readFileSync('./keys/private_key.pem', 'utf8'));

// Select Resource Path from https://www.intersight.com/apidocs
const resourcePath = '/ntp/Policies';

// GET EXAMPLE
/* Set GET Options */
options = {
    resource_path: resourcePath,
    query_params: queryParams
};

isREST.intersightREST(options).then(body => {
    console.log(body);
}).catch(err => {
    console.log('Error: ', err);
});

/* NOTE: intersightREST Returns a JS Promise */

// GET "queryParams" Examples
/* Example queryParams returning the top 1 result(s) */
queryParams = {
    "$top": 1
};

/* Example queryParams showing filter by "Name" key */
queryParams = {
    "$filter": "Name eq 'Test-NTP'"
};

/* Example queryParams showing filter by "Description" key */
queryParams = {
    "$filter": "Description eq 'pool.ntp.org'"
};

/* Example queryParams showing advanced Tag filder by key & value */
queryParams = {
    "$filter": "Tags/any(t: t/Key eq 'loc' and t/Value eq 'California')"
};

// POST EXAMPLE
/* Assemble POST Body */
postBody = {
    Name: "Test-NTP",
    Description: "Test NTP Policy",
    NtpServers: ["8.8.8.8"]
};

/* Set POST Options */
options = {
    resource_path: resourcePath,
    body: postBody
};

isREST.intersightREST(options).then(body => {
    console.log(body);
}).catch(err => {
    console.log('Error: ', err);
});

/* NOTE: intersightREST Returns a JS Promise */

// PATCH EXAMPLE
/* Set Object MOID to be Modified */
patchMoid = '6b1727fa686c873463b8163e';

/* Assemble PATCH Body */
patchBody = {
    NtpServers: ["10.10.10.10"]
};

/* Set PATCH Options */
options = {
    resource_path: resourcePath,
    body: patchBody,
    moid: patchMoid
};

isREST.intersightREST(options).then(body => {
    console.log(body);
}).catch(err => {
    console.log('Error: ', err);

/* NOTE: intersightREST Returns a JS Promise */
```

### See package source for more details...

*Copyright (c) 2018 Cisco and/or its affiliates.
