/**
 * CSSController - Dynamic CSS Controller. 
 *  ↳ CSSC         A way to manage style sheets.
 * 
 * @version 1.0b
 *
 * @author m13p4
 * @copyright Meliantchenkov Pavel
 */
var CSSC = (function()
{ 'use strict';
    
    var VERSION = "1.0b",
    
        TYPE_rule       = 1, //check
        TYPE_charset    = 2, //check
        TYPE_import     = 3, //check
        TYPE_media      = 4, //check
        TYPE_fontFace   = 5, //check
        TYPE_page       = 6, //check
        TYPE_keyframes  = 7, //check
        TYPE_keyframe   = 8, //check
        TYPE_namespace      = 10, //check
        TYPE_counterStyle   = 11, 
        TYPE_supports       = 12, //check
        TYPE_fontFeatureValues = 14,
        TYPE_viewport          = 15,
        TYPE = helperObjectFreeze({
            'rule':      TYPE_rule, 
            'charset':   TYPE_charset, 
            'import':    TYPE_import,
            'media':     TYPE_media, 
            'fontFace':  TYPE_fontFace,
            'page':      TYPE_page,
            'keyframes': TYPE_keyframes,
            'keyframe':  TYPE_keyframe,
            'namespace':    TYPE_namespace,
            'counterStyle': TYPE_counterStyle, 
            'supports':     TYPE_supports,
            'fontFeatureValues': TYPE_fontFeatureValues,
            'viewport':          TYPE_viewport
        }),
        TYPE_EXPORT_css         = 1,
        TYPE_EXPORT_min         = 2,
        TYPE_EXPORT_obj         = 3, //default
        TYPE_EXPORT_arr         = 4,
        TYPE_EXPORT_notMDObject = 5, //not MultiDimensional Object
        TYPE_EXPORT = {
            css:    TYPE_EXPORT_css,
            min:    TYPE_EXPORT_min,
            obj:    TYPE_EXPORT_obj,
            object: TYPE_EXPORT_obj,
            arr:    TYPE_EXPORT_arr,
            array:  TYPE_EXPORT_arr,
            objNMD: TYPE_EXPORT_notMDObject
        },
        TYPE_EXPORT_STR = helperObjectFreeze({
            css:         "css",
            min:         "min",
            obj:         "obj",
            arr:         "arr",
            object:      "object",
            notMDObject: "objNMD",
            array:       "array"
        }),
        CONF_DEFAULT_style_id = "cssc-style",
        CONF_DEFAULT_view_err = true,
        CONF_DEFAULT_parse_tab_len = 2,
        CONF_DEFAULT_parse_unit_default = "px",
        CONF_DEFAULT_parse_vars_limit = 100,
        CONF_DEFAULT = helperObjectFreeze({
            style_id: CONF_DEFAULT_style_id,
            view_err: CONF_DEFAULT_view_err,
            parse_tab_len: CONF_DEFAULT_parse_tab_len,
            parse_unit_default: CONF_DEFAULT_parse_unit_default,
            parse_vars_limit: CONF_DEFAULT_parse_vars_limit
        }),
        _TYPE_Null      = 1,
        _TYPE_Undefined = 2,
        _TYPE_Integer   = 3,
        _TYPE_Float     = 4,
        _TYPE_String    = 5,
        _TYPE_RegExp    = 6,
        _TYPE_Array     = 7,
        _TYPE_Object    = 8,
        _TYPE_Function  = 9,
        _TYPE = {
            'Null'      : _TYPE_Null,
            'Undefined' : _TYPE_Undefined,
            'Integer'   : _TYPE_Integer,
            'Float'     : _TYPE_Float,
            'String'    : _TYPE_String,
            'RegExp'    : _TYPE_RegExp,
            'Array'     : _TYPE_Array,
            'Object'    : _TYPE_Object,
            'Function'  : _TYPE_Function
        },
        PRE_IMPORT_KEYS = ["@charset", "@import", "@namespace", "@font-face"],
        SINGLE_ROW_KEYS = PRE_IMPORT_KEYS.slice(0, 3), //["@charset", "@import", "@namespace"]
        MESSAGES = [];
    
    function helperError(err, cnf)
    {
        if(cnf.view_err) console.log(err);
        MESSAGES.push(err);
    }
    function helperElemType(elem)
    {
        var type = Object.prototype.toString.call(elem).split(/ |\]/)[1];
        if(type === "Number") type = Math.floor(elem) === elem ? "Integer" : "Float";
        return _TYPE[type] ? _TYPE[type] : type;
    }
    function helperObjectAssign()
    {
        if(Object.assign) return Object.assign.apply(null, arguments);
        var key, i;
        for(i = 1; i < arguments.length; i++)
            for(key in arguments[i]) 
                arguments[0][key] = arguments[i][key];
        return arguments[0];
    }
    function helperObjectDefineReadOnlyPropertys(obj, propsObj)
    {
        var key;
        if(Object.defineProperty) for(key in propsObj)
            Object.defineProperty(obj, key, {
                enumerable: true,
                value: propsObj[key]
            });
        else for(key in propsObj) obj[key] = propsObj[key];
    }
    function helperObjectFreeze(obj)
    {
        if(Object.freeze) return Object.freeze(obj);
        else if(Object.defineProperty)
        {
            var tmp = {}, key;
            for(key in obj) Object.defineProperty(tmp, key, {
                    enumerable: true,
                    value: obj[key]
                });
            obj = tmp;
        }
        if(Object.preventExtensions) Object.preventExtensions(obj);
        return obj;
    }
    function helperObjectKeysValues(obj,getValues)
    {
        if(!getValues && Object.keys)  return Object.keys(obj);
        if(getValues && Object.values) return Object.values(obj);
        var ret = [], key;
        for(key in obj) ret.push(getValues ? obj[key] : key);
        return ret;
    }
    function helperCreateNewStyleElem(index)
    {
        var id = index[4].style_id;
        if(document.getElementById(id))
        {
            for(var i = 0; i < 10; i++)
                if(!document.getElementById(id+'-'+i))
                {
                    id = id+'-'+i;
                    break;
                }
            if(document.getElementById(id))
                throw new Error("cann not create new element..");
        }
        var styleElem = document.createElement("style");
        styleElem.setAttribute("type", "text/css");
        styleElem.setAttribute("id", id);
        styleElem.appendChild(document.createTextNode(""));
        document.head.appendChild(styleElem);

        index[1] = styleElem;
        index[4].style_id = id;
    }
    function helperParseValue(value, key, defUnit)
    {
        var valType  = helperElemType(value), val,
            isString = valType === _TYPE_String,
            isHex    = isString && value.match(/^0x[0-9a-f\.\+]+$/i);
        
        if(isFinite(value) || isHex)
        {
            defUnit = (defUnit || CONF_DEFAULT_parse_unit_default)+"";
            var vNum = value, frac;
            
            if(isHex)
            {
                var endPos = value.search(/\.|\+/);
                if(endPos < 0) vNum = parseInt(value);
                else
                {
                    frac = value.substr(endPos+1);
                    vNum = parseInt(value.substr(0, endPos)) +
                           (value.charAt(endPos) === "+" ? parseFloat(frac) : 
                           parseInt(frac, 16) / Math.pow(16, frac.length));
                }
                valType = helperElemType(vNum);
            }
            else if(isString)
            {
                vNum    = parseFloat(value);
                valType = helperElemType(vNum);
            }
            
            if(isHex || key.match(/(^|-)color$/i))
            {
                val = vNum; frac = 0;
                if(valType === _TYPE_Float)
                {
                    val = Math.floor(vNum);
                    frac = vNum-val;
                }
                val = [(val&0xff0000)>>16,(val&0xff00)>>8,val&0xff].join(", ");
                value = frac > 0 ? "rgba("+val+", "+(Math.floor(frac*100)/100)+")" : "rgb("+val+")";
            }
            else if(valType === _TYPE_Integer) value = vNum+defUnit;
            else value = (Math.floor(vNum*100)/100)+defUnit;
        }
        else if(isString && value.indexOf(" ") > -1)
        {
            val = value.split(" ");
            for(var i = 0; i < val.length; i++) 
                val[i] = helperParseValue(val[i], key, defUnit);
            value = val.join(" ");
        }
        else if(isString && value.charAt(value.length-1) === "!")
                value = value.substr(0, value.length-1);
        return value;
    }
    function helperObjFromCssText(cssText)
    {
        if(/^@(namespace|import|charset)/.test(cssText))
            return cssText.replace(/(^@(namespace|import|charset)\s*|\s*;\s*$)/g, "");
        var str = cssText.replace(/(^.*?{\s*|\s*}\s*$)/g, ''),
            split = str.split(';'), i, kv, obj = {};
        if(str !== "") for(i = 0; i < split.length; i++)
            {
                if(split[i] === "") continue;

                kv = split[i].split(':');
                obj[kv[0].trim()] = kv.slice(1).join(':').trim();
            }
        return obj;
    }
    function helperCssTextFromObj(obj, min, tabLen, addTab, fromArrayParse)
    {
        var tab = (new Array((parseInt(tabLen)||CONF_DEFAULT_parse_tab_len)+1).join(" ")), 
            cssText = "", key, val, elType = helperElemType(obj), i, tmp;

        addTab = addTab || "";

        if(elType === _TYPE_String) return obj;
        if(elType === _TYPE_Array) for(i = 0; i < obj.length; i++)
                cssText += helperCssTextFromObj(obj[i], min, tabLen, addTab, true);
        else
        {
            for(key in obj)
            {
                val = ""+obj[key];
                elType = helperElemType(obj[key]);

                if(elType === _TYPE_Array || elType === _TYPE_Object)
                {
                    if(fromArrayParse && elType === _TYPE_Array)
                    {
                        tmp = helperCssTextFromObj(obj[key], min, tabLen, addTab+tab, fromArrayParse);
                        
                        if(tmp === "") continue;
                        
                        if(min) cssText += key.replace(/\s*(,|:)\s*/g,"$1")+"{"+tmp+"}";
                        else    cssText += addTab+key.replace(/\s*,\s*/g, ",\n"+addTab)+" {\n"+tmp+addTab+"}\n";
                        
                        continue;
                    }
                        
                    if(elType === _TYPE_Object) val = [obj[key]];

                    for(i = 0; i < val.length; i++)
                    {
                        if(SINGLE_ROW_KEYS.indexOf(key) > -1) // key === "@namespace"||"@import"||"@charset"
                        {
                            cssText += key+" "+val[i]+";"+(min?'':"\n");
                            continue;
                        }

                        tmp = helperCssTextFromObj(val[i], min, tabLen, addTab+tab, fromArrayParse);

                        if(tmp === "") continue;
                        
                        if(min) cssText += key.replace(/\s*(,|:)\s*/g,"$1")+"{"+tmp+"}";
                        else    cssText += addTab+key.replace(/\s*,\s*/g, ",\n"+addTab)+" {\n"+tmp+addTab+"}\n";
                    }
                }
                else if(SINGLE_ROW_KEYS.indexOf(key) > -1)
                             cssText += key+" "+val+";"+(min?'':"\n");
                else if(min) cssText += key+":"+val.trim().replace(/\s*,\s*/g,",")+";";
                else         cssText += (addTab.length < tab.length ? tab : addTab)+key+": "+val+";\n";
            }
        }
        return cssText;
    }
    function helperFindPropInCssText(cssText, prop)
    {
        var find = cssText.match(new RegExp(prop+"\s*:\s*(.+?);"));
        return find ? find[1].trim() : "";
    }
    function helperSelectorType(sel)
    {
        sel = sel.trim();

        if(sel.charAt(0) !== "@") return TYPE_rule;

        sel = sel.substr(1);

        var selIO = sel.indexOf(" "), key;

        if(selIO >= 0) sel = sel.substr(0, selIO);

        key = sel;

        if(sel.indexOf("-") > -1)
        {
            var splSel = sel.split("-"), i;

            key = splSel[0];

            for(i = 1; i < splSel.length; i++)
                key += splSel[i].charAt(0).toUpperCase()+splSel[i].substr(1);
        }

        return (key in TYPE) ? TYPE[key] : -1;
    }
    function helperGenSelector(pSel, sel)
    {
        if(sel.charAt(0) === "@" && pSel.charAt(0) === "@")
            sel = sel.substr(1);

        if(sel.charAt(0) === "/")      sel = sel.substr(1);
        else if(sel.charAt(0) === ",") sel = ", "+sel.substr(1).trim();
        else                           sel = " " + sel;

        if(pSel.indexOf(",") >= 0 || sel.indexOf(",") > 0)
        {
            var pSelSplit = pSel.split(","), i, newSel = "",
                selSplit = sel.split(","), j;

            if(sel.charAt(0) !== ",")
                for(i = 0; i < pSelSplit.length; i++)
                    for(j = 0; j < selSplit.length; j++)
                        newSel += pSelSplit[i] + selSplit[j] + ", ";
            else for(i = 0; i < pSelSplit.length; i++)
                    newSel += pSelSplit[i] + sel + ", ";

            return newSel.replace(/,+\s*$/,"");
        }
        return pSel + sel;
    }
    function helperDeleteCSSRule(cssRule)
    {
        var parent = !!cssRule.parentRule ? cssRule.parentRule : cssRule.parentStyleSheet, i;

        for(i = 0; i < parent.cssRules.length; i++) 
            if(parent.cssRules[i] === cssRule)
            {
                parent.deleteRule(i);
                break;
            }
    }
    function helperParseVars(str, vars, limit)
    {
        if(!limit) limit = CONF_DEFAULT_parse_vars_limit;
        if(!vars)  vars = {};
        if(!str)   str = "";

        var varStart = str.lastIndexOf("$"), varEnd, 
            c = 0, v, i, xyz, tmp, key, keySplit, type;

        while(varStart >= 0 && c < limit)
        { c++; v = null;
            
            tmp    = str.substr(varStart+1);
            varEnd = tmp.search(/[^\w\.]/); 

            if(varEnd < 0)  varEnd  = str.length;
            else            varEnd += varStart;

            key = str.substr(varStart+1, varEnd-varStart);
            keySplit = key.split(".");

            for(i = 0; i < keySplit.length; i++)
            {
                if(keySplit[i].length < 1) continue;
                type = helperElemType(v);

                if(i === 0 && keySplit[i] in vars)                                           
                    v = vars[keySplit[i]];
                else if((type === _TYPE_Array || type === _TYPE_Object) && keySplit[i] in v) 
                    v = v[keySplit[i]];
                else if(type === _TYPE_String && keySplit[i].match(/^[0-9]+$/))              
                    v = v.charAt(keySplit[i]);
                else
                {
                    v = "$"+key;
                    break;
                }
                
                if(helperElemType(v) === _TYPE_Function)
                {
                    if(str.charAt(varEnd+1) === "(")
                    { varEnd++;

                        tmp = varEnd;
                        xyz = varEnd;

                        do
                        {
                            xyz = str.indexOf("(", xyz+1);
                            varEnd = str.indexOf(")", varEnd+1);
                        }
                        while(xyz > -1 && xyz < varEnd)

                        if(varEnd < 0) varEnd = str.length;

                        tmp = str.substr(tmp+1, varEnd-tmp-1);
                        tmp = tmp.trim().split(/\s*,\s*/);
                        v   = v.apply(null, tmp);
                    }
                    else v = v();
                    
                    if(str.charAt(varEnd+1) === ".")
                    { varEnd++;

                        xyz    = varEnd;
                        tmp    = str.substr(varEnd+1);
                        varEnd = tmp.search(/[^\w\.]/); 
                        tmp    = tmp.substr(0, varEnd < 0 ? tmp.length : varEnd);

                        if(varEnd < 0)  varEnd  = str.length;
                        else            varEnd += xyz;

                        key = str.substr(varStart+1, varEnd-varStart);
                        tmp = tmp.split(".");

                        for(xyz = 0; xyz < tmp.length; xyz++)
                            keySplit.push(tmp[xyz]);
                    }
                }
            }
            str = str.substr(0, varStart) + v + str.substr(varEnd+1);

            if('$'+key === v) varEnd  = varStart;
            else              varEnd += v.length-1;
            
            if(--varEnd < 0) break;
            varStart = str.lastIndexOf("$", varEnd);
        }
        return str;
    }

    function initElements(index, toInit)
    {
        toInit = "length" in toInit ? toInit : [toInit];

        for(var i = 0; i < toInit.length; i++)
        {
            if("sheet" in toInit[i]) toInit[i] = toInit[i].sheet;

            if("cssRules" in toInit[i])
            {
                try
                {
                    indexCssRules(index, toInit[i].cssRules, null);
                }
                catch(err)
                {
                    helperError("Cannot init CSS from \""+toInit[i].href+"\"", index[4]);
                }
            }
        }
    }
    function indexCssRules(index, cssRules, parent)
    {
        for(var i = 0; i < cssRules.length; i++)
            if(cssRules[i] && !!cssRules[i].parentStyleSheet 
            && !!cssRules[i].parentStyleSheet.ownerNode 
            && cssRules[i].parentStyleSheet.ownerNode.id === index[4].style_id)
                addToIndex(index, cssRules[i], parent);
    }
    function addToIndex(index, cssRule, parent, csscSelector)
    {
        var indexKey  = cssRule.cssText.substr(0, cssRule.cssText.indexOf("{")).trim(),
            indexType = cssRule.type, 
            toIndex   = cssRule,
            _index    = parent ? parent.children : index[0],
            indexObjWrapper, indexC;

        //@todo: support all types
        if(indexType !== TYPE_rule 
        && indexType !== TYPE_fontFace 
        && indexType !== TYPE_media
        && indexType !== TYPE_keyframes
        && indexType !== TYPE_keyframe
        && indexType !== TYPE_page
        && indexType !== TYPE_supports
        && indexType !== TYPE_namespace
        && indexType !== TYPE_import
        && indexType !== TYPE_charset)
        {
            helperError("unsuported type: "+indexType, index[4]);
            return;
        }

        if(indexType === TYPE_namespace) indexKey = SINGLE_ROW_KEYS[2];
        if(indexType === TYPE_import)    indexKey = SINGLE_ROW_KEYS[1];
        if(indexType === TYPE_charset)   indexKey = SINGLE_ROW_KEYS[0];

        indexObjWrapper = {
            indexElem: toIndex,
            selector: indexKey,
            csscSelector: csscSelector ? csscSelector : indexKey,
            children: false,
            parent: (!!parent ? parent : false),
            obj: {},
            type: indexType,
            p: index[2]++,
            //updatable 
            uo: false, //object
            up: {}     //properties
        };

        if(_index[indexKey])
            indexC = (_index[indexKey].content.push(indexObjWrapper) - 1);
        else
        {
            _index[indexKey] = {
                type: indexType,
                content: [indexObjWrapper],
                events: {}
            };

            indexC = 0;
        }

        //handle Media & KeyFrames Rules
        if(indexType === TYPE_media 
        || indexType === TYPE_keyframes 
        || indexType === TYPE_supports)
        {
            _index[indexKey].content[indexC].children = {};

            indexCssRules(index, cssRule.cssRules, _index[indexKey].content[indexC]);
        }
        else
            _index[indexKey].content[indexC].obj = helperObjFromCssText(cssRule.cssText);

        return indexObjWrapper;
    }
    function createRule(index, selector, property, value, parent)
    {
        var appendToElem;

        if(!parent && !index[1]) helperCreateNewStyleElem(index);
        
        appendToElem = parent ? parent.indexElem : index[1].sheet;

        var rulePos = appendToElem.cssRules.length, ruleString = "";

        if(property)
        {
            var propType = helperElemType(property), prop;

            if(propType === _TYPE_Object)
            {
                for(var key in property)
                {
                    if(helperElemType(property[key]) === _TYPE_Function)
                    {
                        prop = property[key]();
                        ruleString += key+":"+prop+"; ";
                    }
                    else
                        ruleString += key+":"+property[key]+"; ";
                }
            }
            else if(propType === _TYPE_Function)
            {
                prop = property();
                for(var key in prop)
                    ruleString += key+":"+prop[key]+"; ";
            }
            else
                ruleString = property+":"+value+";";
        }

        var insRuleString = selector+"{"+ruleString+"}", added = false;

        if(SINGLE_ROW_KEYS.indexOf(selector) > -1) // === "@namespace"||"@import"||"@charset"
            insRuleString = selector+" "+property;
        try
        {
            if("insertRule" in appendToElem)
                appendToElem.insertRule(insRuleString, rulePos);
            else if("appendRule" in appendToElem)
                appendToElem.appendRule(insRuleString, rulePos);
            else if("addRule" in appendToElem)
                appendToElem.addRule(selector, ruleString, rulePos);

            added = addToIndex(index, appendToElem.cssRules[rulePos], parent, selector);
        }
        catch(err)
        {
            helperError((parent ? '"' + parent.selector + '" > ' : '')
                         + "\"" + selector + "\" -> " + err, index[4]);
        }
        
        if(added) return added;
        
        return addToIndex(index, {
            csscSelector: selector,
            cssText: insRuleString,
            parent: parent||false,
            type: helperSelectorType(selector),
            placeholder: true,
            cssRules: {},
            style: {}
        }, parent, key);
    }
    function delFromIndex(index, sel, toDel)
    {
        if(index && index[sel])
        {
            var tmp = (toDel ? index[sel].content.indexOf(toDel) : -1);

            if(!toDel) delete index[sel];
            else if(tmp >= 0)
            {
                index[sel].content.splice(tmp, 1);

                if(index[sel].content.length <= 0) delete index[sel];
            }
        }
    }
    function getHandler(index, sel, getElements)
    {
        var selType = helperElemType(sel),
            _index = helperElemType(index) === _TYPE_Array ? index[0] : index; 

        if(selType === _TYPE_String)
        {
            sel = helperParseVars(sel, index[3], index[4].parse_vars_limit);
            
            if(getElements) return _index[sel] ? _index[sel].content : [];
            
            return ruleHandler(index, (_index[sel] ? _index[sel].content : []), sel);
        }
        else if(selType === _TYPE_RegExp)
        {
            var matches = [], key;

            for(key in _index)
                if(key.match(sel))
                    for(i = 0; i < _index[key].content.length; i++)
                        matches.push(_index[key].content[i]);

            if(getElements) return matches;

            return ruleHandler(index, matches, sel);
        }
        else if(selType === _TYPE_Array)
        {
            var matches = [], i, j, s;

            for(i = 0; i < sel.length; i++)
            {
                s = helperParseVars(sel[i], index[3], index[4].parse_vars_limit);
                if(_index[s]) for(j = 0; j < _index[s].content.length; j++)
                        matches.push(_index[s].content[j]);
            }

            if(getElements) return matches;

            return ruleHandler(index, matches, sel);
        }
        else if(selType === _TYPE_Null || selType === _TYPE_Undefined)
        {
            var matches = [], key;

            for(key in _index)
                for(i = 0; i < _index[key].content.length; i++)
                    matches.push(_index[key].content[i]);

            if(getElements) return matches;

            return ruleHandler(index, matches, sel);
        }
    }
    function handleSelection(index, sel, getElements, _this)
    {
        var selType = helperElemType(sel);

        if(selType === _TYPE_String || selType === _TYPE_RegExp || selType === _TYPE_Array || selType === _TYPE_Null || selType === _TYPE_Undefined) 
            return getHandler(index, sel, getElements);
        else
        {
            handleImport(index, sel);
            return _this;
        }
    }
    function handleImport(index, importObj, parent, isPreImport)
    {
        var importElem, rule, handlerObj, key, i, tmp, preImport = {};

        if(!isPreImport && !parent)
        {
            for(i = 0; i < PRE_IMPORT_KEYS.length; i++) 
                if(PRE_IMPORT_KEYS[i] in importObj)
                    preImport[PRE_IMPORT_KEYS[i]] = importObj[PRE_IMPORT_KEYS[i]];
            if(helperObjectKeysValues(preImport).length > 0) 
                handleImport(index, preImport, parent, true);
        }
        
        for(key in importObj)
        {
            if(key in preImport) continue;
            
            if(helperElemType(importObj[key]) === _TYPE_Array)
                importElem = importObj[key];
            else
                importElem = [importObj[key]];

            key = helperParseVars(key, index[3], index[4].parse_vars_limit);

            for(i = 0; i < importElem.length; i++)
            {
                if(key.charAt(0) === "@")
                {
                    if(PRE_IMPORT_KEYS.indexOf(key) > -1) // key === "@font-face"||"@namespace"||"@import"||"@charset"
                        createRule(index, key, importElem[i], null, parent);
                    else if(key.match(/^@(media|keyframes|supports)/) 
                            || (parent && (parent.type === TYPE_media
                                        || parent.type === TYPE_keyframes
                                        || parent.type === TYPE_supports)
                               )
                    )
                    {
                        handlerObj = key,
                        tmp = parent;

                        if(parent && !key.match(/^@(media|keyframes|supports)/))
                        {
                            key = helperGenSelector(parent.csscSelector, key);
                            tmp = parent.parent;
                        }

                        rule = createRule(index, key, null, null, tmp);

                        if(rule && rule.selector === rule.csscSelector)
                            handleImport(index, importElem[i], rule);
                        else
                        {
                            if(rule)
                            {
                                helperDeleteCSSRule(rule.indexElem);
                                delFromIndex(rule.parent ? rule.parent : index[0], rule.selector, rule);
                            }

                            tmp = {
                                csscSelector: key,
                                cssText: key + " {}",
                                parent: tmp || false,
                                placeholder: true,
                                type: helperSelectorType(key),
                                cssRules: {}
                            };

                            rule = addToIndex(index, tmp, tmp.parent, key);
                            handleImport(index, importElem[i], rule);
                        }

                        if(!!parent)
                        {
                            if(!parent.obj[handlerObj]) parent.obj[handlerObj] = [];
                            parent.obj[handlerObj].push(rule);
                        }
                    }
                }
                else if([_TYPE_String,_TYPE_Float,_TYPE_Integer].indexOf(helperElemType(importElem[i])) > -1)
                { 
                    tmp = parent ? parent.children : index[0];
                    if(!tmp["*"]) createRule(index, "*", null, null, parent);
                    _set(index, [tmp["*"].content[0]], key, importElem[i]);
                }
                else
                {
                    rule = createRule(index, key, null, null, parent);
                    if(rule) _set(index, [rule], importElem[i]);
                }
            }
        }
    }
    
    function _set(index, e, prop, val, pos)
    {
        if(helperElemType(pos) === _TYPE_Integer) // single Set
        {
            if(e[pos].indexElem.type === TYPE_fontFace)
            {
                helperError("@font-face rules are readonly.", index[4]);

                return;
            }
            prop = helperParseVars(prop, index[3], index[4].parse_vars_limit);

            if(e[pos].children)
                _set(index, getHandler(e[pos].children, null, true), prop, val);
            else 
            {
                var prsVal, valType = helperElemType(val), tmp;

                if(valType === _TYPE_Object || valType === _TYPE_Array)
                {
                    var isAtRule = prop.charAt(0) === "@", pObj, rule,
                        valArr = valType === _TYPE_Object ? [val] : val, i,
                        newSel = helperGenSelector(e[pos].selector, prop);

                    if(isAtRule) newSel = e[pos].parent ? helperGenSelector(e[pos].parent.selector, prop) : prop;

                    for(i = 0; i < valArr.length; i++)
                    {
                        rule = createRule(index, newSel, null, null, isAtRule ? false : e[pos].parent);

                        if(rule)
                        {
                            if(isAtRule) 
                            {
                                tmp = rule;
                                rule = createRule(index, e[pos].selector, null, null, rule);
                                
                                if(!rule) rule = tmp;
                            }

                            _set(index, [rule], valArr[i]);

                            if(isAtRule && e[pos].parent)
                            {
                                pObj = e[pos].parent;

                                if(!pObj.obj[prop] || !("push" in pObj.obj[prop]))
                                    pObj.obj[prop] = [];

                                pObj.obj[prop].push(rule.parent);
                            }

                            if(!e[pos].obj[prop] || !("push" in e[pos].obj[prop]))
                                e[pos].obj[prop] = [];
                            e[pos].obj[prop].push(rule);
                        }
                    }
                }
                else if(valType === _TYPE_Function)
                {
                    var oldVal = _get(index, [e[pos]], prop), valToSet;

                    try
                    {
                        valToSet = val(oldVal);

                        _set(index, e, prop, valToSet, pos);
                        e[pos].up[prop] = val;
                    }
                    catch(err)
                    {
                        helperError(err, index[4]);
                    }
                }
                else
                {
                    prsVal = helperParseValue(val, prop, index[4].parse_unit_default);

                    e[pos].indexElem.style[prop] = prsVal;
                    e[pos].obj[prop] = prsVal;
                }
            }
        }
        else // multi Set
        {
            var i, propLen, key, props,
                propType = helperElemType(prop);

            if(propType === _TYPE_Object)        propLen = helperObjectKeysValues(prop).length;
            else if(propType === _TYPE_Function) props = prop();

            if(propType === _TYPE_Array || (propType === _TYPE_Function && helperElemType(props) === _TYPE_Array))
            {
                var prp = (propType === _TYPE_Array ? prop : props);
                for(i = 0; i < prp.length; i++)
                {
                    if(e.length > i) _set(index, [e[i]], prp[i]);
                    else             break;
                }
            }
            else for(i = 0; i < e.length; i++)
            {
                if(propType === _TYPE_Object && propLen > 0) 
                    for(key in prop) _set(index, e, key, prop[key], i);
                else if(propType === _TYPE_Function)
                {
                    for(key in props)
                        _set(index, e, key, props[key], i);

                    //add to updatable
                    e[i].uo = prop;
                }
                else _set(index, e, prop, val, i);
            }
        }
        return;
    }
    function _get(index, e, prop, returnAllProps)
    {
        if(!prop) return _export(index, e, TYPE_EXPORT_obj);

        var arrToRet = [], propToRet = "", tmp, i;

        for(i = 0; i < e.length; i++)
        {
            tmp = "";

            if(e[i].obj[prop]) 
            {
                tmp = e[i].obj[prop];

                if(helperElemType(tmp) === _TYPE_Array)
                    tmp = _export(index, tmp, TYPE_EXPORT_obj);
            }

            if(!tmp || tmp === "")
                tmp = e[i].indexElem.style[prop];
            if(!tmp || tmp === "")
                tmp = helperFindPropInCssText(e[i].indexElem.cssText, prop);

            if(tmp)
            {
                propToRet = tmp;

                if(returnAllProps) arrToRet.push(propToRet);
            }
        }
        return returnAllProps ? arrToRet : propToRet;
    }
    function _export(index, e, type, ignore)
    {
        if(helperElemType(type) !== _TYPE_Integer)
            type = TYPE_EXPORT[type] || TYPE_EXPORT_obj;
        
        var exportObj = {}, obj, i, j, key, tmp, _type = type;

        if(type === TYPE_EXPORT_css || type === TYPE_EXPORT_min)
            type = TYPE_EXPORT_arr;

        if(!ignore) ignore = [];

        for(i = 0; i < e.length; i++)
        {
            if(ignore.indexOf(e[i]) >= 0) continue; 

            if(e[i].type === TYPE_namespace 
            || e[i].type === TYPE_import 
            || e[i].type === TYPE_charset)
                obj = e[i].obj;
            else
            {
                obj = helperObjectAssign({}, e[i].obj);

                for(key in e[i].obj)
                {
                    if(helperElemType(e[i].obj[key]) === _TYPE_Array)
                    {
                        if(type === TYPE_EXPORT_notMDObject || type === TYPE_EXPORT_arr)
                        {
                            obj[key] = null;
                            delete obj[key];
                            continue;
                        }

                        obj[key] = [];

                        for(j = 0; j < e[i].obj[key].length; j++)
                        {
                            if(ignore.indexOf(e[i].obj[key][j]) >= 0) continue; 

                            tmp = _export(index, [e[i].obj[key][j]], type, ignore)[e[i].obj[key][j].selector];

                            ignore.push(e[i].obj[key][j]);

                            if(!tmp || helperObjectKeysValues(tmp).length <= 0) continue;

                            obj[key][j] = tmp;
                        }

                        if(obj[key].length === 0) delete obj[key];
                        else if(obj[key].length === 1) obj[key] = obj[key][0];
                    }
                }
            }

            if(e[i].children)
            {
                obj = helperObjectAssign(_export(index, getHandler(e[i].children, null, true), type, ignore), obj);
            }

            if(helperObjectKeysValues(obj).length < 1) continue;

            if(type === TYPE_EXPORT_arr)
            {
                exportObj[e[i].p] = {};
                exportObj[e[i].p][e[i].selector] = obj;
            }
            else if(exportObj[e[i].selector])
            {
                if(helperElemType(exportObj[e[i].selector]) !== _TYPE_Array)
                    exportObj[e[i].selector] = [exportObj[e[i].selector]];

                exportObj[e[i].selector].push(obj);
            }
            else exportObj[e[i].selector] = obj;

            ignore.push(e[i]);
        }

        if(type === TYPE_EXPORT_arr) 
        {   
            exportObj = helperObjectKeysValues(exportObj, !0);
            return type === _type ? exportObj : helperCssTextFromObj(exportObj, _type===TYPE_EXPORT_min, index[4].parse_tab_len);
        }

        var sortExpObj = {};
        for(i = 0; i < PRE_IMPORT_KEYS.length; i++) if(exportObj[PRE_IMPORT_KEYS[i]])
                sortExpObj[PRE_IMPORT_KEYS[i]] = exportObj[PRE_IMPORT_KEYS[i]];
        tmp = helperObjectKeysValues(sortExpObj).length > 0;
        if(tmp) for(i in exportObj) if(!sortExpObj[i])
                    sortExpObj[i] = exportObj[i];
        return tmp ? sortExpObj : exportObj;
    }
    function _update(index, e)
    {
        var i, tmp, key;

        for(i = 0; i < e.length; i++)
        {
            if(e[i].uo !== false)
            {
                tmp = e[i].uo();
                for(key in tmp) _set(index, e, key, tmp[key], i);
            }

            if(e[i].children)
                _update(index, getHandler(e[i].children, null, true));
            else if(e[i].indexElem.style) for(key in e[i].indexElem.style._update)
                    _set(index, e, key, e[i].up[key](), i);
        }
        return;
    }
    function _delete(index, e, prop, _this)
    {
        var isUndef = [_TYPE_Null,_TYPE_Undefined].indexOf(helperElemType(prop)) > -1, i, _e = [];

        for(i = 0; i < e.length; i++)
        {
            if(e[i].children) _delete(index, getHandler(e[i].children, null, true), prop, _this);
            
            if(isUndef)
            {
                helperDeleteCSSRule(e[i].indexElem);
                delFromIndex(e[i].parent ? e[i].parent : index[0], e[i].selector, e[i]);
            }
            else
            {
                _e.push(e[i]);
                e[i].indexElem.style[prop] = "";
                
                if(e[i].obj[prop])
                {
                    if(helperElemType(e[i].obj[prop]) === _TYPE_Array)
                        _delete(index, e[i].obj[prop]);
                    delete e[i].obj[prop];
                }
            }
        }
        if(_this) _this.e = _getE(index, _e);
    }
    function _pos(index, e, p, sel, parents)
    {
        if(p < 0) p += e.length;
        if(e[p]) return ruleHandler(index, [e[p]], sel, false, e[p].parent ? e[p].parent : false);
        return ruleHandler(index, [], sel, false, parents);
    }
    function _getE(index, e)
    {
        var _e = [];
        for(var i = 0; i < e.length; i++) if(e[i].indexElem)
                _e.push(e[i].indexElem.placeholder ? _export(index, [e[i]], TYPE_EXPORT_obj) : e[i].indexElem);
        return _e;
    }
    function _selector(e, sel)
    {
        return e.length === 1 ? e[0].selector : sel;
    }
    function ruleHandler(index, els, sel, fromHas, parents)
    {
        var handler;
        
        function createRuleIfNotExists()
        {
            if(els.length < 1 && !fromHas && helperElemType(sel) === _TYPE_String)
            {
                var rule, contentElems = [], i, _p = parents ? parents : [null];

                for(i = 0; i < _p.length; i++)
                {
                    rule = createRule(index, sel, null, null, _p[i]);
                    if(rule) contentElems.push(rule);
                }

                els = contentElems;
                handler.e = _getE(index, els);
                handler.selector = _selector(els, sel);
            }
        }
        handler = function(sel)
        {
            var i, j, elArr = [], tmp;
            createRuleIfNotExists();

            for(i = 0; i < els.length; i++)
                if(els[i].children)
                {
                    tmp = handleSelection(els[i].children, sel, true);
                    for(j = 0; j < tmp.length; j++) elArr.push(tmp[j]);
                }
            return ruleHandler(index, elArr, sel, null, els);
        };
        handler.e = _getE(index, els);
        handler.selector = _selector(els, sel);
        
        helperObjectDefineReadOnlyPropertys(handler, {
            'set':    function(prop, val){ createRuleIfNotExists(); _set(index, els, prop, val); return handler; },
            'get':    function(prop, retAP){ return _get(index, els, prop, retAP); },
            'update': function(){ _update(index, els); return handler; },
            'delete': function(prop){ _delete(index, els, prop, handler); return handler; },
            'export': function(type){ return _export(index, els, type); },
            'parse':  function(min){ return _export(index, els, !min ? TYPE_EXPORT_css : TYPE_EXPORT_min); },
            'pos':    function(p) { return _pos(index, els, p, sel, parents); },
            'first':  function(){ return _pos(index, els, 0, sel, parents); },
            'last':   function(){ return _pos(index, els, -1, sel, parents); }
        });
        return handler;
    }
    function __confVars(cnfVars, setCnfVars, val, defRet)
    {
        var cnfType = helperElemType(setCnfVars);
        
        if(cnfType === _TYPE_Object)      cnfVars = helperObjectAssign(cnfVars, setCnfVars);
        else if(cnfType === _TYPE_String) 
        {
            if(helperElemType(val) === _TYPE_Undefined) return cnfVars[setCnfVars];
            else                                        cnfVars[setCnfVars] = val;
        }
        else if(cnfType === _TYPE_Array)
        {
            var ret = {}, i;
            for(i = 0; i < setCnfVars.length; i++)
                ret[setCnfVars[i]] = cnfVars[setCnfVars[i]];
            return ret;
        }
        else if(cnfType === _TYPE_Undefined) return cnfVars;
        return defRet;
    }
    function getController()
    {
        var index = [{},!1,0,{},{}],

        cntr = function(sel)
        {
            try
            {
                return handleSelection(index, sel, false, cntr);
            }
            catch (err)
            {
                helperError(err, index[4]);
            }
        };
        helperObjectDefineReadOnlyPropertys(cntr, {
            version: VERSION,
            //core functions
            'init':   function(toInit){ initElements(index, toInit); return cntr; },
            'import': function(importObj){ handleImport(index, importObj); return cntr; },
            'export': function(type){ return handleSelection(index).export(type); },
            'parse':  function(min){ return handleSelection(index).parse(min); },
            'update': function(sel){ handleSelection(index, sel).update(); return cntr; },
            'new':    function(){ return getController(); },
            //conf & vars
            conf:       function(cnf, val){ return __confVars(index[4], cnf, val, cntr); },
            vars:       function(vars, val){ return __confVars(index[3], vars, val, cntr); },
            //helper functions
            parseVars:  function(txt, vars){ return helperParseVars(txt, vars?helperObjectAssign({}, index[3], vars):index[3], index[4].parse_vars_limit); },
            objFromCss: function(css){ return helperObjFromCssText(css); },
            cssFromObj: function(obj, min, tabLen){ return helperCssTextFromObj(obj, min, tabLen); },
            //config & defs
            _conf:       CONF_DEFAULT,
            type:        TYPE,
            type_export: TYPE_EXPORT_STR,
            messages:    MESSAGES
        });
        cntr.conf(CONF_DEFAULT);
        
        return cntr;
    }
    return getController();
})();
