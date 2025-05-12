# genius-api-wrapper

## Basic usage

```js
const genius = new Genius(GENIUS_API_KEY)

const artistId = genius.getArtistId('{artist}').then((res) => {
 return res
})

const songs = await genius.getSongsByArtist(artistId).then((res: Song[]) => {
 return res
})
```

## Exclude terms

To exclude terms in song titles from the search do this:

```js
const excludedTerms = ['remix', 'extended']
genius.addExcludedTerms(excludedTerms)
```
