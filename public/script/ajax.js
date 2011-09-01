var sps = (function(use) {
   use.AJAX = (function() {
      var self = {};
      var options = {
         url: location.href,
         onStart: null,
         onStop: null,
         onSend: null,
         onSuccess: function(response) {
         },
         onError: function(response) {
         },
         onComplete: function(success, response) {
         },
         params: null,
         handleAs: "text",
         contentType: 'application/x-www-form-urlencoded',
         headers: {
            "X-Requested-With": "XMLHttpRequest"
         },
         encoding: 'UTF-8',
         asynchronous: true
      };

      self.get = function(args) {
         self.sendRequest("GET", args);
      };

      self.post = function(args) {
         self.sendRequest("POST", args);
      };

      self.put = function(args) {
         self.sendRequest("PUT", args);
      };

      self['delete'] = function(args) {
         self.sendRequest("DELETE", args);
      };
      self.sendRequest = function(method, args) {
         options = use.extend(options, args);
         if (method == 'GET') {
            if (options.content) {
               options.params = use.objectToParams(options.content);
               if(options.params.length){
                  options.url += (options.url.indexOf("?") == -1 ? "?" : "&") + options.params;
                  options.content = null;
               }
            }
         }

         xhr = new XMLHttpRequest();
         xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
               if (self.success(xhr)) {
                  options.onSuccess(self.contentHandlers[options.handleAs](xhr));
               }
               else {
                  options.onError();
               }
               options.onComplete(self.success(xhr), self.contentHandlers[options.handleAs](xhr));
            }
         }
         xhr.open(method, options.url, options.asynchronous);
         xhr.setRequestHeader('Content-Type', options.contentType);
         if (options.headers) {
            for (var hdr in options.headers){
               if (options.headers[hdr]) {
                  xhr.setRequestHeader(hdr, options.headers[hdr]);
               }
            }
         }
         try {
            //            xhr.send("txtname=" + options.content);
            xhr.send(JSON.stringify(options.content));
         } catch (e) {
            options.onError();
         }
      };

      self.success = function(xhr) {
         try {
            return !xhr.status && location.protocol === "file:" ||
            (xhr.status >= 200 && xhr.status < 300 ) ||
            xhr.status === 304 || xhr.status === 0;
         } catch(e) {}         
         return false;
      };

      self.contentHandlers = {
         text: function(xhr) {
            return xhr.responseText;
         },
         json: function(xhr){
            return JSON.parse(xhr.responseText || null);
         },
         javascript: function(xhr){
            eval.call(window, xhr.responseText);
         },
         xml: function(xhr){
            return xhr.responseXML;
         }
      };

      return self;
   }());

   return use;
}(sps || {}));