const axios = require("axios")
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const fs = require("fs")

const genres = require("./genres.json")
const moods = require("./moods.json")
const common = require("../common");

//https://ncs.io/music-search?q=&genre=" + genre + "&mood=" + mood
const baseUrl = "ncs.io"
const getMusicPath = "/music-search"

const outFolder = "out/ncs/"

async function getPage({mood, genre, page}){
	let args = []

	if (mood) args.push("mood=" + mood);
	if (genre) args.push("genre=" + genre);
	if (page) args.push("page=" + page);

	let strArgs = args.join("&")
	
	url = "https://" + baseUrl + getMusicPath + "?" + strArgs
	let r = await axios.get(url)
	return r.data
}

async function getRelativeUrlsFromPage(htmlstr){
	let html = $($.parseHTML(htmlstr));
	let players = html.find(".player-play")
	return players.map(function() {
		return $(this).data("url")
	}).get().filter(url => url)
}

async function downloadMusic(wantedGenres){
	if (!fs.existsSync(outFolder)) 
		fs.mkdir(outFolder, "0777", () => {})

	for(const genre of wantedGenres){
		console.log("Getting genre: " + genre)
		let pageCount = 0;
		while(true){
			console.log("Getting page:" + pageCount)
			let page = await getPage({page: pageCount, genre: genre})
			let urls = await getRelativeUrlsFromPage(page)

			if (urls.length === 1) break;

			await common.downloadMP3s(urls, outFolder)

			pageCount++;
		}
	}
}

async function main(){
	const wantedGenres = [
		genres.DRUM_AND_BASS,
		genres.BASS,
		genres.CHILL,
		genres.HOUSE
	];

	await downloadMusic(wantedGenres)
}

module.exports = {downloadMusic, genres}