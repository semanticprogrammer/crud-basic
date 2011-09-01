var sps = (function(use) {
   use.Controls = (function() {
      var self = {};
      
      //https://developer.mozilla.org/en/new_in_javascript_1.7 Looping across objects
      //http://www.dojotoolkit.com/reference-guide/dojo/create.html#dojo-create
      //http://api.prototypejs.org/dom/form/element/getvalue/
      //http://api.prototypejs.org/dom/dollarf/

      self.removeElement = function(id, parent) {
         parent = parent || document;
         var element = parent.getElementById(id);
         element.parentNode.removeChild(element);
      }

      self.getValue = function(node) {
         var result = null;
         if (node && !node.disabled) {
            var type = (node.type||"").toLowerCase();
            if (type) {
               if (type == "radio" || type == "checkbox") {
                  if (node.value == "true" || node.value == "false") {
                     result = node.checked;
                  }
                  else {
                     if (node.checked) {
                        result = node.value;
                     }
                  }
               } else if (node.multiple) {
                  result = [];
                  node.querySelectorAll("option").forEach(function(element, index, array) {
                     if (element.selected) {
                        result.push(element);
                     }
                  });
               } else {
                  result = node.value;
               }
            }
         }
         return result;
      }

      self.getValueById = function(id) {
         var element = document.getElementById(id);
         if (element) {
            return use.getValue(element);
         }
         else {
            return null;
         }
      }

      self.$V = function(selector) {
         var element = document.querySelector(selector);
         if (element) {
            return use.getValue(element);
         }
         else {
            return null;
         }
      }

      function setValue(obj, name, value){
         if(value === null){
            return;
         }
         var val = obj[name];
         if (typeof val == "string") {
            obj[name] = [val, value];
         } else if (use.isArray(val)) {
            val.push(value);
         } else {
            obj[name] = value;
         }
      }
      
      self.toObject = function(selector, parentElement) {
         var result = {};
         if ( arguments.length == 1) {
            if (use.isString(arguments[0])) {
               selector = arguments[0];
               parentElement = null;
            }
            else {
               parentElement = arguments[0];
               selector = null;
            }
         }
         selector = selector || "input[type='text'], input[type='checkbox'], input[type='date'], select, textarea";
         parentElement = parentElement || document.forms[0];
         var elements = parentElement.querySelectorAll(selector);
         var name;
         var position = 0;
         for (var property in elements) {
            var element = elements[property];
            if (element.name) {
               name = element.name;
            } else if (element.id) {
               name = element.id;
            }
            else {
               name = ++position;
            }
            setValue(result, name, self.getValue(element));
         }
         return result;
      };

      self.tableToObject = function(table) {
         var result = [];
         var headers = table.querySelectorAll("th");
         var rows = table.querySelectorAll("tbody>tr");

         for (var t = 0, row; row = rows[t]; t++) {
            var item = {};
            for (var i = 0, cell; cell = row.cells[i]; i++) {
               if (headers[i]) {
                  item[headers[i].innerHTML] = cell.innerHTML;
               }
               else {
                  item[i] = cell.innerHTML;
               }
            }
            result.push(item);
         };
         return result;
      };
      
      function attr(elem, name, value) {
         // Make sure that a valid name was provided
         if ( !name || name.constructor != String ) return '';
         // Figure out if the name is one of the weird naming cases
         name = {
            'for': 'htmlFor',
            'class': 'className'
         }
         [name] || name;
         // If the user is setting a value, also
         if ( typeof value != 'undefined' ) {
            // Set the quick way first
            elem[name] = value;
            // If we can, use setAttribute
            if ( elem.setAttribute )
               elem.setAttribute(name,value);
         }
         // Return the value of the attribute
         return elem[name] || elem.getAttribute(name) || '';
      }
      
      self.toDOM = function(object, parentElement) {
         var element;
         parentElement = parentElement || document;

         for (var property in object) {
            var item = object[property];
            switch (item.type){
               case "select":
                  element = document.createElement("select");
                  break;
               case "checkbox":
                  element = document.createElement("input");
                  break;
               default :
                  element = document.createElement("input");
            }
            element.setAttribute("type", item.type);
            element.setAttribute("name", item.name);
            element.setAttribute("value", item.value);
            parentElement.appendChild(element);
         }
      };
      
      HTMLElement.prototype.next = function() {
         return this.nextElementSibling;
      };
      
      HTMLElement.prototype.prev = function() {
         return this.previousElementSibling;
      };
      
      self.getElements = function(element, direction, selector, maximumLength) {
         if ( arguments.length == 3) {
            if (use.isString(arguments[2])) {
               selector = arguments[2];
               maximumLength = null;
            }
            else {
               maximumLength = arguments[2];
               selector = null;
            }
         }
         maximumLength = maximumLength || -1;
         var elements = [];
         while (element = element[direction]) {
            if (element.nodeType == 1)
               elements.push(element);
            if (elements.length == maximumLength)
               break;
         }
         return elements;
      };

      self.createDOM = function(data, parent) {
         for (var section in data)
         {
            switch (section)
            {
               case "linkgroup":
                  self.createLinkGroup(data[section], parent);
                  break;
               case "table":
                  self.createTable(data[section], parent);
                  break;
               default:
            }
         }
      };

      self.createLinkGroup = function(data, parent) {
         parent = parent || document.body;
         var ul;
         div = document.createElement("div");
         if (data.title) {
            header = document.createElement("header");
            header.appendChild(document.createTextNode(data.title));
            div.appendChild(header);
         }
         ul = document.createElement("ul");
         data.link.forEach(function(element, index, array) {
            var li = document.createElement("li");
            var link = document.createElement("a");
            link.href= element.href;
            link.appendChild(document.createTextNode(element.value));
            li.appendChild(link);
            ul.appendChild(li);
         });
         div.appendChild(ul);
         parent.appendChild(div);
      };

      self.createTable = function(data, parent) {
         parent = parent || document.body;
         var thead;
         var table = document.createElement("table");
         var tbody = document.createElement("tbody");
         for (var propName in data) {
            caption = document.createElement("caption");
            caption.appendChild(document.createTextNode(propName));
            table.appendChild(caption);
            if (use.isArray(data[propName])) {
               thead = document.createElement("thead");
               table.appendChild(thead);
               for (var property in data[propName]) {
                  var item = data[propName][property];
                  row = document.createElement("tr");
                  thead.appendChild(row);
                  for (var prop in item) {
                     cell = document.createElement("th");
                     cell.innerHTML = prop;
                     row.appendChild(cell);
                  }
                  break;
               }
               data[propName].forEach(function(item, index, array) {
                  row = document.createElement("tr");
                  tbody.appendChild(row);
                  for (var prop in item) {
                     cell = document.createElement("td");
                     cell.innerHTML = item[prop];
                     row.appendChild(cell);
                  }
               });
            }
            break;
         }
         table.appendChild(tbody);
         parent.appendChild(table);
      };

      function createRows(data, parent) {
         var row, cell;

         function createRow(element, index, array) {
            if (use.isObject(element) && !use.isArray(element)) {
               row = document.createElement("tr");
               parent.appendChild(row);
               for (var property in element) {
                  if (use.isArray(element[property])) {
                     if (use.isObject(element[property][0])) {
                        if (use.isElement(cell)) {
                           cell.setAttribute("rowspan", element[property].length + 1);
                        }
                        createRows(element[property], parent);
                     }
                     else {
                        element[property].forEach(function(element, index, array) {
                           cell = document.createElement("td");
                           cell.innerHTML = element;
                           row.appendChild(cell);
                        });
                     }
                  }
                  else {
                     cell = document.createElement("td");
                     cell.innerHTML = element[property];
                     row.appendChild(cell);
                  }
               }
            }
            else {
               if (use.isArray(element)) {
                  createRows(element, parent);
               }
               else {
                  cell = document.createElement("td");
                  cell.innerHTML = item;
                  row.appendChild(cell);
               }
            }
         }
         data.forEach(createRow);
      }

      self.createNestedTable = function(data, parent) {
         parent = parent || document.body;
         var thead;

         table = document.createElement("table");
         tbody = document.createElement("tbody");
         for (var propName in data) {
            caption = document.createElement("caption");
            caption.appendChild(document.createTextNode(propName));
            table.appendChild(caption, tbody);
            if (use.isArray(data[propName])) {
               thead = document.createElement("thead");
               table.appendChild(thead);
               for (var property in data[propName]) {
                  var el = data[propName][property];
                  row = document.createElement("tr");
                  thead.appendChild(row);
                  for (var prop in el) {
                     cell = document.createElement("th");
                     cell.innerHTML = prop;
                     row.appendChild(cell);
                  }
                  break;
               }
               createRows(data[propName], tbody);
            }
            break;
         }
         table.appendChild(tbody);
         parent.appendChild(table);
      };


      self.createPropertyTable = function(data, parent) {
         parent = parent || document.body;
         table = document.createElement("table");
         tbody = document.createElement("tbody");
         for (var propName in data) {
            caption = document.createElement("caption");
            caption.appendChild(document.createTextNode(propName));
            table.appendChild(caption);
            if (use.isArray(data[propName])) {
               for (var property in data[propName]) {
                  var item = data[propName][property];
                  row = document.createElement("tr");
                  tbody.appendChild(row);
                  for (var prop in item) {
                     cell = document.createElement("td");
                     cell.innerHTML = prop;
                     row.appendChild(cell);
                     cell = document.createElement("td");
                     cell.innerHTML = item[prop];
                     row.appendChild(cell);
                  }
               }
            }
            break;
         }
         table.appendChild(tbody);
         parent.appendChild(table);
      };
         //http://code.google.com/p/json-template/
         //http://www.json.org/fatfree.html
         http://docs.dojocampus.org/dojox/json/ref
         //http://www.mongodb.org/display/DOCS/Database+References
         self.createForm = function(data, parent) {
            parent = parent || document.body;
            var form = document.createElement("form");
            var body = document.createElement("div");
            for (var propName in data) {
               header = document.createElement("header");
               header.appendChild(document.createTextNode(propName));
               form.appendChild(header);
               if (use.isObject(data[propName])) {
                  createFields(data[propName], body);
               }
            }
            form.appendChild(body);
            parent.appendChild(form);
         };

      function createFields(data, parent) {
         function createField(name, value, type, parent) {
            var field;
            switch (type){
               case "select":
                  field = document.createElement("select");
                  break;
               case "checkbox":
                  field = document.createElement("input");
                  break;
               case "textarea":
                  field = document.createElement("textarea");
                  break;
               default :
                  field = document.createElement("input");
            }
            field.setAttribute("id", name);
            field.setAttribute("name", name);
            field.setAttribute("value", value);
            field.setAttribute("type", type);
            if (type == "checkbox" && use.isBoolean(value)) {
               field.checked = value;
            }
            else {
               field.checked = true;
            }
            label = document.createElement("label");
            label.setAttribute("for", field.id);
            label.innerHTML = name;
            parent.appendChild(label);
            parent.appendChild(field);
            return field;
         }

         function createSelectByRef(refName, value, parent) {
            sps.AJAX.get(
            {
               url: refName + ".json",
               handleAs: 'json',
               onSuccess: function(data) {
                  select = createField(refName, value, "select", parent);
                  data = use.getFirstProperty(data);
                  data.forEach(function(element, index, array){
                     select.options[select.options.length] = new Option(data[index], index);
                     if (data[index] == value) {
                        select.selectedIndex = index;
                     }
                  });
               },
               onError: function(data) {
                  alert(refName + ' File Not Found')
               }
            });
         }
         var ul = document.createElement("ul");
         parent.appendChild(ul);
         for (var property in data) {
            var value = data[property];
            var type = "text";
            var li = document.createElement("li");
            ul.appendChild(li);
            if (use.isArray(value)) {
               if (use.isObject(value[0])) {
                  if (value[0].$ref) {
                     createSelectByRef(value[0].$ref, value[0].$id, li);
                  }
               }
               else {
                  value.forEach(function(element, index, array) {
                     createField(element, element, "checkbox", li);
                  });
               }
            }
            else
            if (use.isObject(value)) {
               if (Object.keys(value).length == 0) {
                  createField(property, '{}', 'textarea', li);
               }
               else {
                  fieldset = document.createElement("fieldset");
                  legend = document.createElement("legend");
                  legend.appendChild(document.createTextNode(property));
                  fieldset.appendChild(legend);
                  createFields(value, fieldset);
                  li.appendChild(fieldset);             
               }
            }
            else {
               if (use.isBoolean(value)) {
                  type = "checkbox";
               }
               createField(property, value, type, li);
            }
         }
      }

      return self;
   }());

   return use;
}(sps || {}));