import she from "./sheong"
import defaultStyle from "./defaultStyle"
import flex from "./flex"
import home from "./home"

she
("index")([
    ["div", { sheContent:"container" }]
])

home();
window.onhashchange = function () {
    switch (location.hash) {
        case "#/":
            home();
            break;
    }
}

she.style(defaultStyle);
she.style(flex);