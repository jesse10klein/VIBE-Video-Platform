



$(document).ready(function() {
  $("#myTags").tagit();
});

$("#myTags").tagit({
  availableTags: ["music", "live"],
  readOnly: false,    
  caseSensitive: false,
  allowSpaces: true,
  tagLimit: 10,
});




function checkFormData() {

  //Get form data and send to route... already set up
  //data - title, description, tags, *VIDURL*

  //Need to clear the errors in case
  $('#tagsError').text("");
  $('#descriptionError').text("");
  $('#titleError').text("");

  let data = {};

  data.description = $('#description').val();
  data.tags = parseTags();
  data.title = $('#title').val();
  
  const url = window.location.pathname;

  $.ajax({
    url, type: "POST", data,
    success: function(response) {

      //Either going to get back video or errors
      console.log(response );
      if (response == "OK") {
        $("#titleError").text("The video information has been updated!");
        return;
      }

      //Otherwise, handle the errors
      if (response.title) {
        $('#titleError').text(response.title);
      }
      if (response.description) {
        $('#descriptionError').text(response.description);
      } 
      if (response.tags) {
        $('#tagsError').text(response.tags);
      }

    }
  })
}