(function(global,factory){
    global.sheong = global.she = factory();
})(this,function(){
    'use strict';

    const dev = {
        tree: [],
        command: {},
        createTree: undefined,
        updateTree: undefined,
        enumerableTree: undefined,
        getSuperiorElement: undefined,
        updateSuperiorVRElement: undefined,
        isCreateTreeFinish: false,
        isWatch: true
    };

    dev.command['she-text'] = function(VRElement, value){
        dev.isWatch = false;
        VRElement.element.textContent = value;
        dev.isCreateTreeFinish = false;
        VRElement.children = [];
        dev.isCreateTreeFinish = true;
        dev.isWatch = true;
    };

    dev.command['she-html'] = function(VRElement, value){
        dev.isWatch = false;
        VRElement.element.innerHTML = value;
        dev.isCreateTreeFinish = false;
        VRElement.children = [];
        if( value.search( new RegExp('<[A-Za-z\/]+>', 'g') ) !== -1 ){
            dev.createTree(VRElement.element.children, VRElement.children);
        }
        dev.isCreateTreeFinish = true;
        dev.isWatch = true;
    };

    dev.command['she-style'] = function(VRElement, value){
        if(typeof value === 'object'){
            let styleData = '';
            for(const key in value){
                styleData += key.replace( new RegExp('[A-Z]', 'g'), function (kw) {
                    return '-' + kw.toLowerCase();
                });
                styleData += ':';
                styleData += value[key];
                styleData += ';';
            }
            VRElement.element.setAttribute('style', styleData);
        }
    };

    dev.command['she-attribute'] = function(VRElement, value, name){
        if(typeof value === 'object'){
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
        }
    };

    dev.command['she-for'] = function(VRElement, value){
        if(typeof value === 'object'){
            dev.isWatch = false;
            const superiorElement = dev.getSuperiorElement(VRElement),
                parentElement = VRElement.element.parentNode,
                fragment = document.createDocumentFragment();
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
                                    break;
                                }
                                element = element.parentNode;
                            }
                        }
                    };

                    if(VRElement.name[i].indexOf('item') !== -1){
                        let item = getData('item');
                        dev.command[VRElement.command[i]](VRElement, eval( VRElement.name[i] ));
                    }
                    if(VRElement.name[i] === 'key'){
                        dev.command[VRElement.command[i]](VRElement, getData('key'));
                    }

                    i++;
                }
            });

            dev.isWatch = true;
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
            dev.isCreateTreeFinish = false;
            dev.tree = [];
            dev.createTree(document.body.children, dev.tree);
            dev.isCreateTreeFinish = true;
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
        }
        enumerable(tree);
    };

    dev.getSuperiorElement = function(VRElement){
        let element = VRElement.element.parentNode;
        while (element.tagName !== 'BODY'){
            for(const command in dev.command){
                if(element.hasAttribute(command)){
                    return element;
                }
            }
            element = element.parentNode;
        }
    };

    dev.updateSuperiorVRElement = function(superiorElement){
        dev.enumerableTree(dev.tree, function(VRElement){
            let i = 0;
            while(i < VRElement.name.length){
                if(VRElement.element === superiorElement){
                    dev.isCreateTreeFinish = false;
                    VRElement.children = [];
                    dev.createTree(VRElement.element.children, VRElement.children);
                    dev.isCreateTreeFinish = true;
                    break;
                }
                i++;
            }
        });
    }

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
            }

            const timer = setInterval(function(){
                if(dev.isCreateTreeFinish){
                    clearInterval(timer);
                    enumerable(names[j], dev.tree);
                }
            },1);
            return she;
        }
    };

    const DOMLoad = function(){
        dev.createTree(document.body.children, dev.tree);
        dev.isCreateTreeFinish = true;
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
