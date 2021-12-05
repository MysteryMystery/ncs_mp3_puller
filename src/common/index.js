const axios = require("axios")
const fs = require("fs")

const fileNameFromUrl = (url) => {
	url = url.split("/").slice(-1)[0]
	if (url.endsWith(".mp3")) 
		return url
	return url + ".mp3"
};

async function downloadMP3(url, outFolder){
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

async function downloadMP3s(urls, outFolder, force){
	if (!force) 
		urls = urls.filter(url => !fs.existsSync(outFolder + fileNameFromUrl(url)))
	urls.forEach(url => downloadMP3(url, outFolder))
}

//{name: url, name2: url2}
async function downloadNamedMP3s(namedUrls){

}

module.exports = {downloadMP3, downloadMP3s}