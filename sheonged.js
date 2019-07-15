(function(global,factory){
    global.sheong = global.she = factory();
})(this,function(){
    'use strict';

    const Dev = function(){
        this.tree = [];
        Object.defineProperty(this,'_isCreateTree',{
            writable: true,
            enumerable: true,
            configurable: false
        });
        this.isCreateTree = false;
    }
    Dev.prototype.command = {}
    Dev.prototype.command['she-text'] = function(VRElement, value, name){
        if(value !== null){
            VRElement.element.textContent = value;
            VRElement.children = [];
            if(name !== undefined){
                VRElement.element.setAttribute(name, JSON.stringify(value));
            }
        }
    }
    Dev.prototype.command['she-html'] = function(VRElement, value, name){
        if(value !== null && typeof value === 'string'){
            VRElement.element.innerHTML = value;
            VRElement.children = [];
            if( value.search( new RegExp('<[A-Za-z\/]+>', 'g') ) !== -1 ){
                dev.isCreateTree = false;
                dev.createTree(VRElement.element.children, VRElement.children, dev.command);
                dev.isCreateTree = true;
            }
            if(name !== undefined){
                VRElement.element.setAttribute(name, JSON.stringify(value));
            }
        }
    }
    Dev.prototype.command['she-css'] = function(VRElement, value, name){
        if(value !== null && typeof value === 'object'){
            let css = '';
            for(const i in value){
                css += i.replace( new RegExp('[A-Z]', 'g'), function (kw) {
                    return '-' + kw.toLowerCase();
                } );
                css += ':';
                css += value[i];
                css += ';';
            }
            VRElement.element.setAttribute('style',css);
            if(name !== undefined){
                VRElement.element.setAttribute(name, JSON.stringify(value));
            }
        }
    }
    Dev.prototype.command['she-value'] = function(VRElement, value, name){
        if(value !== null){
            VRElement.element.setAttribute('value', value);
            if(name !== undefined){
                VRElement.element.setAttribute(name, JSON.stringify(value));
            }
        }
    }
    Dev.prototype.command['she-for'] = function (VRElement, value, name) { //处理循环数据
        if(value !== null && typeof value === 'object'){
            const parent = VRElement.element.parentNode;
            const frag = document.createDocumentFragment();
            for(const i in value){
                const element = VRElement.element.cloneNode(true);
                const forRrenderer = function(elements, command){
                    let j = 0;
                    while ( j < elements.length ){
                        for(const key in command){
                            if( elements[j].hasAttribute(key) ){
                                if(elements[j].getAttribute(key).indexOf('she-item') !== -1){
                                    dev.command[key]({ element: elements[j], children: [] }, eval( elements[j].getAttribute(key).replace('she-item', 'value[i]' ) ) );
                                }
                                if(elements[j].getAttribute(key).indexOf('she-index') !== -1){
                                    dev.command[key]({ element: elements[j], children: [] }, eval( elements[j].getAttribute(key).replace('she-index', i ) ) );
                                }
                            }
                        }
                        if(elements[j].children.length > 0){
                            forRrenderer(elements[j].children, command);
                        }
                        j++;
                    }
                }
                forRrenderer(element.children, dev.command);
                if(name !== undefined){
                    VRElement.element.setAttribute(name, JSON.stringify(value));
                }
                frag.appendChild( element );
            }
            parent.replaceChild(frag, VRElement.element);

            // let getVRParentNode = function (VRParent) {
            //     let i = 0;
            //     while (VRParent.element.hasAttribute(key))
            // }
            //
            // for(const key in dev.command){
            //     if(element.hasAttribute(key)){
            //         dev.createTree(VRElement.element.children, VRElement.children, dev.command);
            //     }
            // }
        }
    }

    Object.defineProperty(Dev.prototype,"isCreateTree",{
        get(){
            return this._isCreateTree;
        },
        set(value){
            this._isCreateTree = value;
        },
        enumerable:true,
        configurable:false
    });

    Dev.prototype.createTree = function(elements, tree, command){
        let i = 0;
        while(i < elements.length){
            let isHasCommand = false, j = 0, isHasOneCommand = false;
            for(const key in command){
                if(elements[i].hasAttribute(key) && elements[i].getAttribute(key).indexOf('she-item') === -1 && elements[i].getAttribute(key).indexOf('she-index') === -1){
                    if(!isHasCommand){
                        isHasCommand = true;
                    }
                    if(!isHasOneCommand){
                        tree.push({
                            name: [],
                            element: elements[i],
                            command: [],
                            data: [],
                            children: []
                        });
                        isHasOneCommand = true;
                    }

                    tree[tree.length - 1].name[j] = elements[i].getAttribute(key);
                    tree[tree.length - 1].command[j] = key;
                    tree[tree.length - 1].data[j] = tree[tree.length - 1].element.getAttribute(tree[tree.length - 1].name[j]);
                    console.log(tree[tree.length - 1].data[j])
                    if(key !== 'she-for'){
                        dev.command[key](tree[tree.length - 1], JSON.parse(tree[tree.length - 1].data[j]), tree[tree.length - 1].name[j]);
                    }

                    if(elements[i].children.length > 0){
                        this.createTree(elements[i].children, tree[tree.length - 1].children, command);
                    }
                    j++;
                }
            }

            if(!isHasCommand && elements[i].children.length > 0){
                this.createTree(elements[i].children, tree, command);
            }
            i++;
        }
    }
    Dev.prototype.traverseTree = function (callback) {
        const traverseTree = function(tree){
            let i = 0;
            while (i < tree.length){
                callback(tree[i]);
                if(tree[i].children.length > 0){
                    traverseTree(tree[i].children);
                }
                i++;
            }
        }
        traverseTree(dev.tree);
    }

    const dev = new Dev(); //初始dev对象

    const she = function(name){
        const names = name.trim().split(new RegExp('\\s'));

        return function(parameter){
            let j = 0;
            const enumerable = function(elementname, tree){
                let i = 0;
                while( i < tree.length && elementname !== undefined ){
                    if( names[names.length - 1] === names[j] ){
                        let k = 0;
                        while ( k < tree[i].name.length ){
                            if( names[names.length - 1] === tree[i].name[k] ){
                                if(typeof parameter === 'function'){
                                    tree[i].data[k] = parameter(tree[i].element);
                                } else {
                                    tree[i].data[k] = parameter;
                                }
                                dev.command[tree[i].command[k]](tree[i], tree[i].data[k], names[names.length - 1]);
                            }
                            k++;
                        }
                    }

                    if( tree[i].children.length > 0 ){
                        if(elementname === tree[i].name){
                            j++;
                        }
                        enumerable(names[j], tree[i].children);
                        if(elementname === tree[i].name){
                            j--;
                        }
                    }
                    i++;
                }
            }

            const DOMLoad = function(){
                enumerable(names[j], dev.tree);
                document.removeEventListener('DOMContentLoaded', DOMLoad);
            }
            document.addEventListener('DOMContentLoaded', DOMLoad);

            return she;
        }
    }

    const DOMLoad = function(){
        const elements = document.body.children;
        dev.createTree(elements, dev.tree, dev.command);
        dev.traverseTree((el)=>{
            console.log(el)
        });
        console.log(dev.tree)
        document.removeEventListener('DOMContentLoaded', DOMLoad);
    }
    document.addEventListener('DOMContentLoaded', DOMLoad);
    return she;
});
