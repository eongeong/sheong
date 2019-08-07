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
      command: {},
      createTree: undefined,
      updateTree: undefined,
      enumerableTree: undefined,
      getSuperiorElement: undefined,
      updateSuperiorVRElement: undefined,
      renderGuard: undefined,
      isWatch: true
    };
  
    dev.command["she"] = function (VRElement, value, name) {
        if( value !== undefined ){
          VRElement.element.setAttribute(name, JSON.stringify(value));
        }
    };
  
    dev.command["she-text"] = function (VRElement, value) {
      dev.renderGuard(function () {
        VRElement.element.textContent = value;
        VRElement.children = [];
      });
    };
  
    dev.command["she-html"] = function (VRElement, value) {
      dev.renderGuard(function () {
        VRElement.element.innerHTML = value;
        VRElement.children = [];
        dev.createTree(VRElement.element.children, VRElement.children);
      });
    };
  
    dev.command["she-style"] = function (VRElement, value) {
      if (typeof value === "object") {
        const parseStyleObject = function (styleObject) {
          let styleString = "";
          for (const key in styleObject) {
            styleString += key.replace(new RegExp("[A-Z]", "g"), function (Keyword) {
              return "-" + Keyword.toLowerCase();
            });
            styleString += ":";
            styleString += styleObject[key];
            styleString += ";";
          }
          return styleString;
        };
        VRElement.element.setAttribute("style", parseStyleObject(value));
      }
    };
  
    dev.command["she-attribute"] = function (VRElement, value, name) {
      if (typeof value === "object") {
        dev.renderGuard(function () {
          let isUpdateSuperiorVRElement = false;
          const attributeData = JSON.parse(VRElement.element.getAttribute(name));
          if (attributeData !== null) {
            for (const key in attributeData) {
              VRElement.element.removeAttribute(key.replace(new RegExp("[A-Z]", "g"), function (Keyword) {
                return "-" + Keyword.toLowerCase();
              }));
            }
          }
  
          for (const key in value) {
            const attribute = key.replace(new RegExp("[A-Z]", "g"), function (Keyword) {
              return "-" + Keyword.toLowerCase();
            });
            
            if(isUpdateSuperiorVRElement === false && attribute.indexOf("she") !== -1){
                isUpdateSuperiorVRElement = true;
            }
            
            VRElement.element.setAttribute(attribute, value[key]);
          }
  
          if(isUpdateSuperiorVRElement){
            dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
          }
          
          VRElement.element.setAttribute(name, JSON.stringify(value));
        });
      }
    };
  
    dev.command["she-for"] = function (VRElement, value, name) {
      if (typeof value === "object") {
        dev.renderGuard(function () {
          const superiorElement = dev.getSuperiorElement(VRElement);
          if (superiorElement !== null) {
            const fragment = document.createDocumentFragment(),
              forCookie = VRElement.element.getAttribute("she-for").split(":");
            while(
              VRElement.element.nextElementSibling !== null
              &&
              VRElement.element.nextElementSibling.hasAttribute("she-for")
              &&
              VRElement.element.nextElementSibling.getAttribute("she-for").indexOf(name) !== -1
            ){
              VRElement.element.parentNode.removeChild(VRElement.element.nextElementSibling);
            }
  
            for (const key in value) {
              const element = VRElement.element.cloneNode(true);
              element.setAttribute(forCookie[1], JSON.stringify(value[key]));
              element.setAttribute(forCookie[2], key);
              fragment.appendChild(element);
            }
            VRElement.element.parentNode.replaceChild(fragment, VRElement.element);
            dev.updateSuperiorVRElement(superiorElement);
            dev.enumerableTree(dev.tree, function (VRElement) {
              let i = 0;
              while (i < VRElement.name.length) {
                const getData = function (name) {
                  if (VRElement.element.hasAttribute(name)) {
                    if (name === forCookie[1]) {
                      return JSON.parse(VRElement.element.getAttribute( forCookie[1] ));
                    } else {
                      return VRElement.element.getAttribute( forCookie[2] );
                    }
                  } else {
                    let element = VRElement.element.parentNode;
                    while (element.tagName !== "BODY") {
                      if (element.hasAttribute("she-for")) {
                        if (name === forCookie[1]) {
                          return JSON.parse(element.getAttribute(forCookie[1]));
                        } else {
                          return element.getAttribute(forCookie[2]);
                        }
                      }
                      element = element.parentNode;
                    }
                  }
                };
  
                if (VRElement.name[i].search( new RegExp("^" + forCookie[1] + "$|^" + forCookie[1] + "[\\.\\[]", "g") ) !== -1) {
                  const item = getData(forCookie[1]);
                  if(item !== null){
                    dev.command[VRElement.command[i]](VRElement, eval( "item" + VRElement.name[i].replace(forCookie[1], "") ), VRElement.name[i]);
                  }
                }
                if (VRElement.name[i] === forCookie[2]) {
                  dev.command[VRElement.command[i]](VRElement, getData(forCookie[2]), VRElement.name[i]);
                }
  
                i++;
              }
            });
          }
        });
      }
    };
  
    dev.command["she-render"] = function (VRElement, value){
        if(Array.isArray(value)){
            dev.renderGuard(function () {
                VRElement.element.textContent = "";
                VRElement.children = [];
                let isUpdateSuperiorVRElement = false;
                const fragment = document.createDocumentFragment();

                const renderer = function(parent, value){
                  let i = 0;
                  while( i < value.length ){
                    const element = document.createElement(value[i][0]);

                    if(value[i][1] !== undefined){
                      for(const attribute in value[i][1]){
                        const attributeName = attribute.replace(new RegExp("[A-Z]", "g"), function (Keyword) {
                            return "-" + Keyword.toLowerCase();
                        });
  
                        if(isUpdateSuperiorVRElement === false && attributeName.indexOf("she") !== -1){
                            isUpdateSuperiorVRElement = true;
                        }
  
                        element.setAttribute(attributeName, value[i][1][attribute]);
                      }
                    }

                    if(value[i][2] !== undefined){
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
  
    dev.createTree = function (elements, tree) {
      let i = 0;
      while (i < elements.length) {
        let isHasCommand = false,
          j = 0,
          isHasOneCommand = false;
        for (const command in dev.command) {
          if (elements[i].hasAttribute(command) && elements[i].getAttribute(command) !== "") {
            if (!isHasCommand) {
              isHasCommand = true;
            }
  
            if (!isHasOneCommand) {
              tree.push({
                name: [],
                element: elements[i],
                command: [],
                children: []
              });
              if (elements[i].children.length > 0) {
                dev.createTree(elements[i].children, tree[tree.length - 1].children);
              }
              isHasOneCommand = true;
            }
            
            tree[tree.length - 1].name[j] = elements[i].getAttribute(command).split(":")[0];
            tree[tree.length - 1].command[j] = command;
  
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
      if (dev.isWatch) {
        dev.tree = [];
        dev.createTree(document.body.children, dev.tree);
      }
    };
  
    dev.enumerableTree = function (tree, callback) {
      const enumerable = function (tree) {
        let i = 0;
        while (i < tree.length) {
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
      if (element !== null) {
        while (element.tagName !== "BODY") {
          for (const command in dev.command) {
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
  
  
    const she = function (name) {
      const names = name.trim().split(new RegExp("\\s"));
  
      return function (parameter) {
        let j = 0;
  
        const enumerable = function (elementname, tree) {
          let i = 0;
          while (i < tree.length) {
            if (names[names.length - 1] === names[j]) {
              let k = 0;
              while (k < tree[i].name.length) {
                if (names[names.length - 1] === tree[i].name[k]) {
                  if (typeof parameter === "function") {
                    dev.command[tree[i].command[k]](tree[i], parameter(tree[i].element), tree[i].name[k]);
                  } else {
                    dev.command[tree[i].command[k]](tree[i], parameter, tree[i].name[k]);
                  }
                }
                k++;
              }
            }
  
            if (tree[i].children.length > 0) {
              let k = 0;
              while (k < tree[i].name.length) {
                if (elementname === tree[i].name[k]) {
                  j++;
                  break;
                }
                k++;
              }
              enumerable(names[j], tree[i].children);
              k = 0;
              while (k < tree[i].name.length) {
                if (elementname === tree[i].name[k]) {
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
      let styleString = "";
      let i = 0;
      while(i < styleArray.length){
          styleString += styleArray[i][0] + "{";
          for(const key in styleArray[i][1]){
              styleString += key.replace(new RegExp("[A-Z]", "g"), function (Keyword) {
                  return "-" + Keyword.toLowerCase();
              });
              styleString += ":";
              styleString += styleArray[i][1][key];
              styleString += ";";
          }
          styleString += "}";
          i++;
      }

      let j = 0;
      while(j < document.head.children.length){
          if(document.head.children[j].nodeName === "STYLE"){
              document.head.children[j].innerHTML += styleString;
              return;
          }
          j++;
      }

      const style = document.createElement("style");
      style.innerHTML = styleString;
      document.head.appendChild(style);
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