export type Song = {
	id: number
	artist: string
	title: string
	url: string
	lyrics?: string | string[] | null
}

export type Artist = {
	id: number
	artistName: string
}
