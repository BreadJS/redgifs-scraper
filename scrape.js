const puppeteer = require('puppeteer');
const fs = require('fs');

let compareData = "";
let usernames = [
                "niches/cumshots",
                "users/Hunganduncut1",
                ];
let nichesLimit = 30;
let scrollingAmount = 0;

(async () => {
  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  const browser = await puppeteer.launch({ headless: false }); // new

  /* Loop over accounts or niches */
  for(let i = 0; i < usernames.length; i++) {
    scrollingAmount = 0;
    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle0' });

    await page.goto(`https://www.redgifs.com/${usernames[i]}`);
    await navigationPromise;

    /* Scroll down until data is the same */
    console.log(`[${i+1}/${usernames.length}] [${usernames[i]}] Scrolling until data is the same`);
    let dataSame = false;
    while(!dataSame) {
      /* Scroll down */
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      /* Get data */
      const html = await page.content();
      
      /* Function to save */
      async function saveData() {
        console.log(`[${i+1}/${usernames.length}] [${usernames[i]}] Data is the same. Saving links...`);

        /* Getting all links */
        await page.waitForSelector('a');
        const links = await page.evaluate(() => {
          const targetString = '/watch/';
          const anchorTags = Array.from(document.querySelectorAll('a'));
          const filteredLinks = anchorTags.filter(tag => tag.href.includes(targetString));
          return filteredLinks.map(tag => tag.href.replace(";order=new", ""));
        });

        /* Save all links to file */
        fs.writeFile(`text_outputs/${usernames[i].split('/')[1]}.txt`, links.join('\n'), (err) => {
          if (err) {
            console.error('Error writing to file:', err);
          } else {
            console.log(`[${i+1}/${usernames.length}] [${usernames[i]}] Links are saved to file`);
          }
        });

        /* Close page */
        page.close();
      }
      /* Compare data */
      if(html == compareData) {
        dataSame = true;
        saveData();
      } else {
        compareData = html;
        scrollingAmount++;

        /* Apply scrolling limit on niches */
        if(usernames[i].split('//')[0] == "niches") {
          if(nichesLimit == scrollingAmount) {
            dataSame = true;
            saveData();
          }
        }
      }
      await delay(1000);
    }
  }

  /* Close browser */
  browser.close();
})();