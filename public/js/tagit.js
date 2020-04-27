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