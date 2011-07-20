var sps = (function(use) {
   
   var _toString = Object.prototype.toString;
   var _slice = Array.prototype.slice;
   
   use.extend = function(destination, source) {
      for (var property in source)
         destination[property] = source[property];
      return destination;
   }

   use.clone = function(object) {
      return extend({}, object);
   }

   use.getFirstProperty = function(obj) {
      for (var property in obj)
         return obj[property];
   }

   use.objectToParams = function(map){
      var pairs = [];
      var backstop = {};
      for(var name in map){
         var value = map[name];
         if(value != backstop[name]){
            var assign = encodeURIComponent(name) + "=";
            if(use.isArray(value)){
               for(var i=0; i < value.length; i++){
                  pairs.push(assign + encodeURIComponent(value[i]));
               }
            }else{
               pairs.push(assign + encodeURIComponent(value));
            }
         }
      }
      return pairs.join("&"); // String
   }
   
   use.isString = function(it) {
      return (typeof it == "string" || it instanceof String);
   }
   
   use.isBoolean = function(it) {
      return typeof it === 'boolean';
   }

   use.isNumber = function(it) {
      return _toString.call(it) === "[object Number]";
   }   
   
   use.isElement = function(it) {
      return (it && it.nodeType == 1);
   }

   use.isPlainObject = function(it) {
      if ( !it || toString.call(it) !== "[object Object]" || it.nodeType || it.setInterval ) {
         return false;
      }
      var key;
      for ( key in it ) {}
		
      return key === undefined || hasOwnProperty.call( it, key );
   }

   use.isObject = function(it) {
      return it !== undefined && (it === null || typeof it == "object" || use.isArray(it) || use.isFunction(it));
   }

   use.isEmptyObject = function( obj ) {
      for ( var name in obj ) {
         return false;
      }
      return true;
   }

   if (!Array.isArray) {
      Array.prototype.isArray = function(it) {
         return it && (it instanceof Array || typeof it == "array");
      }
   }
   
   use.isArray = function(it) {
      return it && (it instanceof Array || typeof it == "array");
   };
   
   use.isFunction = function(it){
      return _toString.call(it) === "[object Function]";
   };

   use.isUndefined = function(it) {
      return typeof it === "undefined";
   };

   function update(array, args) {
      var arrayLength = array.length, length = args.length;
      while (length--) array[arrayLength + length] = args[length];
      return array;
   }

   function merge(array, args) {
      array = _slice.call(array, 0);
      return update(array, args);
   }

   use.bind = function(context) {
      if (arguments.length < 2 && use.isUndefined(arguments[0])) return this;
      var __method = this, args = _slice.call(arguments, 1);
      return function() {
         var a = merge(args, arguments);
         return __method.apply(context, a);
      }
   }

   if (!Function.bind) {
      Function.prototype.bind = function(scope) {
         var _function = this;
         return function() {
            return _function.apply(scope, arguments);
         }
      }
   }

   use.proxy = function( fn, proxy, thisObject ) {
      if ( arguments.length === 2 ) {
         if ( typeof proxy === "string" ) {
            thisObject = fn;
            fn = thisObject[ proxy ];
            proxy = undefined;

         }
         else if ( proxy && !sps.isFunction( proxy ) ) {
            thisObject = proxy;
            proxy = undefined;
         }
      }

      if ( !proxy && fn ) {
         proxy = function() {
            return fn.apply( thisObject || this, arguments );
         };
      }

      // Set the guid of unique handler to the same of original handler, so it can be removed
      //      if ( fn ) {
      //         proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
      //      }

      // So proxy can be declared as an argument
      return proxy;
   }

//   function $(selector, element) {
//      element = element || document;
//      return element.querySelector(selector);
//   }
//
//   function $$(selector, element) {
//      element = element || document;
//      return element.querySelectorAll(selector);
//   }

   return use;
}(sps || {}));