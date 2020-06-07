(function (factory) {
    if(typeof exports === "object" && typeof module === "object")
        module.exports = factory();
    else if(typeof define === "function" && define.amd)
        define([], factory);
    else if(typeof exports === "object")
        exports.she = factory();
    else
        window.she = factory();
  })(function () {
    "use strict";
  
    const dev = {
        tree: [],
        commands: {},
        createTree: undefined,
        enumerableTree: undefined,
        getSuperiorElement: undefined,
        getSuperiorNode: undefined,
        updateSuperiorVRElement: undefined,
        isNull: undefined,
        parseHump: undefined,
        parseStyleObject: undefined
    };
  
    dev.commands["she"] = function (VRElement, value) {
        if ( typeof value === "function" && value(VRElement.element) === false ) {
            VRElement.element.removeAttribute("she");
            dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
        }
    };

    dev.commands["she-content"] = function (VRElement, value) {
        if (Array.isArray(value)) {
            VRElement.element.textContent = "";
            VRElement.children = [];
            let isUpdateSuperiorVRElement = false;
            const fragment = document.createDocumentFragment();
            const renderer = function (parent, value) {
                let i = 0;
                while ( !dev.isNull(value[i]) ) {
                    const elementMap = value[i];
                    const element = document.createElement(elementMap[0]);
  
                    if ( !dev.isNull(elementMap[1]) ) {
                        for (const attribute in elementMap[1]) {
                            const attributeName = dev.parseHump(attribute);
                            if (isUpdateSuperiorVRElement === false && attributeName.indexOf("she") !== -1) {
                                isUpdateSuperiorVRElement = true;
                            }
                            element.setAttribute(attributeName, elementMap[1][attribute]);
                        }
                    }
  
                    if ( !dev.isNull(elementMap[2]) ) {
                        if (typeof elementMap[2][0] === "string") {
                            element.textContent = elementMap[2][0];
                        } else {
                            renderer(element, elementMap[2]);
                        }
                    }
  
                    parent.appendChild(element);
  
                    i++;
                }
            };
  
            renderer(fragment, value);
            VRElement.element.appendChild(fragment);
            if (isUpdateSuperiorVRElement) {
                dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
            }
        } else if (typeof value !== "function") {
            if (dev.isNull(value)) {
                VRElement.element.textContent = "";
            } else {
                VRElement.element.textContent = value;
            }
            VRElement.children = [];
        }
    };

    dev.commands["she-attribute"] = function (VRElement, value) {
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            let isUpdateSuperiorVRElement = false;

            for (const key in value) {
                const attributeName = dev.parseHump(key);

                if(isUpdateSuperiorVRElement === false && attributeName.indexOf("she") !== -1){
                    isUpdateSuperiorVRElement = true;
                }

                switch(value[key]){
                    case true:
                        VRElement.element[attributeName] = true;
                        break;
                    case false:
                        VRElement.element[attributeName] = false;
                        VRElement.element.removeAttribute(attributeName);
                        break;
                    default:
                        VRElement.element.setAttribute(attributeName, value[key]);
                }
            }

            if(isUpdateSuperiorVRElement){
                dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
            }
        }
    };

    dev.commands["she-change"] = function (VRElement, value) {
        if (Array.isArray(value)) {
            const VRElementElement = VRElement.element;
            let oldStyleString = VRElementElement.getAttribute("style");
            if ( !dev.isNull(oldStyleString) ) {
                let i = 0;
  
                if ( VRElementElement.hasAttribute("change-index") ) {
                    i = parseInt(VRElementElement.getAttribute("change-index"));
                }
  
                const valueLength = value.length;
                while (i < valueLength) {
                    if (dev.parseStyleObject(value[i]) === oldStyleString) {
                        i++;
                        if (i === valueLength) {
                            i = 0;
                        }
                        VRElementElement.setAttribute("style", dev.parseStyleObject(value[i]));
                        VRElementElement.setAttribute("change-index", i);
                        return;
                    }
  
                    i++;
                }
  
                VRElementElement.setAttribute("style", dev.parseStyleObject(value[0]));
                VRElementElement.setAttribute("change-index", 0);
            } else {
                VRElementElement.setAttribute("style", dev.parseStyleObject(value[0]));
                VRElementElement.setAttribute("change-index", 0);
            }
        }
    };
          
    dev.commands["she-for"] = function (VRElement, forData, name) {
        if (forData !== null && typeof forData === "object") {
            const superiorElement = dev.getSuperiorElement(VRElement);
            if (superiorElement !== null) {
                const VRElementElement = VRElement.element;
                const VRElementElementParentNode = VRElementElement.parentNode;
                const fragment = document.createDocumentFragment();
                const forCookie = VRElementElement.getAttribute("she-for").replace(new RegExp("\\s+","g"), "").split(";");
                const forCookie_0 = dev.parseHump(forCookie[0]);
                const forCookie_1 = dev.parseHump(forCookie[1]);
                const forCookie_2 = dev.parseHump(forCookie[2]);
  
                while(
                    VRElementElement.nextElementSibling !== null
                    &&
                    VRElementElement.nextElementSibling.hasAttribute("she-for")
                    &&
                    VRElementElement.nextElementSibling.getAttribute("she-for").indexOf(name) !== -1
                ){
                    VRElementElementParentNode.removeChild(VRElementElement.nextElementSibling);
                }
  
                for (const key in forData) {
                    const cloneElement = VRElementElement.cloneNode(true);
                    cloneElement.setAttribute(forCookie_2, key);
                    fragment.appendChild(cloneElement);
                }
  
                VRElementElementParentNode.replaceChild(fragment, VRElementElement);
                dev.updateSuperiorVRElement(superiorElement);
                const superiorNode = dev.getSuperiorNode(superiorElement);

                const getData = function (VRElementElement, name) {
                    if (VRElementElement.hasAttribute("she-for") && VRElementElement.getAttribute("she-for").indexOf(forCookie_0) !== -1) {
                        const index = VRElementElement.getAttribute( forCookie_2 );
                        if (name === forCookie_1) {
                            return forData[index];
                        } else {
                            return index;
                        }
                    } else {
                        let element = VRElementElement.parentNode;
                        while (element.nodeName !== "BODY") {
                            if (element.hasAttribute("she-for")) {
                                const index = element.getAttribute( forCookie_2 );
                                if (name === forCookie_1) {
                                    return forData[index];
                                } else {
                                    return index;
                                }
                            }
                            element = element.parentNode;
                        }
                    }
                };
  
                dev.enumerableTree(superiorNode, function (VRElement) {
                    const VRElementElement = VRElement.element;
                    const VRElementNames = VRElement.names;
                    const VRElementCommands = VRElement.commands;
                    const VRElementNamesLength = VRElementNames.length;
                    let i = 0;
                    while (i < VRElementNamesLength) {
                        const temporaryName = VRElementNames[i];
                        const command = VRElementCommands[i];
                        
                        if (dev.parseHump(temporaryName).search( new RegExp(["^", forCookie_1, "$|^", forCookie_1, "[\\.\\[]|\\{(.+?):", forCookie_1, "(.*?)\\}"].join("")) ) !== -1) {
                            const item = getData(VRElementElement, forCookie_1);
                            if (!dev.isNull(item)) {
                                if (temporaryName.indexOf("{") === -1) {
                                    dev.commands[command](VRElement, eval( temporaryName.replace(forCookie[1], "item") ), temporaryName);
                                } else {
                                    const temporaryArray = temporaryName.replace(forCookie[1], "item").replace(new RegExp("\\{|\\}|\\s+", "g"), "").split(",");
                                    const temporaryArrayLength = temporaryArray.length;
                                    const value = {};
                                    let j = 0;
                                    while (j < temporaryArrayLength) {
                                        const keyvalue = temporaryArray[j].split(":");
                                        value[keyvalue[0]] = eval( keyvalue[1] );
                                        j++;
                                    }
                                    dev.commands[command](VRElement, value, temporaryName);
                                } 
                            }
                        }
                        if (temporaryName === forCookie_2) {
                            dev.commands[command](VRElement, getData(VRElementElement, forCookie_2), temporaryName);
                        }
  
                        i++;
                    }
                });
  
            }
        }
    };
  
    dev.createTree = function (elements, tree) {
        let i = 0;
        const elementsLength = elements.length;
        while (i < elementsLength) {
            let isHasCommand = false,
                VRElementNames,
                VRElementCommands;
            const element = elements[i],
                commands = dev.commands;
            for (const command in commands) {
                if (element.hasAttribute(command)) {
                    if (!isHasCommand) {
                        tree.push({
                            names: [],
                            element,
                            commands: [],
                            children: []
                        });
                        const VRElement = tree[tree.length - 1];
                        VRElementNames = VRElement.names;
                        VRElementCommands = VRElement.commands;
                        if (element.children.length > 0) {
                            dev.createTree(element.children, VRElement.children);
                        }
                        isHasCommand = true;
                    }
                    
                    VRElementNames.push(element.getAttribute(command).replace(new RegExp("\\s+","g"), "").split(";")[0]);
                    VRElementCommands.push(command);
                }
            }
  
            if (!isHasCommand && element.children.length > 0) {
                dev.createTree(element.children, tree);
            }
  
            i++;
        }
    };
  
    dev.enumerableTree = function (tree, callback) {
        const enumerable = function (tree) {
            let i = 0;
            const treeLength = tree.length;
            while ( i <  treeLength){
                if (callback(tree[i]) === false) {
                    return;
                }
                if (tree[i].children.length > 0) {
                    enumerable(tree[i].children);
                }
                i++;
            }
        };
        enumerable(tree);
    };
  
    dev.getSuperiorElement = function (VRElement) {
        let element = VRElement.element.parentNode;
        if ( element !== null ) {
            const commands = dev.commands
            while (element.nodeName !== "BODY") {
                for (const command in commands) {
                    if (element.hasAttribute(command)) {
                        return element;
                    }
                }
                element = element.parentNode;
            }
            return element;
        } else {
            return null;
        }
    };
  
    dev.getSuperiorNode = function (superiorElement) {
        if (superiorElement === document.body) {
            return dev.tree;
        } else {
            let superiorNode;
            dev.enumerableTree(dev.tree, function (VRElement) {
                if (VRElement.element === superiorElement) {
                    superiorNode = VRElement.children;
                    return false;
                }
            });
            return superiorNode;
        }
    };
  
    dev.updateSuperiorVRElement = function (superiorElement) {
        if (superiorElement === document.body) {
            dev.tree = [];
            dev.createTree(document.body.children, dev.tree);
        } else {
            dev.enumerableTree(dev.tree, function (VRElement) {
                if (VRElement.element === superiorElement) {
                    VRElement.children = [];
                    dev.createTree(VRElement.element.children, VRElement.children);
                    return false;
                }
            });
        }
    };
  
    dev.isNull = function (value) {
        switch(value){
            case undefined: return true;
            case null: return true;
            default: return false;
        }
    };
  
    dev.parseHump = function (value) {
        return value.replace(new RegExp("\\s+", "g"), "").replace(new RegExp("[A-Z]", "g"), function (Keyword) {
            return ["-", Keyword.toLowerCase()].join("");
        });
    };
  
    dev.parseStyleObject = function (styleObject) {
        const temporary = [];
        for (const key in styleObject) {
            temporary.push(dev.parseHump(key));
            temporary.push(":");
            temporary.push(styleObject[key]);
            temporary.push(";");
        }
        return temporary.join("");
    };
    
    const she = function (name) {
        const names = name.trim().split(new RegExp("\\s+"));
        const targetName = names[names.length -1];
  
        return function (parameter) {
            let j = 0;
  
            const enumerable = function (VRElementName, tree, parameter) {
                let i = 0;
                const treeLength = tree.length;
                while (i < treeLength) {
                    const VRElement = tree[i];
                    if (targetName === names[j]) {
                        let k = 0;
                        const VRElementNames = VRElement.names;
                        const VRElementCommands = VRElement.commands;
                        const count = VRElementNames.length;
                        while (k < count) {
                            if (targetName === VRElementNames[k]) {
                                dev.commands[VRElementCommands[k]](VRElement, parameter, targetName);
                            }
                            k++;
                        }
                    }
  
                    if (VRElement.children.length > 0) {
                        let k = 0;
                        const VRElementNames = VRElement.names;
                        const count = VRElementNames.length;
                        while (k < count) {
                            if (VRElementName === VRElementNames[k]) {
                                j++;
                                break;
                            }
                            k++;
                        }
                        enumerable(names[j], VRElement.children, parameter);
                        k = 0;
                        while (k < count) {
                            if (VRElementName === VRElementNames[k]) {
                                j--;
                                break;
                            }
                            k++;
                        }
                    }
                    i++;
                }
  
            };
            enumerable(names[j], dev.tree, parameter);
            return she;
        };
    };
  
    she.style = function (styleArray) {
        let i = 0;
        const temporary = [];
        const styleArrayLength = styleArray.length;
        while (i < styleArrayLength) {
            temporary.push(styleArray[i][0]);
            temporary.push("{");
            temporary.push(dev.parseStyleObject(styleArray[i][1]));
            temporary.push("}");
            i++;
        }
        const styleString = temporary.join("");
  
        i = 0;
        const headTag = document.head;
        const headChildren = headTag.children;
        const headChildrenLength = headChildren.length;
        while (i < headChildrenLength) {
            if (headChildren[i].nodeName === "STYLE") {
                const styleTag = headChildren[i];
                const styleTagContent = styleTag.textContent;
                const regexp = styleString.replace(new RegExp(":(.+?);|\\.|\\[|\\]|\\{|\\}|\\*|\\+|\\||\\(|\\)|\\?|\\^|\\$", "g"), function(Keyword){
                    switch (Keyword) {
                        case ".": return "\\.";
                        case "[": return "\\[";
                        case "]": return "\\]";
                        case "{": return "\\{";
                        case "}": return "\\}";
                        case "*": return "\\*";
                        case "+": return "\\+";
                        case "|": return "\\|";
                        case "(": return "\\(";
                        case ")": return "\\)";
                        case "?": return "\\?";
                        case "^": return "\\^";
                        case "$": return "\\$";
                        default: return ":(.+?);";
                    }
                });
                if (styleTagContent.search(new RegExp(regexp)) === -1) {
                    styleTag.textContent = [styleTagContent, styleString].join("");
                } else {
                    styleTag.textContent = styleTagContent.replace(new RegExp(regexp), styleString);
                }
                return;
            }
            i++;
        }
  
        const styleTag = document.createElement("style");
        styleTag.textContent = styleString;
        headTag.appendChild(styleTag);
    };
  
    dev.createTree(document.body.children, dev.tree);
  
    return she;
  });
