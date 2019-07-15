(function(global,factory){
    global.sheong = global.she = factory();
})(this,function(){
    "use strict";

    const dev = {
        tree: [],
        command: {},
        createTree: undefined
    };

    dev.command["she-text"] = function(VRElement, value, name){
        VRElement.element.textContent = value;
        VRElement.children = [];
        if(name !== undefined){
            VRElement.element.setAttribute(name, JSON.stringify(value));
        }
    }

    dev.command["she-html"] = function(VRElement, value, name){
        VRElement.element.innerHTML = value;
        VRElement.children = [];
        if( value.search( new RegExp('<[A-Za-z\/]+>', 'g') ) !== -1 ){
            dev.createTree(VRElement.element.children, VRElement.children, dev.command);
        }
        if(name !== undefined){
            VRElement.element.setAttribute(name, JSON.stringify(value));
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
                        isHasOneCommand = true;
                    }

                    tree[tree.length - 1].name[j] = elements[i].getAttribute(command);
                    tree[tree.length - 1].command[j] = command;
                    tree[tree.length - 1].data[j] = tree[tree.length - 1].element.getAttribute(tree[tree.length - 1].name[j]);

                    dev.command[command](tree[tree.length - 1], JSON.parse(tree[tree.length - 1].data[j]), tree[tree.length - 1].name[j]);

                    if(elements[i].children.length > 0){
                        dev.createTree(elements[i].children, tree[tree.length - 1].children, commands);
                    }
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

            const enumerable = function (elementname,tree) {
                let i = 0;
                while ( i < tree.length && elementname !== undefined ){
                    if( names[names.length - 1] === names[j] ){
                        let k = 0;
                        while ( k < tree[i].name.length ){
                            if( names[names.length - 1] === tree[i].name[k] ){

                            }

                            k++;
                        }

                    }

                    i++;
                }
            }


        }
    }

    return she;
});
