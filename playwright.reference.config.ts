import {defineConfig} from '@playwright/test';
const browserName=process.env.WORKBENCH_BROWSER??'chromium';
if(!['chromium','firefox','webkit'].includes(browserName))throw Error('Unsupported browser');
export default defineConfig({testDir:'tests/reference-browser',outputDir:`test-results/reference-${browserName}`,workers:1,timeout:30000,use:{browserName:browserName as 'chromium'|'firefox'|'webkit',baseURL:'http://127.0.0.1:4189',launchOptions:browserName==='chromium'&&process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--no-sandbox']}:{}},webServer:{command:'node tests/helpers/serve-reference.mjs',url:'http://127.0.0.1:4189/martlet/',reuseExistingServer:false,timeout:10000}});
