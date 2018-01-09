//Loading modules
require("dotenv").config();
var fs = require('fs');
var keys = require("./keys.js");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require("request");

// var inquirer = require("inquirer");

//Global varibales used :
var wordInput = process.argv;
var movieName = "";

//Passing keys from local file
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);



//Switch Statement to decide what to do
switch (wordInput[2]) {
    case "spotify-this-song":
        songLookup();
        break;
    case "movie-this":
        movieLookup();
        break;
    default:
        console.log("-----------------------------------------");
        console.log("Please type 'node liri' + one of the following commands:");
        console.log('> spotify-this-song + "song name"');
        console.log('> movie-this + "movie name"');
        console.log('> my-tweets: to view the latest tweets');
        console.log('> do-what-it-says: to view the latest tweets');
}

//Spotify Search function

function songLookup() {

    spotify.search({ type: 'track', query: wordInput[3], limit: 10 }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        let TrackSearchResult = data.tracks.items

        // console.log(JSON.stringify(TrackSearchResult, null, 2));


        for (let i = 0; i < TrackSearchResult.length; i++) {
            console.log("--------------------");
            console.log("Artist: " + JSON.stringify(TrackSearchResult[i].artists[0].name));
            console.log("Song: " + JSON.stringify(TrackSearchResult[i].name));
            console.log("Preview Link: " + JSON.stringify(TrackSearchResult[i].preview_url));
            console.log("Album: " + JSON.stringify(TrackSearchResult[i].album.name));
        }

    });

}

function movieLookup() {

    // And do a little for-loop magic to handle the inclusion of "+"s
    for (let i = 3; i < wordInput.length; i++) {
        if (i > 3 && i < wordInput.length) {
            movieName = movieName + "+" + wordInput[i];
        } else {
            movieName += wordInput[i];
        }
    }
    // Then run a request to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
    // This line is just to help us debug against the actual URL.
    console.log(queryUrl);
    request(queryUrl, function(error, response, body) {
        // If the request is successful
        if (!error && response.statusCode === 200 && JSON.parse(body).Response == "True") {
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