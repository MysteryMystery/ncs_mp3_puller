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

const outFolder = "out/"

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

const fileNameFromUrl = (url) => url.split("/").slice(-1)[0];

async function downloadMP3(url){
	const writer = fs.createWriteStream(outFolder + fileNameFromUrl(url))
	const response = await axios({
	    method: "get",
	    url: url,
	    responseType: "stream"
	})
	response.data.pipe(writer)
		return new Promise((resolve, reject) => {
	    writer.on('finish', resolve)
	    writer.on('error', reject)
	})
}

async function downloadMP3s(urls, force){
	if (!force) 
		urls = urls.filter(url => !fs.existsSync(outFolder + fileNameFromUrl(url)))
	urls.forEach(url => downloadMP3(url))
}

async function main(){
	const wantedGenres = [
		genres.DRUM_AND_BASS,
		genres.BASS,
		genres.CHILL,
		genres.HOUSE
	];

	let pageCount = 0;

	if (!fs.existsSync(outFolder)) 
		fs.mkdir(outFolder, "0777", () => {})

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