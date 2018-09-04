# intersight-rest

Cisco has released their new Intersight platform for managing UCS Server and Hyperflex Hyperconverged infrastructure from a SaaS based interface. With high security standards, forming and signing the RESTful API calls to Intersight can be a challenge, so this package was written to do all of that work for you. All you need to provide is your Public/Private keys generated from the Intersight interface, as well at the API endpoint you'd like to target. Optionally you can add in query parameters for GET requests, and a body for POST/PATCH opterations.  

### **Overview:**
```js
intersight_call(**options);
```

| Option | Format | Value |
| ------ | ------ | ------ |
| resource_path | &lt;String&gt; | Resource Path from https://intersight.com/apidocs |
| query_params | &lt;Dict&gt; | Query Parameters from Resource Path GET |
| body | &lt;Dict&gt; | Body Parameters from Resource Path POST|
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
$ pip install intersight-rest
```

### **Usage:**

```py
# Import "intersight_rest" Package
import intersight_rest as isREST

# Import JSON PAckage
import json

# Load Public/Private Keys
isREST.set_private_key(open("./keys/private_key.pem", "r") .read())
isREST.set_public_key(open("./keys/public_key.txt", "r") .read())

# Select Resource Path from https://www.intersight.com/apidocs
resourcePath = '/ntp/Policies'

# GET EXAMPLE
#-- Set GET Options --#
options = {
    resource_path: resourcePath,
    query_params: queryParams
}

results = isREST.intersight_call(**options)
print(json.dumps(results, indent=4))

#-- NOTE: intersightREST Returns a JS Promise --#

# GET "queryParams" Examples
#-- Example queryParams returning the top 1 result(s) --#
queryParams = {
    "$top": 1
}

#-- Example queryParams showing filter by "Name" key --#
queryParams = {
    "$filter": "Name eq 'Test-NTP'"
}

#-- Example queryParams showing filter by "Description" key --#
queryParams = {
    "$filter": "Description eq 'pool.ntp.org'"
}

#-- Example queryParams showing advanced Tag filder by key & value --#
queryParams = {
    "$filter": "Tags/any(t: t/Key eq 'loc' and t/Value eq 'California')"
}

# POST EXAMPLE
#-- Assemble POST Body --#
postBody = {
    Name: "Test-NTP",
    Description: "Test NTP Policy",
    NtpServers: ["8.8.8.8"]
}

#-- Set POST Options --#
options = {
    resource_path: resourcePath,
    body: postBody
}

results = isREST.intersight_call(**options)
print(json.dumps(results, indent=4))

#-- NOTE: intersightREST Returns a JS Promise --#

# PATCH EXAMPLE
#-- Set Object MOID to be Modified --#
patchMoid = "6b1727fa686c873463b8163e"

#-- Assemble PATCH Body --#
patchBody = {
    NtpServers: ["10.10.10.10"]
}

#-- Set PATCH Options --#
options = {
    resource_path: resourcePath,
    body: patchBody,
    moid: patchMoid
}

results = isREST.intersight_call(**options)
print(json.dumps(results, indent=4))

#-- NOTE: intersightREST Returns a JS Promise --#
```

### See package source for more details...

*Copyright (c) 2018 Cisco and/or its affiliates.
