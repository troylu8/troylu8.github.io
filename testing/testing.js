
function getJSON(filepath, cb) {
    fetch(filepath)
        .then(res => res.json())
        .then(data => {
            cb(data);
        })
}

getJSON("test.json", (data) => {
    console.log("aaa");
    console.log(data);
})
