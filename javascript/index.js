/**
 * Intersight REST API Module
 * @module intersight-rest
 * Author: Matthew Garrett
 * Contributors: David Soper, Chris Gascoigne
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
const digest_algorithm = 'rsa-sha256';

var private_key = null;
var public_key = null;

/**
 * Set RSA public key.
 * @function set_public_key
 * @public
 * @param  {String} data  RSA public key.
 */
const setPublicKey = function set_public_key(pub_key) {
    public_key = pub_key;
}

/**
 * Set RSA private key.
 * @function set_private_key
 * @public
 * @param  {String} data  RSA private key.
 */
const setPrivateKey = function set_private_key(prv_key) {
    private_key = prv_key;
}

/**
 * Generates a SHA256 digest from a JSON Object.
 * @function get_sha256_digest
 * @private
 * @param  {Object} data  JSON object.
 * @return {string}       Base64 formatted string.
 */
function get_sha256_digest(data) {
    return digest = crypto.createHash('sha256').update(JSON.stringify(data), 'utf8').digest();
}

/**
 * Generates an RSA Signed SHA256 digest from a String.
 * @function get_rsasig_sha256_b64encode
 * @private
 * @param  {String} data         String to be signed & hashed.
 * @return {string}              Base64 formatted string.
 */
function get_rsasig_sha256_b64encode(data) {
    var key_data = {
        key: private_key,
        padding: crypto.constants.RSA_PKCS1_PADDING
    };

    return sign = crypto.createSign('RSA-SHA256').update(data).sign(key_data, 'base64');
}

/**
 * Assmebled an Intersight formatted authorization header.
 * @function get_auth_header
 * @private
 * @param  {Object} hdrs        Object with header keys.
 * @param  {String} signed_msg  Base64 encoded SHA256 hashed body.
 * @return {string}             Concatenated authorization header.
 */
function get_auth_header(hdrs, signed_msg) {
    var auth_str = "Signature";

    auth_str = auth_str + " " + "keyId=\"" + public_key + "\"," + "algorithm=\"" + digest_algorithm + "\"," + "headers=\"(request-target)";

    for (var key in hdrs) {
        auth_str = auth_str + " " + key.toLowerCase();
    }
    auth_str = auth_str + "\"";

    auth_str = auth_str + "," + "signature=\"" + signed_msg + "\"";

    return auth_str;
}

/**
 * Concatenates Intersight headers in preparation to be RSA signed.
 * @function prepare_str_to_sign
 * @private
 * @param  {String} req_tgt  HTTP Method + endpoint.
 * @param  {Object} hdrs     Object with header keys.
 * @return {string}          Concatenated header authorization string.
 */
function prepare_str_to_sign(req_tgt, hdrs) {
    var ss = "(request-target): " + req_tgt.toLowerCase() + "\n";

    var length = Object.keys(hdrs).length;

    var count = 0;
    for (var key in hdrs) {
        ss = ss + key.toLowerCase() + ": " + hdrs[key];
        if(count < length-1) {
            ss = ss + "\n";
        }
        count++;
    }

    return ss;
}

/**
 * Generated a GMT formatted Date.
 * @function get_gmt_date
 * @private
 * @return {String} GMT formatted Date string.
 */
function get_gmt_date() {
    return new Date().toGMTString();
}

/**
 * Callback for sending HTTP requests.
 * @function make_request
 * @private
 * @param  {Object} request_data  Requests formatted object.
 * @return {Object}               Javascript Object from JSON response.
 */
function make_request(request_data) {
    return request(request_data).then(body => {
        return JSON.parse(body);
    });
}

/**
 * Invoke the Intersight API.
 * @function intersight_call
 * @public
 * @param  {String} resource_path  Intersight resource path e.g. '/ntp/Policies'.
 * @param  {Object} query_params   Javascript object with query string parameters as key/value pairs.
 * @param  {Object} body           Javascript object with Intersight data.
 * @param  {String} moid           Intersight object MOID.
 * @return {Promise}               Javascript Promise for HTTP response body.
 */
const intersightREST = function intersight_call({resource_path="", query_params={}, body={}, moid=null} = {}) {
    var target_host = host.hostname;
    var target_path = host.pathname;
    var query_path = "";
    var method;

    // Verify the resource path isn't empy & is a valid String
    if(resource_path != "" && resource_path.constructor != String) {
        return Promise.reject('The *resource_path* value is required and must be of type "String"');
    }

    // Verify the query parameters isn't empy & is a valid Javascript Object
    if(Object.keys(query_params).length != 0 && query_params.constructor != Object) {
        return Promise.reject('The *query_params* value must be of type "Object"');
    }

    // Verify the body isn't empy & is a valid Javascript Object
    if(Object.keys(body).length != 0 && body.constructor != Object) {
        return Promise.reject('The *body* value must be of type "Object"');
    }

    // Verify the MOID is not null & of proper length
    if(moid != null && Buffer.byteLength(moid, 'utf-8') != 24) {
        return Promise.reject('Invalid *moid* value!');
    }

    // Verify the public key is set
    if(public_key == null) {
        return Promise.reject('Public Key not set!');
    }

    // Verify the private key is set
    if(private_key == null) {
        return Promise.reject('Private Key not set!');
    }

    // Determine HTTP Method for requests call
    if(Object.keys(body).length > 0){
        if(moid != null) {
            method = 'PATCH';
            resource_path += "/" + moid;
        }
        else {
            method = 'POST';
        }
    }
    else {
        method = 'GET';

        if(Object.keys(query_params).length != 0) {
            query_path = "?" + qs.stringify(query_params);
        }
    }

    // Concatenate URLs for headers
    var target_url = host.href + resource_path;
    var request_target = method + " " + target_path + resource_path + query_path;

    // Get the current GMT Date/Time
    var cdate = get_gmt_date();

    // Generate the body digest
    var b64_body_digest = get_sha256_digest(body);

    // Generate the authorization header
    var auth_header = {
        'Date' : cdate,
        'Host' : target_host,
        'Digest' : 'SHA-256=' + b64_body_digest.toString('base64')
    };

    var string_to_sign = prepare_str_to_sign(request_target, auth_header);
    var b64_signed_msg = get_rsasig_sha256_b64encode(string_to_sign);
    var header_auth = get_auth_header(auth_header, b64_signed_msg);

    // Generate the HTTP requests header
    var request_header = {
        'Accept':           `application/json`,
        'Host':             `${target_host}`,
        'Date':             `${cdate}`,
        'Digest':           `SHA-256=${b64_body_digest.toString('base64')}`,
        'Authorization':    `${header_auth}`,
    };

    // Generate the HTTP request options
    var request_options = {
        method: method,
        url: target_url,
        qs: query_params,
        body: JSON.stringify(body),
        headers: request_header
    };

    // Make HTTP request & return a Javascript Promise
    return make_request(request_options);
}

// Export the module functions
module.exports = {
    intersightREST,
    setPublicKey,
    setPrivateKey
};
