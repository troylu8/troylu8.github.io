const computed = getComputedStyle(document.documentElement);

const oatColor = computed.getPropertyValue("--oat-color");

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

    if (activeSectionLink !== null) {
        activeSectionLink.classList.remove("section-link-active");
        activeSectionLink.style.color = oatColor;
    }
    activeSectionLink = document.getElementById(id + "-link");
    activeSectionLink.classList.add("section-link-active");
    activeSectionLink.style.color = ["lightcoral", "lightblue", "lightgreen"][Math.floor(Math.random() * 3)];

    window.scrollTo(0, 0);
}

let activeDevlogID = null;
let activeDevlog = null;

const allDropdownLinks = document.getElementsByClassName("dropdown-link");

function setActiveDevlog(projectName) {
    if (activeDevlogID === `${projectName}-devlog-listing`) return;
    activeDevlogID = `${projectName}-devlog-listing`;

    if (activeDevlog !== null) activeDevlog.style.display = "none";
    activeDevlog = document.getElementById(activeDevlogID);
    activeDevlog.style.display = "block";

    for (const d of allDropdownLinks) 
        d.textContent = projectName;
}

function addDropdownEvents() {
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

        for (const op of optionPanel.getElementsByTagName("*")) {
            op.addEventListener("click", (e) => {
                optionPanel.style.display = "none";
                setActiveDevlog(op.textContent);     
            })
            op.addEventListener("touchstart", () => {
                optionPanel.style.display = "none";
                setActiveDevlog(op.textContent);                
            }, {passive: true})
        }
    
    }
}

function logBaseN(n, val) {
    return Math.log(val) / Math.log(n);
}

// opacity = (start) * (pace)^(ms passed / delay)
function fadeIn(elem, initialOpacity, rate, delay) {
    const parentID = elem.parentElement.id;
    
    let op = initialOpacity;

    const timer = setInterval(() => {
        const currOp = parseFloat(elem.style.opacity);
        
        if (parentID !== activeSectionID) {
            elem.style.opacity = "0";
            clearInterval(timer);
            return;
        }
        else if (currOp >= 1) {
            elem.style.opacity = "1";
            clearInterval(timer);
            return;
        }
        else {  
            elem.style.opacity = op;
            op *= rate;    
        }
        
    }, delay);

    return timer;
}

const initialOpacity = 0.1;
const rate = 1.2;
const delay = 10

const expectedFinishTime = delay * logBaseN(rate, 1 / initialOpacity);

const waiters = new Set();

function fadeInStartingWith(elem) {
    if (elem == undefined) return;
    elem.style.opacity = 0;

    const timer = fadeIn(elem, initialOpacity, rate, delay);

    // set opacity to 1 after some time
    waiters.add( setTimeout(() => {
        if (elem.style.opacity != "1") {
            elem.style.opacity = "1";
            clearInterval(timer);
        }
    }, expectedFinishTime + 100) );
    setTimeout(() => fadeInStartingWith(elem.nextElementSibling), 50);
}
function fadeInChildren(parentElem) {
    fadeInStartingWith(parentElem.firstElementChild);
}
function setChildrenTransparent(parentElem) {
    for (const child of parentElem.children) 
        child.style.opacity = "0";

    for (const waiter of waiters)
        clearTimeout(waiter);
    waiters.clear();
}

function fetchJSON(filepath, cb) {
    return fetch(filepath)
        .then(response => {
            if (!response.ok)
                throw new Error("response unsuccessful", {cause: response});
            return response;
        })
        .then(response => response.json())
        .then(data => {
            cb(data);
        });
}

function newElement(tag, cls) {
    const res = document.createElement(tag);
    res.classList.add(cls);
    return res;
}

function openTab(link) {
    open(link, "_blank");
}

const projectSection = document.getElementById("projects");

function addIconLink(parentNav, imgsrc, onclick) {
    const iconLink = parentNav.appendChild(newElement("div", "icon-link"));
    iconLink.addEventListener("click", () => { onclick(); });

    iconLink
        .appendChild(document.createElement("img"))
        .src = imgsrc;
}

function addProjectPanel(proj) {
    const panel = projectSection.appendChild(newElement("div", "project-panel"));
    
        const info = panel.appendChild(newElement("div", "project-panel-info"));
            info
                .appendChild(document.createElement("h2"))
                .textContent = proj['name'];

            info
                .appendChild(document.createElement("p"))
                .innerHTML = proj['desc'];                
            
            const divInBottom = info
                .appendChild(newElement("div", "project-panel-bottom"))
                .appendChild(document.createElement("div"));
            
                const iconLinks = divInBottom.appendChild(newElement("nav", "icon-link-nav"));
                for (const i in proj['links']) {
                    addIconLink(iconLinks, proj['link-icons'][i], () => openTab(proj['links'][i]));
                }
                addIconLink(iconLinks, "images/icons/journal.jpg", () => {
                    setActiveSection("devlogs");
                    setActiveDevlog(proj['name']);
                });
        
                divInBottom
                    .appendChild(newElement("p", "date"))
                    .textContent = proj['date'];

        
        const imgElement = panel
                            .appendChild(newElement("div", "project-panel-image"))
                            .appendChild(document.createElement("img"))
        imgElement.src = proj['image-path'];
        imgElement.classList.add("tilt-on-hover");
        
        imgElement.addEventListener("click", () => showEnlargedView(imgElement));

    projectSection
        .appendChild(newElement("div", "divider"))
        .appendChild(document.createElement("div"));
}

const devlogSection = document.getElementById("devlogs");

const dropdowns = document.getElementsByClassName("dropdown-panel");

function addDevlogListing(projName) {
    for (const panel of dropdowns) {
        const option = panel.appendChild(document.createElement("option"));
        option.value = `${projName}-devlog`;
        option.textContent = projName;
    }

    const devlogListing = devlogSection.appendChild(newElement("div", "devlog-listing"));
    devlogListing.id = `${projName}-devlog-listing`;

    return fetchJSON(`data/devlogs/${projName}.json`, (devlogs) => {

        for (const log of devlogs) {
            const entry = devlogListing.appendChild(newElement("div", "devlog-entry"));
            
            entry
                .appendChild(document.createElement("h2"))
                .textContent = log['title'];
            
            const body = entry.appendChild(document.createElement("p"))
            body.innerHTML = log['body'];

            for (const picElement of body.getElementsByTagName("img")) {
                picElement.classList.add("tilt-on-hover");
                picElement.addEventListener("click", () => showEnlargedView(picElement));
            }
    
            entry
                .appendChild(newElement("p", "date"))
                .textContent = log['date'];

            devlogListing
                .appendChild(newElement("div", "divider"))
                .appendChild(document.createElement("div"));
        }


    }).catch((reason) => {
        const doesntExistMsg = devlogListing.appendChild(newElement("p", "devlog-doesnt-exist"));
        doesntExistMsg.textContent = "it seems i haven't written any devlogs for this project yet :c";
        doesntExistMsg.style.marginLeft = "10%";
    });
}


fetchJSON("data/projects.json", (projects) => {
    for (const proj of projects) {
        addProjectPanel(proj);
        addDevlogListing(proj['name']);
    }

    addDevlogListing("my website").then(() => {
        addDropdownEvents();
    
        stackPictures();
        stackSoon();
    
        setActiveSection("home");
        setActiveDevlog("my website");
    })
});


function minIndex(arr) {
    let res = 0;
    let smallest = Number.MAX_VALUE;
    for (const i in arr) {
        if (arr[i] < smallest) {
            smallest = arr[i]
            res = i;
        }
    }
    return res;
}

const picsModal = document.getElementById("pics-modal");
const enlargedPic = document.getElementById("enlarged-pic");

const pictureWidth = 200;
let pictureCols = 0;
const pictureCont = document.getElementById("pics-container");

const pictureNames = [
    "against rainy glass.jpg",
    "under table.jpg",
    "catto.jpg",
    "outside the door.jpg",
    "her new bed.jpg",
    "close.jpg",
    "hnm.jpg",
    "lying down.jpg",
    "on her back.jpg",
    "paw cleaning.jpg",
    "wants to leave.jpg",
    "sitting on couch.jpg",
    "sitting.jpg",
    "staring.jpg",
    "stomach.jpg",
    "upright.jpg"
]

const main = document.getElementById("main");

function showEnlargedView(picElement) {
    picsModal.style.display = "flex";
    enlargedPic.src = picElement.src;

    if ((picElement.naturalWidth / window.innerWidth) < (picElement.naturalHeight / window.innerHeight)) {
        enlargedPic.style.width = "auto";
        enlargedPic.style.height = `calc(${window.innerHeight}px - 20%)`;
    } else {
        enlargedPic.style.width = `calc(${window.innerWidth}px - 20%)`;
        enlargedPic.style.height = "auto";
    }
}

function stackPictures() {

    const newCols = Math.floor(main.clientWidth / pictureWidth);

    if (pictureCols != newCols) {

        pictureCols = Math.max(newCols, 1);
        pictureCont.style.gridTemplateColumns = `repeat(${newCols}, 1fr)`;
        
        pictureCont.replaceChildren();

        const flexBoxes = Array.apply(null, new Array(pictureCols));
        for (const i in flexBoxes) {
            flexBoxes[i] = newElement("div", "pic-column");
            pictureCont.appendChild(flexBoxes[i]);
        }
        const heights = new Array(pictureCols).fill(0);
        
        
        for (const name of pictureNames) {
            
            const picElement = document.createElement("img");
            picElement.src = "images/pics/" + name;
            picElement.classList.add("pic")

            picElement.onload = () => {
                const i = minIndex(heights);
                flexBoxes[i].appendChild(picElement);

                // calculating client height of picture, since picElement.clientHeight is 0 for some reason
                heights[i] += (main.clientWidth / pictureCols) * picElement.naturalHeight / picElement.naturalWidth; 
                picElement.classList.add("tilt-on-hover");
                picElement.addEventListener("click", () => showEnlargedView(picElement));
            }
            
        }
    }
}

function stackSoon() {
    if (pictureCols === 0) {
        console.log("retrying stacking pictures..");
        stackPictures();
        setTimeout(() => {stackSoon()}, 200);
    }   
}

        
window.addEventListener("resize", () => { stackPictures(); });

picsModal.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) 
        picsModal.style.display = "none";
})

const discordIconDiv = document.getElementById("discord-icon-div");
const discordCopyMsg = document.getElementById("discord-copy-tooltip");
discordIconDiv.addEventListener("click", () => {
    navigator.clipboard.writeText("fiuu_");
    discordCopyMsg.innerText = "copied!"
})
discordIconDiv.addEventListener("mouseout", (e) => {
    if (!e.currentTarget.matches(":hover"))
        discordCopyMsg.innerText = "fiuu_"
})

const email = document.getElementById("email");
const emailCopied = document.getElementById("email-copied");

let op;
let emailDelay;
let emailFade;

email.addEventListener("click", () => {
    navigator.clipboard.writeText("troylu8@gmail.com");

    if (emailDelay != null) clearTimeout(emailDelay);
    if (emailFade != null)  clearInterval(emailFade);

    emailCopied.style.visibility = "visible";
    emailCopied.style.opacity = "1";
    op = 1;

    emailDelay = setTimeout(() => {

        emailFade = setInterval(() => {

            if (op > 0.01) {
                op *= 0.95;
                emailCopied.style.opacity = op;
            } else {
                clearInterval(emailDelay);
                emailCopied.style.visibility = "hidden";
            }
        }, 10);

    }, 1000);

});

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

const nav = document.getElementById("section-link-nav");

const fadeWidth = 
    parseInt(computed.getPropertyValue("--nav-arrow-size").slice(0, -2)) +
    parseInt(computed.getPropertyValue("--nav-fade-dist").slice(0, -2));

const cont = document.getElementById("section-link-container");
cont.style.height = nav.clientHeight + "px";
window.addEventListener("resize", () => {
    cont.style.height = nav.clientHeight + "px";
})


let scrolling = false;
let pos = fadeWidth;
let lastX = null;

const leftArrow = document.getElementById("nav-left");
const rightArrow = document.getElementById("nav-right");

function startNavScroll() { scrolling = true;}
function endNavScroll() {
    scrolling = false; 
    lastX = null;
}
function scrollNav(x) {
    if (!scrolling || window.innerWidth > 500) return;

    if (lastX == null) { 
        lastX = x;
        return;
    }
    const nowX = x;

    const bounds = [cont.clientWidth - nav.clientWidth - fadeWidth, fadeWidth]
    pos = clamp(pos + (nowX - lastX), bounds[0], bounds[1]);
    leftArrow.style.visibility = (pos === bounds[1])? "hidden" : "visible";
    rightArrow.style.visibility = (pos === bounds[0])? "hidden" : "visible";
    
    nav.style.left = pos + "px";
    
    lastX = nowX;
} 

nav.addEventListener("touchstart", () => { startNavScroll() }, {passive: true});
document.body.addEventListener("touchend", () => { endNavScroll() });
document.body.addEventListener("touchmove", (e) => { scrollNav(e.touches[0].clientX); });

nav.addEventListener("mousedown", () => { startNavScroll() });
document.body.addEventListener("mouseup", () => { endNavScroll() });
document.body.addEventListener("mousemove", (e) => { scrollNav(e.clientX); });