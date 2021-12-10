const freemusicarchive = require("./free-music-archive")
const ncs = require("./ncs")

const sites = {
	ncs: {
		genres: [
			ncs.genres.DRUM_AND_BASS,
			ncs.genres.BASS,
			ncs.genres.CHILL,
			ncs.genres.HOUSE
		],
		func: ncs.downloadMusic
	},
	freemusicarchive: {
		genres: [
			freemusicarchive.genres.metal,
			freemusicarchive.genres.death_metal
		],
		func: freemusicarchive.downloadMusic
	}
}

async function downloadMusic(sites){
	for (const [key, value] of Object.entries(sites)){
		value.func(value.genres)
	}
}

downloadMusic(sites)