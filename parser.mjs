import puppeteer from 'puppeteer';

export default async function parsePlatonus(username, password) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.setDefaultNavigationTimeout(120 * 1000);
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
      await page.goto('https://edu2.aues.kz/v7/#/schedule/studentView')
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      await page.click("#select2-selectTerm-container");
      await page.waitForSelector(".select2-results__options");
      await page.type('.select2-search__field', '2');

      await page.keyboard.press('Enter');
      await new Promise((resolve) => setTimeout(resolve, 3 * 1000));

      let remember = 14;
      let dayCounter = 0;

      const arrayOfDays = [ 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ]


      const schedule = await page.evaluate((remember, dayCounter, arrayOfDays) => {
        const tableRows = document.querySelectorAll('#week .card-body table tbody tr');
        const schedule = [];

        tableRows.forEach((row) => {
          const timeTd = row.querySelector('td:first-child');
          const subjectTd = row.querySelector('td:last-child app-schedule-view-lesson-block div');
                    
          if(remember == 14) {
            schedule.push(arrayOfDays[dayCounter]);
            dayCounter++;
            remember = 0;
          }

          if(remember <= 14) {
            remember++;  
          }

          if (subjectTd && subjectTd.innerText.trim() !== '') {
            schedule.push({
              time: timeTd.innerText,
              subject: subjectTd.innerText.trim(),
            });
          }
        });

        return schedule;
      }, remember, dayCounter, arrayOfDays);

      let outputString = '';

      schedule.forEach(item => {
        if(typeof item === 'string') {
          outputString += `${item}\n`;
        } else {
          outputString += `\nВремя: ${item.time}\nПредмет: ${item.subject}\n`;
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
