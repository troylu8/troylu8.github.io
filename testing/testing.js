
function func(one) {
    console.log("one " + one);
}
function func(list) {
    console.log(typeof list);
    for (const item of list) {
        console.log(item);
    }
}

func("a");