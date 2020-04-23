


$("#hot img").hover(function() {
  console.log("Hovering");

  $("#hot img").attr("src", "/images/main-menu/hot-selected.svg");

}, function() {
  console.log("Left");
  $("#hot img").attr("src", "/images/main-menu/hot.svg");

})
