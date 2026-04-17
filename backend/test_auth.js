const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });

  console.log('Page loaded. Clicking Sign up tab...');
  await page.click('button[data-tab="signup"]');
  
  const signupVisible = await page.$eval('#signup-form', el => window.getComputedStyle(el).display !== 'none');
  console.log('Signup form visible:', signupVisible);
  
  console.log('Clicking Sign in tab...');
  await page.click('button[data-tab="signin"]');

  console.log('Filling sign in form...');
  await page.type('#signin-email', 'admin@eiximara.com');
  await page.type('#signin-password', 'admin123');

  console.log('Submitting form natively...');
  await page.click('#signin-form button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(e => console.log('Navigation timeout or failed'));
  
  console.log('Current URL:', page.url());

  await browser.close();
})();
