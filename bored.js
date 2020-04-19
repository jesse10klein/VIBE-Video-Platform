import { response } from "express";




function sortSubs() {

    //Get max 100 videos from the last month

    const username = req.session.username;

    //Loop through subscriptions

    const user = await UserInfo.findOne({where: {username}});

    const subscriptions = await subscriptions.findAll({where: {subscriber: username}});


    let subVideos = [];

    for (subscription of subscriptions) {

        //Get uploader
        const uploader = UserInfo.findOne({where: {username: subscription.user}});
        if (uploader == null) {
            console.log("ERROR IN SUBS VIDS SECTION")
            res.send("Error in subs woops");
            return;
        }

        //Get any videos that user has uploaded in the past month
        //For now get all....
        console.log("Need to get only videos from the last month");

        const videos = Video.findAll({where: {uploader}});

        for (video of videos) {
            subVideos.append(video);
        }
    }

    //Now got all videos, need to sort by date



}


function loadOnScroll() {

    //REMINDER. Change video specific to only give first
    //10 comments and first 20 video recs

    /**
     * When scrolling on a video specific page, we want to
     * load more content (video recs, comments)
     * 
     * When user tries to scroll at the bottom, the client will
     * send an ajax request to the server to try and get some
     * more comments
     * 
     * While we are loading more comments, load more video recs
     * if they exist. However, if we are out of comments, do NOT
     * load any more video recs
     * 
     * Create a timeout once the ajax request has been returned
     * (2 seconds) should be good enough
     * Just so that the server isn't being spammed with requests
     */



}