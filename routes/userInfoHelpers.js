
const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;
const { videoVotes } = db.models;

//GETS THE VIDEOS VOTED BY THE USER
//STATUS: 1 == like, 2 == dislike
async function getVotes(user, status) {
    try {
        const votes = await videoVotes.findAll({
            where: { user, status },
            order: [["createdAt", "DESC"]]
        });
    
        //MAKE LIST OF VIDEOS CORRESPONDING TO THAT
        let videos = [];
    
        for (let i = 0; i < votes.length; i++) {
            const video = await Video.findOne({where: {id: votes[i].videoID}});
            if (!(video == null)) {
                videos.push(video);
            } else {
                console.log("THERE IS A VOTE IN DB FOR A VIDEO THAT DOES NOT EXIST");
            }
        }
        return videos;
      } catch(error) {
        console.log(error.message);
      }
}

//GETS THE SUBS
//STATUS: 1 == Subscribers, 2 == Subscribed to
async function getSubs(user, status) {
    try {

        
        const usernames = [];
        if (status == 1) {
            const subs = await Subscriptions.findAll({where: {user}});
            for (let i = 0; i < subs.length; i++) {
                usernames.push(subs[i].subscriber);
            }
        } else {
            const subs = await Subscriptions.findAll({where: {subscriber: user}});
            for (let i = 0; i < subs.length; i++) {
                usernames.push(subs[i].user);
            }
        }

        //Go through subs and get their profile
        const users = [];

        for (let i = 0; i < usernames.length; i++) {
            const user = await UserInfo.findOne({where: {username: usernames[i]}});
            if (!(user == null)) {
                users.push(user);
            } else {
                console.log("THERE IS A SUB IN THE DB FOR A USER THAT DOESN'T EXIST");
            }
        }
        return users;
      } catch(error) {
        console.log(error.message);
      }
}

module.exports = {getVotes, getSubs};