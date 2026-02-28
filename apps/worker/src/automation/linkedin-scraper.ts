import { chromium, Browser, Page } from 'playwright';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LinkedInScraper {
    async searchJobs(keywords: string, location: string) {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        // Human-like behavior: randomized viewport
        await page.setViewportSize({
            width: 1280 + Math.floor(Math.random() * 100),
            height: 720 + Math.floor(Math.random() * 100)
        });

        try {
            // Navigate to LinkedIn search (this is a simplified example, actual search requires auth or public page handling)
            const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
            await page.goto(searchUrl, { waitUntil: 'networkidle' });

            // Randomized scrolling
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await page.waitForTimeout(1000 + Math.random() * 2000);

            const jobs = await page.evaluate(() => {
                const jobElements = document.querySelectorAll('.job-search-card');
                return Array.from(jobElements).map(el => ({
                    externalJobId: el.getAttribute('data-entity-urn')?.split(':').pop() || '',
                    title: el.querySelector('.base-search-card__title')?.textContent?.trim() || '',
                    company: el.querySelector('.base-search-card__subtitle')?.textContent?.trim() || '',
                    location: el.querySelector('.job-search-card__location')?.textContent?.trim() || '',
                    url: (el.querySelector('.base-card__full-link') as HTMLAnchorElement)?.href || '',
                }));
            });

            return jobs;
        } finally {
            await browser.close();
        }
    }

    async getJobDetails(url: string) {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        try {
            await page.goto(url, { waitUntil: 'networkidle' });
            const description = await page.locator('.description__text').innerText();
            return { description };
        } finally {
            await browser.close();
        }
    }
}
