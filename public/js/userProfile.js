
window.onresize = resizeContent;
window.onload = resizeContent; 


function resizeContent() {

  console.log("resizing content");

  //Get video and change dimensions
  const content = document.getElementById("content");

  const sidebar_width = 200;

   const width = window.innerWidth - sidebar_width;
   content.style.width = width + "px";

};