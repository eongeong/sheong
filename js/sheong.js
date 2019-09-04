(function (factory) {
  if(typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if(typeof define === "function" && define.amd)
    define([], factory);
  else if(typeof exports === "object")
    exports.sheong = exports.she = factory();
  else
    window.sheong = window.she = factory();
})(function () {
  "use strict";

  const dev = {
    tree: [],
    commands: {},
    createTree: undefined,
    updateTree: undefined,
    enumerableTree: undefined,
    getSuperiorElement: undefined,
    updateSuperiorVRElement: undefined,
    renderGuard: undefined,
    isWatch: true,
    notNull: undefined,
    parseHump: undefined,
    isUpdateTree: true,
    parseStyleObject: undefined
  };

  dev.commands["she"] = function (VRElement, value) {
    if( typeof value === "function" && value(VRElement.element) === false ){
      dev.renderGuard(function () {
        VRElement.element.removeAttribute("she");
        dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
      });
    }
  };

  dev.commands["she-show"] = function (VRElement, value) {
    if(!dev.notNull(value)){
      value = "";
    }
    const element = VRElement.element;
    if(element.nodeName === "INPUT"){
      element.value = value;
    }else{
      dev.renderGuard(function () {
        if(value.search(new RegExp("</(.+?)>")) === -1){
          element.textContent = value.toString();
          VRElement.children = [];          
        }else{
          element.innerHTML = value.toString();
          VRElement.children = [];
          dev.createTree(element.children, VRElement.children);
        }  
      });
    }
  };

  dev.commands["she-style"] = function (VRElement, value) {
    if (typeof value === "object" && !Array.isArray(value)) {
      VRElement.element.setAttribute("style", dev.parseStyleObject(value));
    }
  };

  dev.commands["she-attribute"] = function (VRElement, value) {
    if (typeof value === "object" && !Array.isArray(value)) {
      dev.renderGuard(function () {
        let isUpdateSuperiorVRElement = false;

        for (const key in value) {
          const attribute = dev.parseHump(key);

          if(isUpdateSuperiorVRElement === false && attribute.indexOf("she") !== -1){
            isUpdateSuperiorVRElement = true;
          }
          
          switch(value[key]){
            case "":
              VRElement.element.value = "";
              break;
            case false:
              VRElement.element.removeAttribute(attribute);
              break;
            default:
              VRElement.element.setAttribute(attribute, value[key]);
          }

        }

        if(isUpdateSuperiorVRElement){
          dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
        }
      });
    }
  };

  dev.commands["she-for"] = function (VRElement, value, name) {
    if (typeof value === "object") {
      dev.renderGuard(function () {
        const superiorElement = dev.getSuperiorElement(VRElement);
        if ( superiorElement !== null ) {
          const VRElementElement = VRElement.element;          
          const fragment = document.createDocumentFragment();
          const forCookie = VRElementElement.getAttribute("she-for").split(":");
          forCookie[1] = dev.parseHump(forCookie[1]);
          forCookie[2] = dev.parseHump(forCookie[2]);

          while(
            VRElementElement.nextElementSibling !== null
            &&
            VRElementElement.nextElementSibling.hasAttribute("she-for")
            &&
            VRElementElement.nextElementSibling.getAttribute("she-for").indexOf(name) !== -1
          ){
            VRElementElement.parentNode.removeChild(VRElementElement.nextElementSibling);
          }

          for (const key in value) {
            const element = VRElementElement.cloneNode(true);
            element.setAttribute(forCookie[1], JSON.stringify(value[key]));
            element.setAttribute(forCookie[2], key);
            fragment.appendChild(element);
          }
          VRElementElement.parentNode.replaceChild(fragment, VRElementElement);
          dev.updateSuperiorVRElement(superiorElement);          
          dev.enumerableTree(dev.tree, function (VRElement) {
            const VRElementElement = VRElement.element;
            const VRElementNames = VRElement.names;
            const VRElementCommands = VRElement.commands;
            let i = 0;
            const count = VRElementNames.length;
            while (i < count) {

              const getData = function (name) {
                if (VRElementElement.hasAttribute(name)) {
                  if (name === forCookie[1]) {
                    return JSON.parse(VRElementElement.getAttribute( forCookie[1] ));
                  } else {
                    return VRElementElement.getAttribute( forCookie[2] );
                  }
                } else {
                  let element = VRElementElement.parentNode;
                  while (element.tagName !== "BODY") {
                    if (element.hasAttribute("she-for")) {
                      if (name === forCookie[1]) {
                        return JSON.parse(element.getAttribute( forCookie[1] ));
                      } else {
                        return element.getAttribute( forCookie[2] );
                      }
                    }
                    element = element.parentNode;
                  }
                }
              };

              const temporaryName = dev.parseHump(VRElementNames[i]);
              if (temporaryName.search( new RegExp("^" + forCookie[1] + "$|^" + forCookie[1] + "[\\.\\[]", "g") ) !== -1) {
                const item = getData(forCookie[1]);
                if( dev.notNull(item) ){
                  dev.commands[VRElementCommands[i]](VRElement, eval( "item" + temporaryName.replace(forCookie[1], "") ), VRElementNames[i]);
                }
              }
              if (temporaryName === forCookie[2]) {
                dev.commands[VRElementCommands[i]](VRElement, getData(forCookie[2]), VRElementNames[i]);
              }

              i++;
            }
          });
        }
      });
    }
  };

  dev.commands["she-render"] = function (VRElement, value){
      if(Array.isArray(value)){
          dev.renderGuard(function () {
              VRElement.element.textContent = "";
              VRElement.children = [];
              let isUpdateSuperiorVRElement = false;
              const fragment = document.createDocumentFragment();

              const renderer = function(parent, value){

                let i = 0;
                while( dev.notNull(value[i]) ){
                  const element = document.createElement(value[i][0]);

                  if( dev.notNull(value[i][1]) ){
                    for(const attribute in value[i][1]){
                      const attributeName = dev.parseHump(attribute);

                      if(isUpdateSuperiorVRElement === false && attributeName.indexOf("she") !== -1){
                          isUpdateSuperiorVRElement = true;
                      }

                      element.setAttribute(attributeName, value[i][1][attribute]);
                    }
                  }

                  if( dev.notNull(value[i][2]) ){
                    if(typeof value[i][2][0] === "string"){
                      element.textContent = value[i][2][0];
                    }else{
                      renderer(element, value[i][2]);
                    }
                  }

                  parent.appendChild(element);

                  i++;
                }
              }
              renderer(fragment, value);

              VRElement.element.appendChild(fragment);

              if(isUpdateSuperiorVRElement){
                  dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
              }
          });
      }
  };

  dev.commands["she-change"] = function(VRElement, value){
    if(Array.isArray(value)){
      const VRElementElement = VRElement.element;
      let oldStyleString = VRElementElement.getAttribute("style");  
      if( dev.notNull(oldStyleString) ){
        let i = 0;

        if( VRElementElement.hasAttribute("change-index") ){
          i = parseInt(VRElementElement.getAttribute("change-index"));
        }else{
          i = 0;
        }

        const count = value.length;
        while( i < count ){
          if(dev.parseStyleObject(value[i]) === oldStyleString){
            i++;
            if(i === count ){
              i = 0;
            }
            dev.commands["she-style"](VRElement, value[i]);
            VRElementElement.setAttribute("change-index", i);
            return;
          }

          i++;
        }

        dev.commands["she-style"](VRElement, value[0]);
        VRElementElement.setAttribute("change-index", 0);        
      }else{
        dev.commands["she-style"](VRElement, value[0]);
        VRElementElement.setAttribute("change-index", 0);
      }
    }
  };

  dev.createTree = function (elements, tree) {
    let i = 0;
    const count = elements.length;
    while (i < count) {
      let isHasCommand = false,
        j = 0,
        isHasOneCommand = false;
      for (const command in dev.commands) {
        if (elements[i].hasAttribute(command)) {
          if (!isHasCommand) {
            isHasCommand = true;
          }

          if (!isHasOneCommand) {
            tree.push({
              names: [],
              element: elements[i],
              commands: [],
              children: []
            });
            if (elements[i].children.length > 0) {
              dev.createTree(elements[i].children, tree[tree.length - 1].children);
            }
            isHasOneCommand = true;
          }

          const presentNode = tree[tree.length - 1];
          presentNode.names[j] = elements[i].getAttribute(command).split(":")[0];          
          presentNode.commands[j] = command;

          j++;
        }
      }

      if (!isHasCommand && elements[i].children.length > 0) {
        dev.createTree(elements[i].children, tree);
      }
      i++;
    }
  };

  dev.updateTree = function () {
    if (dev.isWatch && dev.isUpdateTree) {
      dev.isUpdateTree = false;
      setTimeout(function(){
        dev.isUpdateTree = true;
        const tree = [];
        dev.createTree(document.body.children, tree);
        dev.tree = tree;
      },1000);
    }
  };

  dev.enumerableTree = function (tree, callback) {
    const enumerable = function (tree) {
      let i = 0;
      const count = tree.length;
      while (i < count) {
        if (callback(tree[i]) === true) {
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
      while (element.tagName !== "BODY") {
        for (const command in dev.commands) {
          if (element.hasAttribute(command)) {
            return element;
          }
        }
        element = element.parentNode;
      }
      return element;
    }
    return null;
  };

  dev.updateSuperiorVRElement = function (superiorElement) {
    if (superiorElement === document.body) {
      dev.tree = [];
      dev.createTree(document.body.children, dev.tree);
      return;
    }
    dev.enumerableTree(dev.tree, function (VRElement) {
      if (VRElement.element === superiorElement) {
        VRElement.children = [];
        dev.createTree(VRElement.element.children, VRElement.children);
        return true;
      }
    });
  };

  dev.renderGuard = function (callback) {
    dev.isWatch = false;
    callback();
    dev.isWatch = true;
  };

  dev.notNull = function(value){
    switch(value){
      case undefined: return false;
      case null: return false;
      case "": return false;
      default: return true;
    }
  };

  dev.parseHump = function(value){
    return value.replace(new RegExp("[A-Z]", "g"), function (Keyword) {
      return "-" + Keyword.toLowerCase();
    });
  };

  dev.parseStyleObject = function(styleObject){
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
    const targetName = names[names.length - 1];

    return function (parameter) {
      let j = 0;

      const enumerable = function (VRElementName, tree) {
        let i = 0;
        const count = tree.length;
        while (i < count) {
          if (targetName === names[j]) {
            let k = 0;
            const number = tree[i].names.length;
            while (k < number) {
              if (targetName === tree[i].names[k]) {
                dev.commands[tree[i].commands[k]](tree[i], parameter, tree[i].names[k]);
              }
              k++;
            }
          }

          if (tree[i].children.length > 0) {
            let k = 0;
            while (k < tree[i].names.length) {
              if (VRElementName === tree[i].names[k]) {
                j++;
                break;
              }
              k++;
            }
            enumerable(names[j], tree[i].children);
            k = 0;
            while (k < tree[i].names.length) {
              if (VRElementName === tree[i].names[k]) {
                j--;
                break;
              }
              k++;
            }
          }

          i++;
        }
      };

      enumerable(names[j], dev.tree);
      return she;
    };
  };

  dev.createTree(document.body.children, dev.tree);
  document.addEventListener("DOMNodeInserted", dev.updateTree);
  document.addEventListener("DOMNodeRemoved", dev.updateTree);

  she.style = function(styleArray){
    if(Array.isArray(styleArray)){

      const temporary = [];
      let i = 0, count = styleArray.length;
      while(i < count){
          temporary.push(styleArray[i][0]);
          temporary.push("{");
          temporary.push(dev.parseStyleObject(styleArray[i][1]));
          temporary.push("}");
          i++;
      }

      const styleString = temporary.join("");

      i = 0;
      const headChildren = document.head.children;
      count = headChildren.length;
      while(i < count){
        if(headChildren[i].nodeName === "STYLE"){
            const regexp = styleString.replace(new RegExp(":(.+?);|\\.|\\[|\\]|\\{|\\}|\\*|\\+", "g"), function(Keyword){
              switch(Keyword){
                case ".": return "\\.";
                case "[": return "\\[";
                case "]": return "\\]";
                case "{": return "\\{";
                case "}": return "\\}";
                case "*": return "\\*";
                case "+": return "\\+";
              }
              const temporary = [];
              temporary.push(":");
              temporary.push("(.+?)");
              temporary.push(";");
              return temporary.join("");
            });
            if(headChildren[i].innerHTML.search(new RegExp(regexp)) === -1){
              headChildren[i].innerHTML = [headChildren[i].innerHTML, styleString].join("");
            }else{
              headChildren[i].innerHTML = headChildren[i].innerHTML.replace(new RegExp(regexp), styleString);
            }
            return;
        }
        i++;
      }

      const style = document.createElement("style");
      style.innerHTML = styleString;
      document.head.appendChild(style);
    }
  };

  she.router = function(callback){
    location.hash = "#/";
    window.addEventListener("hashchange", function(){
      const hash = location.hash.split("#")[1];
      callback(hash);
    });
  };

  return she;
});