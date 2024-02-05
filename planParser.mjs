import puppeteer from 'puppeteer';

export default async function parsePlan(username, password) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.setDefaultNavigationTimeout(60 * 1000);
    await page.goto('https://edu2.aues.kz/index?sid=null&returnUrl=%2Ftemplate.html%23%2Fwelcome');

    await page.waitForSelector("#login_input");
    await page.type("#login_input", username);

    await page.waitForSelector("#pass_input");
    await page.type("#pass_input", password);

    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const isLoggedIn = await page.evaluate(() => {
        return window.location.href === 'https://edu2.aues.kz/v7/#/main-event/view';
    });

    if (isLoggedIn) {
      const url = "https://edu2.aues.kz/indcur";
      await page.goto(url);

      console.log("page loading started");
      
      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));

      console.log('the page was loaded')

      await page.waitForSelector("[id^=select2-termNumber]");
      await page.click("[id^=select2-termNumber]");
      await page.waitForSelector(".select2-results__options");
      await page.type('.select2-search__field', '2');
      

      await page.keyboard.press('Enter');
      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));

      const subjects = await page.evaluate(() => {
        const subjectRows = Array.from(document.querySelectorAll('tbody tr'));
      
        return subjectRows.map(row => {
          const tdList = Array.from(row.querySelectorAll('td'));
      
          if (tdList.length === 11) {
            const subjectName = tdList[3].textContent.trim();
            const teacherName = tdList[7].textContent.trim();
            return {name: subjectName, teacher: teacherName };
          } else {
            return {};
          }
        });
      });
      
      let outputString = '';

      subjects.forEach(item => {
        if (Object.keys(item).length > 0) {
          outputString += `\nПредмет: ${item.name}\nПреподаватель: ${item.teacher}\n`;
        }
      });

      console.log(outputString);
      return outputString;  
    } else {
        console.log('login failed, looser');
    }
  } catch (error) {
      console.error(error);
  } finally {
      await browser.close();
  }
}
