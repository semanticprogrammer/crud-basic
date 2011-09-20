resource = function(self) {
   self.version = '0.0.1';
   var vpoint = '#view';
   self.view = function(url, context, selector) {
      if (arguments.length == 1) {
         $.get(url, function(data) {
            $(vpoint).html(data);
         });
      } else {
         var gdata = {};
         gdata.context = context;
         if (selector) {
            gdata.selector = selector;
         }         
         if (typeof gdata.selector === "object") {
            gdata.selector = JSON.stringify(gdata.selector);
         }
         $.get(url, gdata, function(data) {
            $(vpoint).html(data);
         });         
      }
   }
   self.createForm = function(url, context) {
      var gdata = {};
      if (context) {
         gdata.context = context;
      }
      $.get(url, gdata, function(data) {
         $(vpoint).empty();
         sps.Controls.createForm(data.form, $(vpoint)[0]);
         $('button').click(function(){
            resource.create(data)
         });
      }, 'json')
   }   
   self.updateForm = function(url, context, selector) {
      var gdata = {};
      gdata.selector = selector || context;
      if (arguments.length == 3) {
         gdata.context = context;
      }
      if (typeof gdata.selector === "object") {
         gdata.selector = JSON.stringify(gdata.selector);
      }
      $.get(url, gdata, function(data) {
         $(vpoint).empty();
         sps.Controls.createForm(data.form, $(vpoint)[0]);
         $('button').click(function() {
            resource.update(data.url, context, selector)
         });
      }, 'json')
   }   
   self.create = function(data) {
      data.content = sps.Controls.toObject($(vpoint)[0]);
      $.post(data.url, JSON.stringify(data), function(data) {
         alert(data.message);
         self.view(data.url);
      }, 'json');
   }
   self.update = function(url, context, selector) {
      var data = {};
      data.context = context;
      data.selector = selector;
      data.content = sps.Controls.toObject($(vpoint)[0]);
      $.ajax({
         type: 'PUT',
         url: url,
         data: JSON.stringify(data),
         dataType: 'json',
         success: function(data) {
            alert(data.message);
            self.view(data.url);
         }
      });
   }
   self['delete'] = function(url, context, selector) {
      selector = selector || context;
      var data = {
         selector: selector
      };
      if (arguments.length == 3) {
         data.context = context
      }
      if(window.confirm('Are you sure to delete ' + JSON.stringify(selector) + '?')) {
         $.ajax({
            type: 'DELETE',
            url: url,
            data: JSON.stringify(data),
            dataType: 'json',
            success: function(data) {
               alert(data.message);
               self.view(data.url);
            }
         });
      }
   }
   return self;
}({});