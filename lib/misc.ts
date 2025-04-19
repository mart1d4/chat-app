export function earthquake() {
    document.body.classList.add("earthquake");

    setTimeout(() => {
        document.body.classList.remove("earthquake");
    }, 400);
}
