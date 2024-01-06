
const oatColor = getComputedStyle(document.documentElement).getPropertyValue("--oat-color");
const slateColor = getComputedStyle(document.documentElement).getPropertyValue("--slate-color");

let activeSectionID = null;
let activeSection = null;
let activeSectionLink = null;

function setActiveSection(id) {
    if (activeSectionID === id) return;
    activeSectionID = id;

    if (activeSection !== null) {
        activeSection.style.display = "none";
        setChildrenTransparent(activeSection);
    }
    activeSection = document.getElementById(id);
    activeSection.style.display = "flex";
    fadeInChildren(activeSection);

    if (activeSectionLink !== null) activeSectionLink.classList.remove("section-link-active");
    activeSectionLink = document.getElementById(id + "-link");
    activeSectionLink.classList.add("section-link-active");
}

let activeDevlogID = null;
let activeDevlog = null;

const allDropdownLinks = document.getElementsByClassName("dropdown-link");

function setActiveDevlog(id, projectName) {
    if (activeDevlogID === id) return;
    activeDevlogID = id;

    if (activeDevlog !== null) activeDevlog.style.display = "none";
    activeDevlog = document.getElementById(activeDevlogID);
    activeDevlog.style.display = "flex";

    for (const d of allDropdownLinks) 
        d.textContent = projectName;
}

for (const dropdownLink of allDropdownLinks) {
    const optionPanel = dropdownLink.parentNode.querySelector(".dropdown-panel");
    
    dropdownLink.addEventListener("mouseover", () => {
        optionPanel.style.display = "flex";
    });

    dropdownLink.parentNode.addEventListener("mouseout", () => {
        if (!optionPanel.matches(":hover")) 
            optionPanel.style.display = "none";
    })
    optionPanel.addEventListener("mouseout", () => {
        if (!dropdownLink.parentNode.matches(":hover"))
            optionPanel.style.display = "none";
    })

    for (const option of optionPanel.getElementsByTagName("*")) {
        option.addEventListener("click", () => {
            optionPanel.style.display = "none";

            setActiveDevlog(option.value, option.textContent);
        })
    }
    
}

function fadeIn(elem) {
    let op = 0.1;

    const timer = setInterval(() => {

        elem.style.opacity = op;

        if (elem.style.opacity >= 1) {
            elem.style.opacity = 1;
            clearInterval(timer);
        }

        op += op * 0.1;
        
    }, 10);

    return timer;
}
function fadeInStartingWith(elem) {
    if (elem == undefined) return;
    fadeIn(elem);
    setTimeout(() => fadeInStartingWith(elem.nextElementSibling), 50);
}
function fadeInChildren(parentElem) {
    fadeInStartingWith(parentElem.firstElementChild);
}
function setChildrenTransparent(parentElem) {
    for (const child of parentElem.children) 
        child.style.opacity = "0";
}

setActiveSection("devlogs");
setActiveDevlog("project1-devlog", "project1");

document.getElementById("section-link-nav").style.backgroundColor = slateColor + "b0";