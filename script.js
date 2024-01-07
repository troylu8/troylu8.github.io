
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
            op.addEventListener("click", () => {
                optionPanel.style.display = "none";
                setActiveDevlog(op.textContent);                
            })
        }
    
    }
}



function fadeIn(elem) {
    const parentID = elem.parentElement.id;
    
    let op = 0.1;

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
            op += op * 0.2;    
        }
        
    }, 10);

    return timer;
}
function fadeInStartingWith(elem) {
    if (elem == undefined) return;
    elem.style.opacity = 0;
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

function addProjectPanel(proj) {
    const panel = projectSection.appendChild(newElement("div", "project-panel"));
    
        const info = panel.appendChild(newElement("div", "project-panel-info"));
            info
                .appendChild(document.createElement("h2"))
                .textContent = proj['name'];

            info
                .appendChild(document.createElement("p"))
                .textContent = proj['desc'];

            const divInBottom = info
                .appendChild(newElement("div", "project-panel-bottom"))
                .appendChild(document.createElement("div"));
            
                const iconLinks = divInBottom.appendChild(newElement("nav", "icon-link-nav"));
                for (const i in proj['links']) {
                    const iconLink = iconLinks.appendChild(newElement("div", "icon-link"));
                    iconLink.addEventListener("click", () => {
                        openTab(proj['links'][i]);
                    })

                    iconLink
                        .appendChild(document.createElement("img"))
                        .src = proj['link-icons'][i];

                }
        
                divInBottom
                    .appendChild(newElement("p", "date"))
                    .textContent = proj['date'];


        panel
            .appendChild(newElement("div", "project-panel-image"))
            .appendChild(document.createElement("img"))
            .src = proj['image-path'];

    projectSection
        .appendChild(newElement("div", "divider"))
        .appendChild(document.createElement("div"));
}


fetchJSON("data/projects.json", (projects) => {


    for (const proj of projects) {
        addProjectPanel(proj);

        for (const panel of document.getElementsByClassName("dropdown-panel")) {
            
            const option = panel.appendChild(document.createElement("option"));
            option.value = `${proj['name']}-devlog`;
            option.textContent = proj['name'];
        }

        const devlogListing = document
                                .getElementById("devlogs")
                                .appendChild(newElement("div", "devlog-listing"))
        devlogListing.id = `${proj['name']}-devlog-listing`;

        fetchJSON(`data/devlogs/${proj['name']}.json`, (devlogs) => {

            for (const log of devlogs) {
                const entry = devlogListing.appendChild(newElement("div", "devlog-entry"));
                
                entry
                    .appendChild(document.createElement("h2"))
                    .textContent = log['title'];
                
                entry
                    .appendChild(document.createElement("p"))
                    .innerHTML = log['body'];
                
                entry
                    .appendChild(newElement("p", "date"))
                    .textContent = log['date'];

                devlogListing
                    .appendChild(newElement("div", "divider"))
                    .appendChild(document.createElement("div"));
            }


        }).then(() => {
            addDropdownEvents();
            setActiveSection("devlogs");
            setActiveDevlog("project1");
        }).catch((reason) => {
            const doesntExistMsg = devlogListing.appendChild(newElement("p", "devlog-doesnt-exist"))
            doesntExistMsg.textContent = "it seems i haven't written any devlogs for this project yet :c";
        })
    }

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

const pics = document.getElementById("image-holder").getElementsByTagName("*");

const main = document.getElementById("main");

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
        
        for (const pic of pics) {
            const i = minIndex(heights);
            const clonedPic = pic.cloneNode(false)
            flexBoxes[i].appendChild(clonedPic);

            // ratio between height and width determines height value, since pic.clientHeight was 0 during the first time this is called
            heights[i] += (pic.naturalHeight / pic.naturalWidth); 


            clonedPic.addEventListener("click", (e) => {
                picsModal.style.display = "flex";
                enlargedPic.src = pic.src;

                if ((pic.naturalWidth / window.innerWidth) < (pic.naturalHeight / window.innerHeight)) {
                    enlargedPic.style.width = "auto";
                    enlargedPic.style.height = (window.innerHeight - 200) + "px";
                } else {
                    enlargedPic.style.width = (window.innerWidth - 200) + "px";
                    enlargedPic.style.height = "auto";
                }
            });
        }
    }
}

window.onload = () => { 
    stackPictures(); 
    stackSoon();
};

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

