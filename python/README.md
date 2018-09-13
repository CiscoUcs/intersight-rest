# intersight-rest

Cisco has released their new Intersight platform for managing UCS Server and Hyperflex Hyperconverged infrastructure from a SaaS based interface. With high security standards, forming and signing the RESTful API calls to Intersight can be a challenge, so this package was written to do all of that work for you. All you need to provide is your Public/Private keys generated from the Intersight interface, as well at the API endpoint you'd like to target. Optionally you can add in query parameters for GET requests, and a body for POST/PATCH opterations.  

### **Overview:**
```py
intersight_call(**options);
```

| Option | Format | Value |
| ------ | ------ | ------ |
| http_method | &lt;String&gt; | HTTP Verb [ GET \| POST \| PATCH \| DELETE ] |
| resource_path | &lt;String&gt; | Resource Path from https://intersight.com/apidocs |
| query_params | &lt;Dict&gt; | Query Parameters from Resource Path GET |
| body | &lt;Dict&gt; | Body Parameters from Resource Path POST|
| moid | &lt;String&gt; | MOID of Object to be Modified |
| name | &lt;String&gt; | Name of Object to be Modified (See Notes) |
| proxy | &lt;String&gt; | Proxy Server Address [ proto://\<address\>:\<port\> ] |

<sup>1</sup> ***name*** will be ignored if ***moid*** is set.  
<sup>2</sup> ***name*** is case sensitive.  

More information about Intersight is available at: https://intersight.com  
Details on the RESTful API and documentation: https://intersight.com/apidocs  

### **PIP Installation:**

```sh
$ pip install intersight-rest
```

### **Usage:**

```py
# Import "intersight_rest" Package
import intersight_rest as isREST

# Import JSON Package
import json

# Load Public/Private Keys
isREST.set_private_key(open("./keys/private_key.pem", "r") .read())
isREST.set_public_key(open("./keys/public_key.txt", "r") .read())

# Select Resource Path from https://www.intersight.com/apidocs
resource_path = '/ntp/Policies'

# GET EXAMPLE
#-- Set GET Options --#
options = {
    "http_method": "get",
    "resource_path": resource_path,
    "query_params": query_params
}

#-- Send GET Request --#
results = isREST.intersight_call(**options)
print("Status Code: " + str(results.status_code))
print(json.dumps(results.json(), indent=4))

#-- NOTE: intersight_call Returns a "requests.Response" Object --#

# GET "query_params" Examples
#-- Example query_params returning the top 1 result(s) --#
query_params = {
    "$top": 1
}

#-- Example query_params showing filter by "Name" key --#
query_params = {
    "$filter": "Name eq 'Test-NTP'"
}

#-- Example query_params showing filter by "Description" key --#
query_params = {
    "$filter": "Description eq 'pool.ntp.org'"
}

#-- Example query_params showing advanced Tag filder by key & value --#
query_params = {
    "$filter": "Tags/any(t: t/Key eq 'loc' and t/Value eq 'California')"
}

# POST EXAMPLE
#-- Assemble POST Body --#
post_body = {
    "Name": "Test-NTP",
    "Description": "Test NTP Policy",
    "NtpServers": ["8.8.8.8"]
}

#-- Set POST Options --#
options = {
    "http_method": "post",
    "resource_path": resource_path,
    "body": post_body
}

#-- Send POST Request --#
results = isREST.intersight_call(**options)
print("Status Code: " + str(results.status_code))
print(json.dumps(results.json(), indent=4))

#-- NOTE: intersight_call Returns a "requests.Response" Object --#

# PATCH EXAMPLE
#-- Assemble PATCH Body --#
patch_body = {
    "NtpServers": ["10.10.10.10"]
}

#-- Option #1: PATCH by Object MOID --#

#-- Set Object MOID to be Modified --#
patch_moid = "6b1727fa686c873463b8163e"

#-- Set PATCH Options --#
options = {
    "http_method": "patch",
    "resource_path": resource_path,
    "body": patch_body,
    "moid": patch_moid
}

#-- Option #2: PATCH by Object NAME --#

#-- Set Object NAME to be Modified --#
patch_name = "Test-NTP"

#-- Set PATCH Options --#
options = {
    "http_method": "patch",
    "resource_path": resource_path,
    "body": patch_body,
    "name": patch_name
}

#-- Send PATCH Request --#
results = isREST.intersight_call(**options)
print("Status Code: " + str(results.status_code))
print(json.dumps(results.json(), indent=4))

#-- NOTE: intersight_call Returns a "requests.Response" Object --#

# DELETE EXAMPLE
#-- Option #1: DELETE by Object MOID --#

#-- Set Object MOID to be Deleted --#
delete_moid = "6b1727fa686c873463b8163e"

#-- Set DELETE Options --#
options = {
    "http_method": "delete",
    "moid": delete_moid
}

#-- Option #2: DELETE by Object Name --#

#-- Set Object NAME to be Deleted --#
delete_name = "Test-NTP"

#-- Set DELETE Options --#
options = {
    "http_method": "delete",
    "name": delete_name
}

#-- Send DELETE Request --#
results = isREST.intersight_call(**options)
print("Status Code: " + str(results.status_code))

#-- NOTE: intersight_call Returns a "requests.Response" Object --#
```

### See package source for more details...

*Copyright (c) 2018 Cisco and/or its affiliates.
