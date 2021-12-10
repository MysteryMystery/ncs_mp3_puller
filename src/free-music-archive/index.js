const axios = require("axios")
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
const fs = require("fs")

const common = require("../common");

const baseUrl = "freemusicarchive.org"
const getMusicPath = "/genre"

const outFolder = "out/freemusicarchive/"

const genres = {
	classical: "Classical",

	death_metal: "Death-Metal",
	metal: "Metal"
}

async function getPage({genre, page}){
	let args = "?sort=date&d=0&pageSize=200&page=" + page
	
	url = "https://" + baseUrl + getMusicPath + "/" + genre + args
	console.log(url)
	let r = await axios.get(url)
	return r.data
}

async function getRelativeUrlsFromPage(htmlstr){
	let html = $($.parseHTML(htmlstr));
	let players = html.find(".play-item")
	return players.map(function() {
		const trackInfo = $(this).data("track-info")
		if (trackInfo) 
			return trackInfo["fileUrl"]
		return undefined
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
		genres.death_metal,
		genres.metal
	];

	await downloadMusic(genres)
}

module.exports = {genres, downloadMusic}