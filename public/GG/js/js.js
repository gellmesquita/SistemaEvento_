const login = document.querySelector(".login");
const signup = document.querySelector(".signup");
const form = document.querySelector("#form");
const switchs = document.querySelectorAll(".switch");

let current = 1;

login.style.color = "white";

function tab2() {
    form.style.marginLeft = "-100%";
    login.style.background = "none";
    signup.style.background = "linear-gradient(45deg, #00005a, #00005a)";
    login.style.color = "#444";
    signup.style.color = "white";
    // switchs[current - 1].classlist.add("active");
}
function tab1() {
    form.style.marginLeft = "0";
    signup.style.background = "none";
    login.style.background = "#00005a";
    signup.style.color = "#444";
    login.style.color = "white";
    // switchs[current - 1].classlist.remove("active");
}