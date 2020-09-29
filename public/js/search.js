


const searchFilters = document.getElementById('filterOptions');
const searchSort = document.getElementById('filterType');

function filterSearch() {
  const searchTerm = $("#search-query").val();
  window.location.pathname = "/search/" + searchTerm + "/" + searchFilters.value + "/" + searchSort.value; 
}

searchFilters.addEventListener("change", function () {
  filterSearch();
});

searchSort.addEventListener("change", function () {
  filterSearch();
});

window.onload = animateVideos; 
 
function animateVideos() {
  sidebarVideos = document.querySelectorAll('.sidebar-video');
  for (let i = 0; i < sidebarVideos.length; i++) {
    $(sidebarVideos[i]).hover(function() {
      sidebarVideos[i].play();
    }, function() {
      sidebarVideos[i].pause();
    })
 }
}




