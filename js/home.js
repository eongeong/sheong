import she from "./sheong"
export default function () {
    she
    ("container")([
        ["div",{ class:"clickMe", sheChange:"clickMeChange", she:"clickMe" },["点我"]],
        ["div",{ sheFor:"items;item;i", sheAttribute:"{ style:item.css }" }, [
            ["p", { sheContent:"item.text" }],
            ["p", { sheFor:"item.arr;ite;i" , sheContent:"ite"}]
        ]]
    ])
    ("clickMe")((el)=>{
        el.onclick = function () {
            she
            ("clickMeChange")([
                {backgroundColor: "orange "},
                {backgroundColor: "yellow"},
                {backgroundColor: "green"},
                {backgroundColor: "red"}
            ])
        }
        return false;
    })
    ("items")([
        {
            css: "background-color:red;",
            text:"一",
            arr: [1,2,3]
        },
        {
            css: "background-color:orange;",
            text:"二",
            arr: [1,2,3]
        },
        {
            css: "background-color:green;",
            text:"三",
            arr: [1,2,3]
        }
    ])

    she.style([
        [".clickMe", {
            width: "100px",
            height: "50px",
            backgroundColor: "red"
        }]
    ]);
}