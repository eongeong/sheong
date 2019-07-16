(function(global,factory){
    global.sheong = global.she = factory();
})(this,function(){
    "use strict";

    const dev = {
        tree: [],
        command: {},
        createTree: undefined,
        isCreateFinish: false
    };

    dev.command["she-text"] = function(VRElement, value){
        if(value !== undefined){
            VRElement.element.textContent = value;
            VRElement.children = [];
        }
    }

    dev.command["she-html"] = function(VRElement, value){
        if(value !== undefined){
            VRElement.element.innerHTML = value;
            VRElement.children = [];
            if( value.search( new RegExp('<[A-Za-z\/]+>', 'g') ) !== -1 ){
                dev.createTree(VRElement.element.children, VRElement.children, dev.commands);
            }
        }
    }

    dev.createTree = function(elements, tree, commands){
        let i = 0;
        while(i < elements.length){
            let isHasCommand = false,
                j = 0,
                isHasOneCommand = false;
            for(const command in commands){
                if(elements[i].hasAttribute(command)){
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
                        if(elements[i].children.length > 0){
                            dev.createTree(elements[i].children, tree[tree.length - 1].children, commands);
                        }
                        isHasOneCommand = true;
                    }

                    tree[tree.length - 1].name[j] = elements[i].getAttribute(command);
                    tree[tree.length - 1].command[j] = command;

                    dev.command[command](tree[tree.length - 1], tree[tree.length - 1].data[j], tree[tree.length - 1].name[j]);

                    j++;
                }
            }

            if(!isHasCommand && elements[i].children.length > 0){
                dev.createTree(elements[i].children, tree, commands);
            }
            i++;
        }
    }

    const she = function (name) {
        const names = name.trim().split(new RegExp('\\s'));

        return function (parameter) {
            let j = 0;

            const enumerable = function (elementname, tree) {
                let i = 0;
                while ( i < tree.length){
                    if( names[names.length - 1] === names[j] ){
                        let k = 0;
                        while ( k < tree[i].name.length ){
                            if( names[names.length - 1] === tree[i].name[k] ){
                                tree[i].data[k] = parameter;
                                dev.command[tree[i].command[k]](tree[i], tree[i].data[k], names[names.length - 1]);
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
                console.log(dev.tree);
                if(dev.isCreateFinish){
                    clearInterval(timer);
                    enumerable(names[j], dev.tree);
                }
            },1);

            return she;
        }
    }

    const DOMLoad = function(){
        const elements = document.body.children;
        dev.createTree(elements, dev.tree, dev.command);
        dev.isCreateFinish = true;
        document.removeEventListener('DOMContentLoaded', DOMLoad);
    }
    document.addEventListener('DOMContentLoaded', DOMLoad);

    return she;
});