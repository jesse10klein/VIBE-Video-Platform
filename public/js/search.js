


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




