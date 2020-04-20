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