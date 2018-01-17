//Loading modules
require("dotenv").config();
var fs = require('fs');
var keys = require("./keys.js");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");
var moment = require("moment");

//Global varibales used :
var wordInput = process.argv;
var movieName = wordInput[3];

//Passing keys from local file
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);
var omdb = keys.omdb;

//Switch Statement to decide what to do
switch (wordInput[2]) {
    case "spotify-this-song":
        songLookup();
        break;
    case "movie-this":
        movieLookup();
        break;
    case "do-what-it-says":
        doAsLiri();
        break;
    case "my-tweets":
        myTweets();
        break;
    default:
        console.log("-----------------------------------------");
        console.log("Please type 'node liri' + one of the following commands:");
        console.log('> spotify-this-song + "song name"');
        console.log('> movie-this + "movie name"');
        console.log('> my-tweets: to view the latest tweets');
        console.log('> do-what-it-says: to view the latest tweets');
}

//Spotify Song Search function

function songLookup() {
    let song = wordInput[3];
    //Check if Search Song is not empty
    if (song != undefined) {
        //Loop thru and build query if more than one word search
        for (let i = 3; i < wordInput.length; i++) {
            if (i > 3 && i < wordInput.length) {
                song = song + " " + wordInput[i];
            } else {
                song = wordInput[3];
            }
        }
        //Replacing the song query by "The Sign" if empty    
    } else {
        song = "The Sign";
    }

    spotify.search({ type: 'track', query: song, limit: 10 }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        //If no results are found
        if (data.tracks.total == 0) {
            console.log("Sorry, no results found!..Try another song");
        }

        let TrackSearchResult = data.tracks.items
        for (let i = 0; i < TrackSearchResult.length; i++) {
            console.log("--------------------");
            console.log("Artist: " + JSON.stringify(TrackSearchResult[i].artists[0].name));
            console.log("Song: " + JSON.stringify(TrackSearchResult[i].name));
            console.log("Preview Link: " + JSON.stringify(TrackSearchResult[i].preview_url));
            console.log("Album: " + JSON.stringify(TrackSearchResult[i].album.name));
        }
    });
}

//OMDB Movie Search function
function movieLookup() {

    // loop magic to handle the inclusion of "+"s
    if (movieName != undefined) {
        for (let i = 3; i < wordInput.length; i++) {
            if (i > 3 && i < wordInput.length) {
                movieName = movieName + "+" + wordInput[i];
            } else {
                movieName += wordInput[i];
            }
        }
    } else {
        movieName = "Mr. Nobody";
        console.log("You didn't provide a movie title, so we searched for 'Mr. Nobody'. Enjoy!")
    }
    // Then run a request to the OMDB API
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + omdb;
    // console.log(queryUrl);
    request(queryUrl, function(error, response, body) {
        // If the request is successful
        if (!error && response.statusCode === 200 && JSON.parse(body).Response == "True") {
            //Display movie info
            console.log("--------------------");
            console.log("Title: " + JSON.parse(body).Title);
            console.log("Released: " + JSON.parse(body).Released);
            console.log("IMDB Rating: " + JSON.parse(body).imdbRating);

            //check if Rotten Tomatoes rating is available
            let Ratings = JSON.parse(body).Ratings;
            for (let i = 0; i < Ratings.length; i++) {
                if (Ratings[i].Source === "Rotten Tomatoes") {
                    console.log("Rotten Tomatoes Rating: " + Ratings[i].Value);
                }
            }
            //Displaying the rest of the info
            console.log("Country where the movie was produced: " + JSON.parse(body).Country);
            console.log("Language(s): " + JSON.parse(body).Language);
            console.log("Plot: " + JSON.parse(body).Plot);
            console.log("Actors: " + JSON.parse(body).Actors);
        } else {
            console.log("Movie not found!...Try another movie title");
        }
    });
}

function doAsLiri() {
    fs.readFile('random.txt', "utf8", (err, data) => {
        if (err) throw err;
        console.log("--------------------");
        console.log(data);
    });
}

//Function to get the tweets
function myTweets() {
    //Getting the results and handling the errors
    client.get('statuses/user_timeline', function(error, tweets, response) {
        if (!error) {

            //Looping throught the resullts
            for (var i = 0; i < tweets.length; i++) {
                console.log("------------------------------ " + "\r\n" +
                    "@" + tweets[i].user.screen_name + ": " +
                    tweets[i].text + "\r\n" +
                    //moment(tweets[i].created_at).format('LLL') + "\r\n"
                    tweets[i].created_at + "\r\n"
                );
                //breaking out of the loop at the 20th tweet
                if (i == 19) {
                    break;
                }
            }
        }
    });
}