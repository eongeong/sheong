import she from "./sheong"
import defaultStyle from "./defaultStyle"
import flex from "./flex"
import home from "./home"
import about from "./about"
import logo from "../img/sheong.png"

she
("app")([
    ["img", { class: "logo", src: logo }],
    ["div", { class: "goto frc jc" }, [
        ["a", { href: "#/" }, ["home"]],
        ["a", { href: "#/about" }, ["about"]],
    ]],
    ["div", { class:"container fcc", sheRender: "container" }]
])

const data = ["Welcome", "this is a loyal to native JS"]

home(data[0]);
window.addEventListener("hashchange", function () {
    switch(location.hash){
        case "#/": home(data[0]); break;
        case "#/about": about(data[1]);
    }
});
she.style(defaultStyle);
she.style(flex);
she.style([
    ["#app", {
        width: "100%"
    }],
    ["#app .logo", {
        display: "block",
        margin: "40px auto 0 auto"
    }],
    ["#app .goto", {
        marginTop: "30px"
    }],
    ["#app .goto>a", {
        marginTop: "30px",
        color: "rgb(0,127,255)",
        fontSize: "18px",
        textDecoration: "underline"
    }],
    ["#app .goto>a:first-child", {
        marginRight: "20px"
    }],
    ["#app .container", {
        width: "100%",
        color: "rgb(0,127,255)",
        fontSize: "30px",
        fontWeight: "bold",
        marginTop: "30px"
    }]
]);

