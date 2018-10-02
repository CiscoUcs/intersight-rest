/**
 * Intersight REST API Module
 * @module intersight-rest
 * Author: Matthew Garrett
 * Contributors: David Soper, Chris Gascoigne, John McDonough
 * Email: mgarrett0402@gmail.com
 * 
 * Copyright (c) 2018 Cisco and/or its affiliates.
 * This software is licensed to you under the terms of the Cisco Sample
 * Code License, Version 1.0 (the "License"). You may obtain a copy of the
 * License at:
 * 
 *              https://developer.cisco.com/docs/licenses
 * 
 * All use of the material herein must be in accordance with the terms of
 * the License. All rights not expressly granted by the License are
 * reserved. Unless required by applicable law or agreed to separately in
 * writing, software distributed under the License is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied.
 */

const request = require('request-promise');
const crypto = require('crypto');
const url = require('url');
const qs = require('qs');

const host = url.parse('https://intersight.com/api/v1');
const digestAlgorithm = 'rsa-sha256';

var privateKey = null;
var publicKey = null;

/**
 * Set RSA public key.
 * @function set_publicKey
 * @public
 * @param  {String} pubKey  RSA public key.
 */
const setPublicKey = function set_publicKey(pubKey) {
    publicKey = pubKey;
}

/**
 * Set RSA private key.
 * @function set_privateKey
 * @public
 * @param  {String} prvKey  RSA private key.
 */
const setPrivateKey = function set_privateKey(prvKey) {
    privateKey = prvKey;
}

/**
 * Generates a SHA256 digest from a JSON Object.
 * @function getSHA256Digest
 * @private
 * @param  {Object} data    JSON object.
 * @return {string}         Base64 formatted string.
 */
function getSHA256Digest(data) {
    // return digest = crypto.createHash('sha256').update(JSON.stringify(data), 'utf8').digest();
    return digest = crypto.createHash('sha256').update(data, 'utf8').digest();
}

/**
 * Generates an RSA Signed SHA256 digest from a String.
 * @function getRSASigSHA256b64Encode
 * @private
 * @param  {String} data    String to be signed & hashed.
 * @return {string}         Base64 formatted string.
 */
function getRSASigSHA256b64Encode(data) {
    var keyData = {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
    };

    return sign = crypto.createSign('RSA-SHA256').update(data).sign(keyData, 'base64');
}

/**
 * Assmebled an Intersight formatted authorization header.
 * @function getAuthHeader
 * @private
 * @param  {Object} hdrs        Object with header keys.
 * @param  {String} signedMsg   Base64 encoded SHA256 hashed body.
 * @return {string}             Concatenated authorization header.
 */
function getAuthHeader(hdrs, signedMsg) {
    var keys = [];

    var authStr = "Signature";

    authStr = authStr + " " + "keyId=\"" + publicKey + "\"," + "algorithm=\"" + digestAlgorithm + "\"," + "headers=\"(request-target)";

    for (var objKey in hdrs) {
        keys.push(objKey);
    }
    keys.sort();

    for (var i = 0; i < keys.length; i++) {
        authStr = authStr + " " + keys[i].toLowerCase();
    }
    authStr = authStr + "\"";

    authStr = authStr + "," + "signature=\"" + signedMsg + "\"";

    return authStr;
}

/**
 * Concatenates Intersight headers in preparation to be RSA signed.
 * @function prepStringToSign
 * @private
 * @param  {String} reqTarget   HTTP Method + endpoint.
 * @param  {Object} hdrs        Object with header keys.
 * @return {string}             Concatenated header authorization string.
 */
function prepStringToSign(reqTarget, hdrs) {
    var keys = [];

    var ss = "(request-target): " + reqTarget.toLowerCase() + "\n";

    for (var objKey in hdrs) {
        keys.push(objKey);
    }
    keys.sort();

    for (var i = 0; i < keys.length; i++) {
        ss = ss + keys[i].toLowerCase() + ": " + hdrs[keys[i]];
        if(i < keys.length-1) {
            ss = ss + "\n";
        }
    }

    return ss;
}

/**
 * Generated a GMT formatted Date.
 * @function getGMTDate
 * @private
 * @return {String} GMT formatted Date string.
 */
function getGMTDate() {
    return new Date().toGMTString();
}

/**
 * Retrieve an Intersight object moid by name.
 * @function getMoidByName
 * @private
 * @param  {String} resourcePath    Intersight resource path e.g. '/ntp/Policies'.
 * @param  {String} targetName      Name of target Intersight Object.
 * @return {Object}                 MOID for target Intersight Object.
 */
async function getMoidByName(resourcePath, targetName) {
    var locatedMoid = "";

    var queryParams = {
        "$filter": `Name eq '${targetName}'`
    };

    var options = {
        "httpMethod": "GET",
        "resourcePath": resourcePath,
        "queryParams": queryParams
    };

    var response = await intersightREST(options);

    if(JSON.parse(response.body).Results != null) {
        locatedMoid = JSON.parse(response.body).Results[0].Moid;
    } else {
        return Promise.reject(`Object with name "${targetName}" not found!`);
    }

    return locatedMoid;
}

/**
 * Invoke the Intersight API.
 * @function intersight_call
 * @public
 * @param  {String} resourcePath    Intersight resource path e.g. '/ntp/Policies'.
 * @param  {Object} queryParams     Javascript object with query string parameters as key/value pairs.
 * @param  {Object} body            Javascript object with Intersight data.
 * @param  {String} moid            Intersight object MOID.
 * @return {Promise}                Javascript Promise for HTTP response body.
 */
const intersightREST = async function intersight_call({httpMethod="", resourcePath="", queryParams={}, body={}, moid=null, name=null, proxy=null} = {}) {
    var targetHost = host.hostname;
    var targetPath = host.pathname;
    var queryPath = "";
    var method = httpMethod.toUpperCase();
    var bodyString = "";

    // Verify an accepted HTTP verb was chosen
    if(!['GET','POST','PATCH','DELETE'].includes(method)) {
        return Promise.reject('Please select a valid HTTP verb (GET/POST/PATCH/DELETE)');
    }

    // Verify the resource path isn't empy & is a valid String Object
    if(resourcePath != "" && resourcePath.constructor != String) {
        return Promise.reject('The *resourcePath* value is required and must be of type "String"');
    }

    // Verify the query parameters isn't empy & is a valid Javascript Object
    if(Object.keys(queryParams).length != 0 && queryParams.constructor != Object) {
        return Promise.reject('The *queryParams* value must be of type "Object"');
    }

    // Verify the body isn't empy & is a valid Javascript Object
    if(Object.keys(body).length != 0 && body.constructor != Object) {
        return Promise.reject('The *body* value must be of type "Object"');
    }

    // Verify that proxy is either null, or is a valid String Object
    if(proxy != null && proxy.constructor != String) {
        return Promise.reject('The *proxy* value must be of type "String"');
    }

    // Verify the MOID is not null & of proper length
    if(moid != null && Buffer.byteLength(moid, 'utf-8') != 24) {
        return Promise.reject('Invalid *moid* value!');
    }

    // Verify the public key is set
    if(publicKey == null) {
        return Promise.reject('Public Key not set!');
    }

    // Verify the private key is set
    if(privateKey == null) {
        return Promise.reject('Private Key not set!');
    }

    // Set additional parameters based on HTTP Verb
    if(Object.keys(queryParams).length != 0) {
        queryPath = "?" + qs.stringify(queryParams);
    }

    // Handle PATCH/DELETE by Object "name" instead of "moid"
    if(method == "PATCH" || method == "DELETE") {
        if(moid == null) {
            if(name != null) {
                if(name.constructor == String) {
                    moid = await getMoidByName(resourcePath, name);
                }
                else {
                    return Promise.reject('The *moid_from_name* value must be of type "String"');
                }
            }
            else {
                return Promise.reject('Must set either *moid* or *moid_from_name* with "PATCH/DELETE!"');
            }
        }
    }

    // Check for moid and concatenate onto URL
    if (method != "POST" && moid != null) {
        resourcePath += "/" + moid;
    }

    // Check for GET request to properly form body
    if (method != "GET") {
        bodyString = JSON.stringify(body);
    }

    // Concatenate URLs for headers
    var targetUrl = host.href + resourcePath;
    var requestTarget = method + " " + targetPath + resourcePath + queryPath;

    // Get the current GMT Date/Time
    var currDate = getGMTDate();

    // Generate the body digest
    var b64BodyDigest = getSHA256Digest(bodyString);

    // Generate the authorization header
    var authHeader = {
        'Date' : currDate,
        'Host' : targetHost,
        'Digest' : 'SHA-256=' + b64BodyDigest.toString('base64')
    };

    var stringToSign = prepStringToSign(requestTarget, authHeader);
    var b64SignedMsg = getRSASigSHA256b64Encode(stringToSign);
    var headerAuth = getAuthHeader(authHeader, b64SignedMsg);

    // Generate the HTTP requests header
    var request_header = {
        'Accept':           `application/json`,
        'Host':             `${targetHost}`,
        'Date':             `${currDate}`,
        'Digest':           `SHA-256=${b64BodyDigest.toString('base64')}`,
        'Authorization':    `${headerAuth}`,
    };

    // Generate the HTTP request options
    var requestOptions = {
        method: method,
        url: targetUrl,
        qs: queryParams,
        body: bodyString,
        headers: request_header,
        resolveWithFullResponse: true,
        proxy: proxy
    };
    
    // Make HTTP request & return a Javascript Promise
    return request(requestOptions);
}

// Export the module functions
module.exports = {
    intersightREST,
    setPublicKey,
    setPrivateKey,
};
