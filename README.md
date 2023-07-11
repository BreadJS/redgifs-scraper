# redgifs-scraper
I wrote a small script that can scrape images and videos from RedGifs.com. I did not clean up any code, it works and that is it. Cleanup will be done later.

# Installation
```bash
npm i
```

# Usage
1. Scrape all the video/image url's by putting a username or niche in the `username` array inside `scrape.js`.
2. Open a command prompt and run `node scrape.js`
3. When finished, the usernames and niches will be in `text_ouputs` and are ready to be downloaded. Now run `node download.js <INSTANCES>`. Replace `<INSTANCES>` with the amount of instances you want to run at the same time. The more instances, the more internet bandwith it is going to require. Using a too high instance number can result in timeout errors.
4. Now it will download all the videos/images to the `downloads` folder.

# Troubleshoot
In case the download process does NOT work. Please try to update [yt-dlp](https://github.com/yt-dlp/yt-dlp) that is included in this repo.

# Credits
Thanks to [yt-dlp](https://github.com/yt-dlp/yt-dlp) we were able to make this happen