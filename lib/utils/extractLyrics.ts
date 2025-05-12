import axios from 'axios'
import * as cheerio from 'cheerio'

export async function extractLyrics(url: string) {
	let { data } = await axios
		.get(url)
		.then(({ data }) => {
			return { data }
		})
		.catch((error) => {
			throw error
		})

	const $ = cheerio.load(data)

	let lyrics = $('div[class="lyrics"]').text().trim()

	if (!lyrics) {
		lyrics = ''
		$('div[class^="Lyrics__Container"]').each((_i, elem) => {
			if ($(elem).text().length !== 0) {
				let snippet = $(elem)
					.html()!
					.replace(/<br>/g, '\n')
					.replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '')
				lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n'
			}
		})
	}

	if (!lyrics) return ''
	return lyrics.trim()
}
