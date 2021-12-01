const axios = require("axios")
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const fs = require("fs")

const genres = require("./genres.json")
const moods = require("./moods.json")

//https://ncs.io/music-search?q=&genre=" + genre + "&mood=" + mood
const baseUrl = "ncs.io"
const getMusicPath = "/music-search"

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
	}).get()
}

async function downloadMP3(url){
	let resp = await axios({
	    method: "get",
	    url: url,
	    responseType: "stream"
	})
	resp.data.pipe(fs.createWriteStream("out/" + url.split("/").slice(-1)[0] + ".mp3"))
}

async function downloadMP3s(urls){
	urls.forEach(url => downloadMP3(url))
}

async function main(){
	let pageCount = 0;

	while(true){
		console.log("Getting page:" + pageCount)
		let page = await getPage({page: pageCount, genre: genres.DRUM_AND_BASS})
		let urls = await getRelativeUrlsFromPage(page)
		if (urls.length === 1) break;

		await downloadMP3s(urls)

		pageCount++;
	}
}

main()