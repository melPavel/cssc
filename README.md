
---


**Caution:** This version is a BETA.

*Stable version checklist:*
- [x] ~~*Support all modern Browser and IE 9+*~~
- [x] ~~*Support CSS parse on server side*~~
- [ ] *no malfunction of the code*

---

# CSSC
CSSC is a CSS Controller to manage your Cascading Style Sheets.

## General
CSSC can be used to define Cascading Style Sheets (CSS) in your browser, to change/show/delete allready defined CSS.



## Controller object (CSSC)
The controller object (CSSC) is a function to get handler object or to import new style sheets.

* get handler object
    ```javascript
    var h = CSSC(".className"); //get handler object with all CSS objects are defined as .className
        h = CSSC([".className1", ".className2"]); //get handler object with .className1 and .className2
        h = CSSC(/\.className[0-9]{,1}/); //get handler obejct with objects matched to regular expression
        h = CSSC(); //get handler object with all defined CSS objects
    ```
* define CSS (import)
    ```javascript
    //define new style sheets in browser
    CSSC({
        ".className": {
            border: "1px solid #000"
        },
        ".className1": {
            border: "1px dotted #000"
        },
        ".className2": function(){ //updatable object
            return {
                border: "none"
            };
        }
    });
    ```

## Controller methods

---

### .init()
**init** is a method to initialize allready defined CSS. After **init** you can change, show or delete CSS.
```
.init(initObj)
```
* `initObj` - DOM "<style\>", "<link\>" element, an other CSSC object, StyleSheet object or Array containing it.

**`Return value`** - Controller object (CSSC)

#### Example
```javascript
// init all defined CSS rules in 
// '<style id="style-sheet">...</style>' element
CSSC.init(document.getElementById("style-sheet")); 

// init all CSS rules in all 
// '<style>...</style>' elements
CSSC.init(document.querySelectorAll("style")); 
``` 

---

### .import()
**import** is a method to import JS objects to the CSS Controller.
```
.import(importObj)
```
* `importObj` - an object with style sheets

**`Return value`** - Controller object (CSSC)

#### Example
```javascript
var importObj = {
    body: {
        margin: 1
    },
    p: {
        width: 500,
        margin: "auto",
        "span.first": { // generate CSS rule "p span.first"
            "font-size": 25
        },
        "@media screen and (max-width: 500px)": { // generate media rule with "p" rule
            width: "100%"
        }
    },
    ".updatable": function(){ // generate updatable class
        return {
            'font-size': 10 + (Math.random() * 10),
        };
    }
};

CSSC.import(importObj); //alternativly can be used simply CSSC(importObj);
``` 

---

### .update()
**update** is a method for updating CSS properties which have been defined via functions
```
.update([selector])
```
* *`selector` \[optional\]* - a selector as String or RegEx or Array of Strings

**`Return value`** - Controller object (CSSC)

#### Example
```javascript
CSSC.update(); // update all CSS rules which were defined through functions
// or
CSSC.update(".updatable"); // update CSS rule .updatable when it was defined through function
``` 

---

### .export()
**export** is a method to export defined CSS as String, Object or Array
```
.export([exportType])
```
* *`exportType` \[optional\]* - String with export type (default: "object")
    * *`"css"` - export as CSS String*
    * *`"min"` - export as minified CSS String* 
    * *`"obj"` - export as JS-Object*
    * *`"arr"` - export as array*
    * *`"object"` - the same as "obj"*
    * *`"objNMD"` - export as not multidimensional object*
    * *`"array"` - the same as "arr"*

**`Return value`** - Mixed

#### Example
```javascript
CSSC({
    body: {
        margin: 1
    },
    p: {
        width: 500,
        margin: "auto",
        "span.first": { // generate CSS rule "p span.first"
            "font-size": 25
        },
        "@media screen and (max-width: 500px)": { // generate media rule with "p" rule
            width: "100%"
        }
    },
    ".updatable": function(){ // generate updatable class
        return {
            'font-size': 10 + (Math.random() * 10),
        };
    }
});

var exportObject = CSSC.export(); // or CSSC.export("obj") or CSSC.export("object")
console.log(JSON.stringify(exportObject, true, 4));
/*
{
    "body": {
        "margin": "1px"
    },
    "p": {
        "width": "500px",
        "margin": "auto",
        "span.first": {
            "font-size": "25px"
        },
        "@media screen and (max-width: 500px)": {
            "width": "100%"
        }
    },
    ".updatable": {
        "font-size": "18.34px"
    }
}
*/

exportObject = CSSC.export("css");
console.log(exportObject);
/*
body {
  margin: 1px;
}
p {
  width: 500px;
  margin: auto;
}
p span.first {
  font-size: 25px;
}
@media screen and (max-width: 500px) {
  p {
    width: 100%;
  }
}
.updatable {
  font-size: 18.34px;
}
*/

exportObject = CSSC.export("min");
console.log(exportObject);
/*
body{margin:1px;}p{width:500px;margin:auto;}p span.first{font-size:25px;}@media screen and (max-width:500px){p{width:100%;}}.updatable{font-size:18.34px;}
*/

exportObject = CSSC.export("objNMD");
console.log(JSON.stringify(exportObject, true, 4));
/*
{
    "body": {
        "margin": "1px"
    },
    "p": {
        "width": "500px",
        "margin": "auto"
    },
    "p span.first": {
        "font-size": "25px"
    },
    "@media screen and (max-width: 500px)": {
        "p": {
            "width": "100%"
        }
    },
    ".updatable": {
        "font-size": "18.34px"
    }
}
*/

exportObject = CSSC.export("array");
console.log(JSON.stringify(exportObject, true, 4));
/*
[
    {
        "body": {
            "margin": "1px"
        }
    },
    {
        "p": {
            "width": "500px",
            "margin": "auto"
        }
    },
    {
        "p span.first": {
            "font-size": "25px"
        }
    },
    {
        "@media screen and (max-width: 500px)": [
            {
                "p": {
                    "width": "100%"
                }
            }
        ]
    },
    {
        ".updatable": {
            "font-size": "18.34px"
        }
    }
]
*/
``` 

---

### .parse()
**parse** is a method to parse defined CSS. This method is identical to .export(CSSC.type_export.css) or export(CSSC.type_export.min)

```
.parse([min])
```
* *`min` \[optional\]* - Boolean, if true return a minified CSS (default: false)

**`Return value`** - String with CSS

#### Example
```javascript
/*
this method returns the same result as .export("css") or .export("min");
*/

exportObject = CSSC.parse(); // or .parse(false)
console.log(exportObject);
/*
body {
  margin: 1px;
}
p {
  width: 500px;
  margin: auto;
}
p span.first {
  font-size: 25px;
}
@media screen and (max-width: 500px) {
  p {
    width: 100%;
  }
}
.updatable {
  font-size: 18.34px;
}
*/

exportObject = CSSC.parse(true);
console.log(exportObject);
/*
body{margin:1px;}p{width:500px;margin:auto;}p span.first{font-size:25px;}@media screen and (max-width:500px){p{width:100%;}}.updatable{font-size:18.34px;}
*/
```

---

### .new()
**new** is a method to get a new CSS Controller (CSSC)
```
.new()
```
**`Return value`** - New Controller object (CSSC)

#### Example
```javascript
var newCSSC = CSSC.new();
newCSSC({
    ".myClass": {
        "margin-top": 10
    }
});
```

---

### .conf()
**conf** is a method to set or get configurations.
```
.conf([conf[, value]])
```
* *`conf` \[optional\]* - An object with key-value pair to set, Array of Strings to get or key as String to set/get
* *`value` \[optional\]* - if conf a String becomes value to set

**`Return value`** - Mixed -> Controller object (CSSC) if set or object key-value pair or configuration value

#### Example
```javascript
CSSC.conf({ // set as object
    style_id: "my-style-sheets", // [String]  Document element ID 
    view_err: true,              // [Boolean] Show errors in console
    parse_tab_len: 4             // [Integer] Length of space characters by export
});

CSSC.conf("style_id", "cssc-sheet");      // set with key String
CSSC.conf("style_id");                    // get with key String 
CSSC.conf(["style_id", "parse_tab_len"]); // get with Array of strings, return an object as key-value pair
CSSC.conf();                              // get all defined configurations
```

---

### .vars()
**vars** is a method to set or get variables. If you need to use variable keys, you can use this method.
```
.vars([var[, value]])
```
* *`var` \[optional\]* - An object with key-value pair to set, Array of Strings to get or key as String to set/get
* *`value` \[optional\]* - if conf a String becomes value to set

**`Return value`** - Mixed -> Controller object (CSSC) if set or object key-value pair or variable value

#### Example
```javascript
//The principle of set and get vars is the same as with conf method.

CSSC.vars({
    T: "-top", // use String / Integer / Float
    R: "-right",
    B: "-bottom",
    L: "-left",
    box: { // use Objects or Arrays
        m: "margin",
        p: "padding"
    },
    media: function(a, b) // use Functions
    {
        return "@media "+a+" and (max-width: "+b+"px)";
    },
    MT: "$box.m$T", // use vars in vars
});


// begin the var with "$" character
CSSC({
    body: {
        "$box.m": 10,
        "$box.p$T": 15,
        "$media(screen, 500)": {
            "$box.m$B": 20,
            $MT: 25
        }
    }
});

console.log(CSSC.parse());
/*
body {
  margin: 10px;
  padding-top: 15px;
}
@media screen and (max-width: 500px) {
  body {
    margin-bottom: 20px;
    margin-top: 25px;
  }
}
*/
```

---

### .parseVars()
this method is a helper function, can be used to test your vars.
```
.parseVars(text[, vars])
```
* `text` - A String, the text to parse
* *`vars` \[optional\]* - An object with variables as key-value pair

**`Return value`** - Parsed string 

#### Example
```javascript
CSSC.vars({
    myVar: "my variable text",
});

var val = CSSC.parseVars("this is $myVar");
console.log(val);
/*
this is my variable text
*/

val = CSSC.parseVars("this is $myVar", {myVar: "my temporarily overwritten text"});
console.log(val);
/*
this is my temporarily overwritten text
*/

val = CSSC.parseVars("this var $notExists");
console.log(val);
/*
this var $notExists
*/
```

---

### .cssFromObj()
this method is a helper function, can be used to parse CSS from simple object
```
.cssFromObj(obj[, min[, tabLen]])
```
* `obj` - A simple object to parse
* *`min` \[optional\]* - a Boolean if the value true, return value is a minified CSS String (default: false)
* *`tabLen` \[optional\]* - an Integer to define the length of tab (default: 2)

**`Return value`** - Parsed string 

#### Example
```javascript
var cssString = CSSC.cssFromObj({body:{margin: "20px"}});
console.log(cssString);
/*
body {
  margin: 20px;
}
*/

cssString = CSSC.cssFromObj({body:{margin: "20px"}}, true);
console.log(cssString);
/*
body{margin:20px;}
*/

cssString = CSSC.cssFromObj({body:{margin: "20px"}}, false, 8);
console.log(cssString);
/*
body {
        margin: 20px;
}
*/
```

---

### .objFromCss()
this method is a helper function, can be used to generate an object from a css string.
```
.objFromCss(css)
```
* `css` - A CSS String

**`Return value`** - Generated object

#### Example
```javascript
var cssObj = CSSC.objFromCss("body{margin:20px;}");
console.log(JSON.stringify(cssObj, true, 4));
/*
{
    "margin": "20px"
}
*/
```

---

## Controller properties

---

### .version
**version** is a String with version number of CSS Controller

```javascript
console.log(CSSC.version);
/*
1.0b
*/
``` 

---

### .type
**type** is an object with CSS type definitions

```javascript
console.log(JSON.stringify(CSSC.type, true, 4));
/*
{
    "rule": 1,
    "charset": 2,
    "import": 3,
    "media": 4,
    "fontFace": 5,
    "page": 6,
    "keyframes": 7,
    "keyframe": 8,
    "namespace": 10,
    "counterStyle": 11,
    "supports": 12,
    "fontFeatureValues": 14,
    "viewport": 15
}
*/
``` 

---

### .type_export
**type_export** is an object with CSS Controller export-type definitions

```javascript
console.log(JSON.stringify(CSSC.type_export, true, 4));
/*
{
    "css": "css",
    "min": "min",
    "obj": "obj",
    "arr": "arr",
    "object": "object",
    "notMDObject": "objNMD",
    "array": "array"
}
*/
``` 

---

### ._conf
**_conf** is an object with default CSSC configurations

```javascript
console.log(JSON.stringify(CSSC._conf, true, 4));
/*
{
    "style_id": "cssc-style",   // [String]  ID of the "<style>" element
    "view_err": true,           // [Boolean] if true, the errors are displayed in console
    "parse_tab_len": 2,         // [Integer] Length of space characters by export
    "parse_unit_default": "px", // [String]  default unit to set on values if integer or float given
    "parse_vars_limit": 100     // [Integer] limit to max parse variables
}
*/
``` 

---

## Handler object
The Handler object is an object to get, set, delete, update and export defined CSS properties. You get this object from the controller object

```javascript
var h = CSSC(".className"); //get a handler object with all CSS objects are defined as .className
    h = CSSC([".className1", ".className2"]); //get a handler object with .className1 and .className2
    h = CSSC(/\.className[0-9]{,1}/); //get a handler obejct with objects matched to regular expression
    h = CSSC(); //get a handler object with all defined CSS objects
```

## Handler methods

---

### .get()
**get** is a method to get CSS properties
```
.get([propertie[, returnAll]])
```
* *`propertie` \[optional\]* - A String with property name. If this value is not given, return this method an object with all properies of the Handler object
* *`returnAll` \[optional\]* - A Boolean. If true, the return value is an Array with all found properties; if false, the return value is the last definition of property in the Handler object (default: false)

**`Return value`** - Mixed -> Object, String or Array of Strings, depending on how the parameters were set

#### Example
```javascript
CSSC({
    body: [{
        margin: 10,
        padding: 5,
    },{
        border: "1 solid #ccc",
        padding: 7
    }]
});

var val = CSSC("body").get("padding");
console.log(val);
/*
7px
*/

val = CSSC("body").get("padding", true);
console.log(JSON.stringify(val, true, 4));
/*
[
    "5px",
    "7px"
]
*/

val = CSSC("body").get();
console.log(JSON.stringify(val, true, 4));
/*
{
    "body": [
        {
            "margin": "10px",
            "padding": "5px"
        },
        {
            "border": "1px solid #ccc",
            "padding": "7px"
        }
    ]
}
*/
```


---

### .set()
**set** is a method to set CSS properties
```
.set(toSet[, value])
```
* `toSet` - A property to set as String, an object to set with key-value pair, a function that returns the values to set, or Array containing an object or function with key-value. 
* *`value` \[optional\]* - use this when `toSet` a String. A value to set as String/Integer/Float, a function that returns the values to set, an object to create a new CSS rule or an Array with objects to create new rules.

**`Return value`** - Handler object.

#### Example
```javascript
CSSC({
    body: {
        margin: 10,
        padding: 5,
    }
});

CSSC("body").set("border", "1 solid red");
console.log(CSSC.parse());
/*
body {
  margin: 10px;
  padding: 5px;
  border: 1px solid red;
}
*/

CSSC("body").set({margin: 20, padding: 0});
console.log(CSSC.parse());
/*
body {
  margin: 20px;
  padding: 0px;
  border: 1px solid red;
}
*/

CSSC("body").set(".newClass",{margin: "5 0 0 10", float: "left"});
console.log(CSSC.parse());
/*
body {
  margin: 20px;
  padding: 0px;
  border: 1px solid red;
}
body .newClass {
  margin: 5px 0px 0px 10px;
  float: left;
}
*/

CSSC("body .newClass").set({border: "1 solid #ccc", "/.class1":{float: "none"}});
console.log(CSSC.parse());
/*
body {
  margin: 20px;
  padding: 0px;
  border: 1px solid red;
}
body .newClass {
  margin: 5px 0px 0px 10px;
  float: left;
  border: 1px solid #ccc;
}
body .newClass.class1 {
  float: none;
}
*/
```

---

### .delete()
**delete** is a method to delete a CSS property or a CSS rule
```
.delete([property])
```
* *`property` \[optional\]* - A property name to delete. If this value not given, the method deletes the complete rule(s)

**`Return value`** - Handler object.

#### Example
```javascript
CSSC({
    body: [{
        margin: 10,
        padding: 5,
    },{
        border: "1 solid #ccc",
        padding: 7
    }]
});

var parsed = CSSC.parse();
console.log(parsed);
/*
body {
  margin: 10px;
  padding: 5px;
}
body {
  border: 1px solid #ccc;
  padding: 7px;
}
*/

// delete property
CSSC("body").delete("padding");
parsed = CSSC.parse();
console.log(parsed);
/*
body {
  margin: 10px;
}
body {
  border: 1px solid #ccc;
}
*/

//delete rule
CSSC("body").first().delete();
parsed = CSSC.parse();
console.log(parsed);
/*
body {
  border: 1px solid #ccc;
}
*/
```


---

### .update()
**update** is a method to update updatable properties or rules

```
.update()
```

**`Return value`** - Handler object. 

#### Example
```javascript
CSSC({
    '.updatable1': function(){
        return {
            width: Math.random()*100+100,
            height: Math.random()*100+100,
        };
    },
    '.updatable2': {
        width: 20,
        height: function(){ return Math.random()*10+10; }
    }
});

var parsed = CSSC.parse();
console.log(parsed);
/*
.updatable1 {
  width: 166.16px;
  height: 147.66px;
}
.updatable2 {
  width: 20px;
  height: 16.13px;
}
*/

CSSC(".updatable1").update();
parsed = CSSC.parse();
console.log(parsed);
/*
.updatable1 {
  width: 101.4px;
  height: 143.95px;
}
.updatable2 {
  width: 20px;
  height: 16.13px;
}
*/

CSSC(/\.updatable[12]/).update();
parsed = CSSC.parse();
console.log(parsed);
/*
.updatable1 {
  width: 117.66px;
  height: 198.24px;
}
.updatable2 {
  width: 20px;
  height: 10.94px;
}
*/
```

---

### .export()
**export** is a method to export defined CSS as String, Object or Array
```
.export([exportType])
```
* *`exportType` \[optional\]* - String with export type (default: "object")
    * *`"css"` - export as CSS String*
    * *`"min"` - export as minified CSS String* 
    * *`"obj"` - export as JS-Object*
    * *`"arr"` - export as array*
    * *`"object"` - the same as "obj"*
    * *`"objNMD"` - export as not multidimensional object*
    * *`"array"` - the same as "arr"*

**`Return value`** - Mixed

#### Example
```javascript
CSSC({
    body: {
        margin: 1
    },
    p: {
        width: 500,
        margin: "auto",
        "span.first": {
            "font-size": 25
        },
        "@media screen and (max-width: 500px)": { 
            width: "100%"
        }
    }
});

var exportObject = CSSC("p").export(); // or CSSC.export("obj") or CSSC.export("object")
console.log(JSON.stringify(exportObject, true, 4));
/*
{
    "p": {
        "width": "500px",
        "margin": "auto",
        "span.first": {
            "font-size": "25px"
        },
        "@media screen and (max-width: 500px)": {
            "width": "100%"
        }
    }
}
*/

exportObject = CSSC("p").export("css");
console.log(exportObject);
/*
p {
  width: 500px;
  margin: auto;
}
*/

```

---

### .parse() 
**parse** is a method to parse defined CSS. This method is identical to .export(CSSC.type_export.css) or .export(CSSC.type_export.min)
```
.parse([min])
```
* *`min` \[optional]\* - Boolean, if true return a minified CSS (default: false)

**`Return value`** - String with CSS

#### Example
```javascript
/*
this method returns the same result as .export("css") or .export("min");
*/

exportObject = CSSC("p").parse(true);
console.log(exportObject);
/*
p{width:500px;margin:auto;}
*/
```

---

### .pos()
**pos** is a method to get a Handler object with style element of the given position
```
.pos(position)
```
* `position` - Integer, the position of found style elements. If the position is negative, count the position from last.

**`Return value`** - Handler object with style element of the given position

#### Example
```javascript
CSSC({
    p: [{
        height: 100
    },{
        width: 500
    },{
        color: "green"
    }]
});

var handler = CSSC("p");
console.log(handler.e.length);
/*
3
*/
console.log(handler.parse());
/*
p {
  height: 100px;
}
p {
  width: 500px;
}
p {
  color: green;
}
*/

console.log(handler.pos(0).parse());
/*
p {
  height: 100px;
}
*/

console.log(handler.pos(1).parse());
/*
p {
  width: 500px;
}
*/

console.log(handler.pos(-1).parse());
/*
p {
  color: green;
}
*/
```

---

### .first()
**first** is a method to get a Handler object with first style element. This method is equivalent to `.pos(0)`
```
.first()
```

**`Return value`** - Handler object with first style element

#### Example
```javascript
CSSC({
    p: [{ height: 100 },{ width: 500 },{ color: 0xff00 }]
});

console.log(CSSC("p").first().parse());
/*
p {
  height: 100px;
}
*/
```

---

### .last()
**last** is a method to get a Handler object with last style element. This method is equivalent to `.pos(-1)`
```
.last()
```

**`Return value`** - Handler object with last style element

#### Example
```javascript
CSSC({
    p: [{ height: 100 },{ width: 500 },{ color: 0xff00 }]
});

console.log(CSSC("p").last().parse());
/*
p {
  color: rgb(0, 255, 0);
}
*/
```

---

## Handler properties

---

### .e
**e** is an Array with CSS Objects

```javascript
CSSC({
    ".className": {
        border: "1px solid #000"
    },
    ".className1": {
        border: "1px dotted 0x0"
    },
    ".className2": {
        border: "none"
    }
});

CSSC(".className").e
```
![console screenshot](https://csscjs.com/img/e_array1.png)

```javascript
CSSC(/\.className/).e
```
![console screenshot](https://csscjs.com/img/e_array2.png)

---

### .selector

---
