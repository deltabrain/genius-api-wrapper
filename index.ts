import axios from 'axios'
import { extractLyrics } from './lib/utils/extractLyrics'
import type { Song } from './lib/utils/types'
export type { Song } from './lib/utils/types'

export class Genius {
	searchUrl = 'https://api.genius.com/search?q='
	songSearchUrl = 'https://api.genius.com/songs/'
	artistSearchUrl = 'https://api.genius.com/artists/'
	excludedTerms: string[] = []
	apiKey: string

	constructor(api_key: string) {
		this.apiKey = api_key
	}

	addExcludedTerms(terms: string[]) {
		for (const term of terms) {
			this.excludedTerms.push(term)
		}
	}

	async getArtistId(artist: string): Promise<number> {
		const reqUrl = `${this.searchUrl}${artist}&access_token=${this.apiKey}`

		let { data } = await axios.get(reqUrl).then(({ data }) => {
			return { data }
		})

		if (data.response.hits.length === 0) return 0

		const res = data.response.hits[0].result.primary_artist.id

		return res
	}

	async getSongsByArtist(artist: number): Promise<Song[]> {
		const songs: Song[] = []
		var nextPageExists = true
		var page = 1
		var skippedSongs = 0

		while (nextPageExists == true) {
			const reqUrl = `${this.artistSearchUrl}${artist}/songs?per_page=50&page=${page}&access_token=${this.apiKey}`

			let { data } = await axios.get(reqUrl).then(({ data }) => {
				return { data }
			})

			if (data.response.songs.length == 0) nextPageExists = false

			for (const song of data.response.songs) {
				var shouldSkip = false

				if (song.primary_artist.id != artist) {
					shouldSkip = true
				}

				for (const term of this.excludedTerms) {
					if (song.title.toLowerCase().includes(term)) {
						shouldSkip = true
						skippedSongs++
					}
				}

				if (!shouldSkip) {
					const {
						id,
						primary_artist_names,
						release_date_components,
						title_with_featured,
						url,
					} = song
					songs.push({
						id,
						artist: primary_artist_names,
						title: title_with_featured,
						release_year: release_date_components.year,
						url,
					})
				}
			}

			page++
		}

		console.log(songs.length + ' songs found!')
		return songs
	}

	async getSongById(songId: number): Promise<Song> {
		const reqUrl = `${this.songSearchUrl}${songId}?&access_token=${this.apiKey}`

		let { data } = await axios.get(reqUrl).then(({ data }) => {
			return { data }
		})

		if (data.length === 0) throw 'Invalid Song Id'

		const { id, primary_artist_names, release_date, title_with_featured, url } =
			data.response.song

		return {
			id,
			artist: primary_artist_names,
			release_year: release_date.slice(0, 4),
			title: title_with_featured,
			url,
		}
	}

	async getSong(title: string, artist: string): Promise<Song | string> {
		const reqUrl = `${this.searchUrl}${encodeURI(title + ' ' + artist)}&access_token=${this.apiKey}`

		let { data } = await axios.get(reqUrl).then(({ data }) => {
			return { data }
		})

		if (data.response.hits.length === 0) return 'Could not find song'

		const {
			id,
			primary_artist_names,
			release_date_components,
			title_with_featured,
			url,
		} = data.response.hits[0].result

		return {
			id,
			artist: primary_artist_names,
			release_year: release_date_components.year,
			title: title_with_featured,
			url,
		}
	}

	async getLyrics(url: string): Promise<string> {
		const lyrics = await extractLyrics(url).then((res) => {
			return res
		})

		return lyrics
	}
}
