
var isMobile = false;
export const checkMobile = () => {
    const width = window.innerWidth
    isMobile = width <= 768  // Element Plus 的 sm 断点是 768px
    return isMobile;
}