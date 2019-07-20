(function(global, factory){
    global.sheong = global.she = factory();
})(this, function(){
    'use strict';

    const dev = {
        tree: [],
        command: {},
        createTree: undefined,
        updateTree: undefined,
        enumerableTree: undefined,
        getSuperiorElement: undefined,
        updateSuperiorVRElement: undefined,
        renderGuard : undefined,
        isQuery: false,
        isWatch: true
    };

    dev.command['she-text'] = function(VRElement, value){
        dev.renderGuard(function(){
            VRElement.element.textContent = value;
            VRElement.children = [];
        });
    };

    dev.command['she-html'] = function(VRElement, value){
        dev.renderGuard(function(){
            VRElement.element.innerHTML = value;
            VRElement.children = [];
            if( value.search( new RegExp('<[A-Za-z\/]+>', 'g') ) !== -1 ){
                dev.createTree(VRElement.element.children, VRElement.children);
            }
        });
    };

    dev.command['she-style'] = function(VRElement, value, name){
        if(typeof value === 'object'){
            dev.renderGuard(function(){
                let styleString =  VRElement.element.hasAttribute('style') ? VRElement.element.getAttribute('style') : '';
                const attributeData = VRElement.element.getAttribute(name),
                    parseStyleObject = function(styleObject){
                        let styleString = '';
                        for(const key in styleObject){
                            styleString += key.replace( new RegExp('[A-Z]', 'g'), function (kw) {
                                return '-' + kw.toLowerCase();
                            });
                            styleString += ':';
                            styleString += styleObject[key];
                            styleString += ';';
                        }

                        return styleString;
                    };

                if(attributeData !== null){
                    styleString = styleString.replace(parseStyle( JSON.parse(attributeData) ), '');
                }

                VRElement.element.setAttribute('style', styleString + parseStyleObject(value));
                VRElement.element.setAttribute(name, JSON.stringify(value));
            });
        }

    };

    dev.command['she-attribute'] = function(VRElement, value, name){
        if(typeof value === 'object'){
            dev.renderGuard(function(){
                const attributeData = VRElement.element.getAttribute(name);
                if(attributeData !== null){
                    for (const key in JSON.parse(attributeData)) {
                        VRElement.element.removeAttribute(key.replace( new RegExp('[A-Z]', 'g'), function (kw) {return '-' + kw.toLowerCase();} ));
                    }
                }
                for(const key in value){
                    VRElement.element.setAttribute(key.replace( new RegExp('[A-Z]', 'g'), function (kw) {return '-' + kw.toLowerCase();} ), value[key]);
                }

                dev.updateSuperiorVRElement(dev.getSuperiorElement(VRElement));
                VRElement.element.setAttribute(name, JSON.stringify(value));
            });
        }
    };

    dev.command['she-for'] = function(VRElement, value, name){
        if(typeof value === 'object'){
            dev.renderGuard(function(){
                const superiorElement = dev.getSuperiorElement(VRElement);
                if(superiorElement !== null){
                    const parentElement = VRElement.element.parentNode,
                        fragment = document.createDocumentFragment(),
                        enumerableElements = parentElement.querySelectorAll('[she-for='+ name +']');

                    let i = 1;
                    while(i < enumerableElements.length){
                        parentElement.removeChild(enumerableElements[i]);
                        i++;
                    }

                    for(const key in value){
                        const element = VRElement.element.cloneNode(true);
                        element.setAttribute('item', JSON.stringify(value[key]));
                        element.setAttribute('key', key);
                        fragment.appendChild( element );
                    }
                    parentElement.replaceChild(fragment, VRElement.element);
                    dev.updateSuperiorVRElement(superiorElement);
                    dev.enumerableTree(dev.tree, function(VRElement){
                        let i = 0;
                        while(i < VRElement.name.length){
                            const getData = function(name){
                                if(VRElement.element.hasAttribute(name)){
                                    switch(name){
                                        case 'key':
                                            return VRElement.element.getAttribute('key');
                                        case 'item':
                                            return JSON.parse(VRElement.element.getAttribute('item'));
                                    }
                                }else{
                                    let element = VRElement.element.parentNode;
                                    while(element.tagName !== 'BODY'){
                                        if(element.hasAttribute('she-for')){
                                            switch(name){
                                                case 'key':
                                                    return element.getAttribute('key');
                                                case 'item':
                                                    return JSON.parse(element.getAttribute('item'));
                                            }
                                        }
                                        element = element.parentNode;
                                    }
                                }
                            };

                            if(VRElement.name[i].indexOf('item') !== -1){
                                const item = getData('item');
                                dev.command[VRElement.command[i]](VRElement, eval( VRElement.name[i] ), VRElement.name[i]);
                            }
                            if(VRElement.name[i] === 'key'){
                                dev.command[VRElement.command[i]](VRElement, getData('key'), VRElement.name[i]);
                            }

                            i++;
                        }
                    });
                }
            });
        }
    }

    dev.createTree = function(elements, tree){
        let i = 0;
        while(i < elements.length){
            let isHasCommand = false,
                j = 0,
                isHasOneCommand = false;
            for(const command in dev.command){
                if(elements[i].hasAttribute(command) && elements[i].getAttribute(command) !== ''){
                    if(!isHasCommand){
                        isHasCommand = true;
                    }

                    if(!isHasOneCommand){
                        tree.push({
                            name: [],
                            element: elements[i],
                            command: [],
                            children: []
                        });
                        if(elements[i].children.length > 0){
                            dev.createTree(elements[i].children, tree[tree.length - 1].children);
                        }
                        isHasOneCommand = true;
                    }

                    tree[tree.length - 1].name[j] = elements[i].getAttribute(command).trim();
                    tree[tree.length - 1].command[j] = command;

                    j++;
                }
            }

            if(!isHasCommand && elements[i].children.length > 0){
                dev.createTree(elements[i].children, tree);
            }
            i++;
        }
    };

    dev.updateTree = function(){
        if(dev.isWatch){
            dev.isQuery = false;
            dev.tree = [];
            dev.createTree(document.body.children, dev.tree);
            dev.isQuery = true;
        }
    };

    dev.enumerableTree = function(tree, callback){
        const enumerable = function(tree){
            let i = 0;
            while (i < tree.length){
                callback(tree[i]);
                if(tree[i].children.length > 0){
                    enumerable(tree[i].children);
                }
                i++;
            }
        };
        enumerable(tree);
    };

    dev.getSuperiorElement = function(VRElement){
        let element = VRElement.element.parentNode;
        if(element !== null){
            while (element.tagName !== 'BODY'){
                for(const command in dev.command){
                    if(element.hasAttribute(command)){
                        return element;
                    }
                }
                element = element.parentNode;
            }
        }else{
            return null;
        }
    };

    dev.updateSuperiorVRElement = function(superiorElement){
        dev.enumerableTree(dev.tree, function(VRElement){
            let i = 0;
            while(i < VRElement.name.length){
                if(VRElement.element === superiorElement){
                    VRElement.children = [];
                    dev.createTree(VRElement.element.children, VRElement.children);
                    break;
                }
                i++;
            }
        });
    };

    dev.renderGuard = function(callback){
        dev.isWatch = false;
        dev.isQuery = false;
        callback();
        dev.isQuery = true;
        dev.isWatch = true;
    };

    const she = function (name) {
        const names = name.trim().split(new RegExp('\\s'));

        return function (parameter) {
            let j = 0;

            const enumerable = function (elementname, tree) {
                let i = 0;
                while ( i < tree.length ){
                    if( names[names.length - 1] === names[j] ){
                        let k = 0;
                        while ( k < tree[i].name.length ){
                            if( names[names.length - 1] === tree[i].name[k] ){
                                if(typeof parameter === 'function'){
                                    parameter = parameter(tree[i].element);
                                }
                                dev.command[tree[i].command[k]](tree[i], parameter, tree[i].name[k]);
                            }
                            k++;
                        }
                    }

                    if( tree[i].children.length > 0 ){
                        let k = 0;
                        while( k < tree[i].name.length ){
                            if(elementname === tree[i].name[k]){
                                j++;
                                break;
                            }
                            k++;
                        }
                        enumerable(names[j], tree[i].children);
                        k = 0;
                        while( k < tree[i].name.length ){
                            if(elementname === tree[i].name[k]){
                                j--;
                                break;
                            }
                            k++;
                        }
                    }

                    i++;
                }
            };

            const timer = setInterval(function(){
                if(dev.isQuery){
                    clearInterval(timer);
                    enumerable(names[j], dev.tree);
                }
            },1);

            return she;
        };
    };

    const DOMLoad = function(){
        dev.createTree(document.body.children, dev.tree);
        dev.isQuery = true;
        document.removeEventListener('DOMContentLoaded', DOMLoad);
    };
    document.addEventListener('DOMContentLoaded', DOMLoad);

    document.addEventListener('DOMNodeInserted',function(){
        dev.updateTree();
    });

    document.addEventListener('DOMNodeRemoved',function(){
        dev.updateTree();
    });

    return she;
});
