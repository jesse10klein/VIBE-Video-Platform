

let fileSize = 0;
let lastLoaded = 0;
let lastTime = 0;
let infoTimer = 0;
let lastInfoTime = 0;

function uploadVideo() {

    var file = document.getElementById("file1").files[0];

    $('#videoError').text("");

    if (file == null) {
      $('#videoError').text("You must select a file to upload");
      return;
    }
    
    if (file.type != "video/mp4") {
      $('#videoError').text("Only mp4 files are acceptable");
      return;
    }

    var formData = new FormData();
	  formData.append("file1", file);
    //alert(file.name+" | "+file.size+" | "+file.type);

    $.ajax({
        url: '/upload/handle-upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(res){
            console.log('upload successful!');
            console.log(res);
            fileSize = 0;
            lastLoaded = 0;
            lastTime = 0;
            infoTimer = 0;
            lastInfoTime = 0;
            $('#up').text("Upload Complete!");
            $('#post-video').css("display", "block");
        },
        xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();
          // listen to the 'progress' event
          xhr.upload.addEventListener('progress', function(evt) {
            if (evt.lengthComputable) {
              // calculate the percentage of upload completed
              var percentComplete = evt.loaded / evt.total;
              percentComplete = parseInt(percentComplete * 100);
              console.log(percentComplete);
              fileSize = evt.total;
              handleUploadInformation(evt.loaded, percentComplete);
              $('#uploading').css("display", "block");
              $('#video-upload').css("display", "none");
              $("#start-upload").css("display", "none");
              $("#pageTitle").css("display", "none");
            }
          }, false);
          return xhr;
        }
      });
}

function handleUploadInformation(amountLoaded, percentComplete) {
  
  const timeRemaining = updateTime(amountLoaded, percentComplete);

  //Update info on the page every second
  const now = new Date()
  infoTimer += now - lastInfoTime;
  lastInfoTime = now;

  if (infoTimer > 1000) {
    infoTimer -= 1000;
    $('.timeLeft').text(timeRemaining );
    $('.percentUploaded').text(percentComplete + "%");
    $('.progress').css('width', percentComplete + "%");
    if (percentComplete == 100) {
      $('#up').text("Processing. This may take a while");
    } else {
      $('#up').text("Uploading");
    }
  }

}

function updateTime(amountLoaded, percentComplete) {

  const now = new Date();
  const timeSinceLast = now - lastTime;
  const loadedSinceLast = amountLoaded - lastLoaded;

  //SPEED IN SECONDS
  const speed = loadedSinceLast / (timeSinceLast/1000);


  const amountLeft = fileSize - amountLoaded;

  const timeRemaining = amountLeft / speed;

  const remaining = "Time Remaining: " + Math.ceil(timeRemaining) + " seconds";

  lastLoaded = amountLoaded;
  lastTime = now;

  return remaining;
}

function parseFormData() {

  //Get form data and send to route... already set up
  //data - title, description, tags, *VIDURL*

  //Need to clear the errors in case
  $('#tagsError').text("");
  $('#descriptionError').text("");
  $('#titleError').text("");

  let data = {};


  data.description = $('#description').val();
  data.tags = $('#tags').val();
  data.title = $('#title').val();
  data.videoURL = $("#file1").get(0).files[0].name;
  
  const url = window.location.pathname + "/post-upload";

  $.ajax({
    url, type: "POST", data,
    success: function(response) {

      //Either going to get back video or errors
      console.log(response);

      //If video, redirect to the video
      if (response.id) {
        window.location = '/video/' + response.id;
        return;
      }
      //Otherwise, handle the errors

      if (response.title) {
        console.log("Setting1")
        $('#titleError').text(response.title);
      }
      if (response.description) {
        console.log("Setting2")
        $('#descriptionError').text(response.description);
      } 
      if (response.tags) {
        console.log("Setting3")
        $('#tagsError').text(response.tags);
      }

    }
  })


}
