import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { once } from 'node:events';
import { workspace } from './fixtures/carrier-workspace.mjs';
import { loadPlaywright } from '../src/browser.mjs';
import { upgrade } from '../src/config.mjs';
const root=path.resolve(import.meta.dirname,'..');
const run=promisify(execFile);

test('Leads Workspace supports truthful multi-page selection, previews, recovery and guarded deletion', {skip:process.env.FC_BROWSER_TESTS!=='1'}, async t=>{
 const cleanups=[];
 const fixture=await workspace({after:fn=>cleanups.push(fn)});
 const state=upgrade(fixture.state);
 state.campaigns[0].reviewRequired=false;
 state.campaigns[0].name='Internal QA audience';
 state.profiles[0].email='sender@example.com';
 state.suppression['lead0@example.com']='Do not contact';
 const script=`import sys,zipfile
from xml.sax.saxutils import escape
ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main'
def c(col,row,val):return '<c r="'+col+str(row)+'" t="inlineStr"><is><t>'+escape(val)+'</t></is></c>'
cols=['Company','Email','Status','Operating Status','Out of service','City','State','Contact']
rows='<row r="1">'+''.join(c(chr(65+i),1,v) for i,v in enumerate(cols))+'</row>'
for i in range(55):
 vals=['Carrier '+str(i).zfill(3),'lead'+str(i)+'@example.com','new','Active','No','Austin' if i%2 else 'Dallas','TX','Alex '+str(i)]
 rows+='<row r="'+str(i+2)+'">'+''.join(c(chr(65+j),i+2,v) for j,v in enumerate(vals))+'</row>'
with zipfile.ZipFile(sys.argv[1],'w') as z:
 z.writestr('xl/workbook.xml','<workbook xmlns="'+ns+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Leads" sheetId="1" r:id="rId1"/></sheets></workbook>')
 z.writestr('xl/_rels/workbook.xml.rels','<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>')
 z.writestr('xl/worksheets/sheet1.xml','<worksheet xmlns="'+ns+'"><sheetData>'+rows+'</sheetData></worksheet>')`;
 await run(fixture.imports.python,['-c',script,path.join(fixture.dataDir,'leads.xlsx')]);
 await fs.writeFile(path.join(fixture.dataDir,'state.json'),JSON.stringify(state));
 const port=14694,url=`http://127.0.0.1:${port}`;
 const child=spawn(process.execPath,[path.join(root,'src/server.mjs')],{cwd:root,env:{...process.env,PORT:String(port),FC_DATA_DIR:fixture.dataDir,FC_FIREBASE_DISABLE:'1',FC_MONITOR_ENABLED:'0',FC_OPEN_TRACKING_ENABLED:'0',FC_REPLY_CAPTURE_ENABLED:'0',FC_REPLY_AUTO:'0',FC_REPLY_MAILBOXES:'[]'},stdio:['ignore','ignore','pipe']});
 let stderr='',browser;child.stderr.on('data',b=>stderr+=b);
 t.after(async()=>{await browser?.close();if(child.exitCode===null){const done=once(child,'exit');child.kill('SIGTERM');await done;}for(const cleanup of cleanups.reverse())await cleanup();});
 for(let i=0;i<100;i++){if(child.exitCode!==null)throw new Error(stderr);try{if((await fetch(url+'/api/state')).ok)break;}catch{}await new Promise(r=>setTimeout(r,50));}
 const raw=(route,data)=>fetch(url+'/api/'+route,data===undefined?{}:{method:'POST',headers:{'X-FC-Request':'1','Content-Type':'application/json'},body:JSON.stringify(data)});
 const initial=await (await raw('leads?filter=ready')).json();
 assert.equal(initial.total,54);assert.equal(initial.summary.excluded,1);
 const wrong=await raw('delete-leads',{campaignId:'another-campaign',ids:[initial.leads[0].id]});assert.equal(wrong.status,400);assert.match((await wrong.json()).error,/active campaign changed/);
 browser=await loadPlaywright().chromium.launch({channel:process.env.FC_TEST_BROWSER_CHANNEL||'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1050}});const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.message)});
 await page.goto(url+'/#leads');
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('54 matching'));
 assert.match(await page.locator('#leadsOverview').innerText(),/Internal QA audience/);
 const checks=page.locator('#leadRows [data-select]:not(:disabled)');
 await checks.first().check();
 assert(await page.locator('#selectPage').evaluate(el=>el.indeterminate));
 await page.locator('#selectPage').check();
 assert.equal(await checks.evaluateAll(nodes=>nodes.filter(el=>el.checked).length),50);
 assert(await page.locator('#selectPage').isChecked());
 await page.locator('#next').click();
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('51–54'));
 assert.match(await page.locator('#leadsSelectionHint').innerText(),/50 elsewhere/);
 assert.equal(await page.locator('#selectPage').isChecked(),false);
 await checks.first().check();
 assert.match(await page.locator('#leadsSelectionCount').innerText(),/51 selected/);
 await page.locator('#search').fill('Carrier 051');
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('1 matching'));
 assert.match(await page.locator('#leadsSelectionHint').innerText(),/50 elsewhere/);
 await page.locator('#leadsReset').click();
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('54 matching'));
 await page.locator('#leadsReviewBatch').click();
 await page.waitForURL('**/#outreachRunner');assert.equal((await (await raw('state')).json()).job.enabled,false);
 await page.locator('[data-view="leads"]').click();
 await page.locator('#clearSelection').click();assert.match(await page.locator('#leadsSelectionCount').innerText(),/No leads selected/);
 await page.locator('#filter').selectOption('all');
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('55 matching'));
 assert.equal(await page.locator('#leadRows [data-select]:disabled').count(),1);
 await page.locator('#leadRows [data-email-preview]').nth(1).click();
 await page.locator('#leadPreviewDrawer').waitFor({state:'visible'});
 assert.equal(await page.locator('#tabEmailDraft').getAttribute('aria-selected'),'true');await page.locator('#closeDrawerBtn').click();
 await page.locator('#search').fill('do not contact');
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('1 matching'));
 assert.match(await page.locator('#leadRows').innerText(),/Do not contact/);
 await page.locator('#search').fill('nothing matches this');
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('0 matching'));
 await page.getByRole('button',{name:'Show all leads',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('55 matching'));
 // A slow older query must never replace a newer one.
 await page.route('**/api/leads?**',async route=>{const response=await route.fetch();if(new URL(route.request().url()).searchParams.get('q')==='TX')await new Promise(r=>setTimeout(r,700));await route.fulfill({response});});
 const slow=page.waitForRequest(r=>r.url().includes('/api/leads?')&&new URL(r.url()).searchParams.get('q')==='TX');
 await page.locator('#search').fill('TX');await slow;await page.locator('#search').fill('Carrier 002');
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('1 matching'));
 await page.waitForTimeout(900);assert.match(await page.locator('#leadRows').innerText(),/Carrier 002/);assert.doesNotMatch(await page.locator('#leadRows').innerText(),/Carrier 003/);
 await page.unroute('**/api/leads?**');
 await page.route('**/api/leads?**',route=>route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'Synthetic failure'})}));
 await page.locator('#leadsSort').selectOption('company');
 await page.getByRole('button',{name:'Retry',exact:true}).waitFor();assert(await page.locator('#leadRows').evaluate(el=>el.inert));
 await page.unroute('**/api/leads?**');await page.getByRole('button',{name:'Retry',exact:true}).click();
 await page.waitForFunction(()=>!document.querySelector('#leadRows').inert);
 await page.locator('#leadsReset').click();
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('54 matching'));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1050});
  await page.locator('#leadsOverview').scrollIntoViewIfNeeded();
  assert(await page.locator('.app-viewport').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  if(process.env.FC_UI_SCREENSHOT_DIR){await fs.mkdir(process.env.FC_UI_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.FC_UI_SCREENSHOT_DIR,`leads-${width}.png`)});await page.locator('.leads-surface').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.FC_UI_SCREENSHOT_DIR,`leads-table-${width}.png`)});}
 }
 await page.setViewportSize({width:1440,height:1050});
 await page.locator('.leads-tools summary').click();await page.keyboard.press('Escape');assert.equal(await page.locator('.leads-tools').evaluate(el=>el.open),false);
 // Delete only the final page. The server clamps the now-empty last page back to page one.
 await page.locator('#next').click();await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('51–54'));
 await page.locator('#selectPage').check();await page.locator('#deleteSelectedLeads').click();
 await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal((await (await raw('leads?filter=ready')).json()).total,54);
 await page.locator('#deleteSelectedLeads').click();await page.getByRole('button',{name:'Delete 4 leads',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#pageInfo').textContent.includes('1–50 of 50'));
 assert.equal((await (await raw('leads?filter=ready')).json()).total,50);
 assert.match(await page.locator('#leadsSelectionCount').innerText(),/No leads selected/);
 assert.equal(await page.locator('#previous').isDisabled(),true);
 assert.equal(await page.locator('#next').isDisabled(),true);
 assert.equal((await (await raw('state')).json()).suppression['lead0@example.com'],'Do not contact');
 // A row deletion uses its captured campaign and clears identities after workbook row movement.
 await page.locator('#leadRows [data-delete-lead]').first().click();
 await page.getByRole('button',{name:'Cancel',exact:true}).click();
 assert.equal((await (await raw('leads?filter=ready')).json()).total,50);
 await page.locator('#leadRows [data-delete-lead]').first().click();
 await page.getByRole('button',{name:'Delete lead',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#pageInfo')?.textContent.includes('49 matching'));
 assert.equal((await (await raw('leads?filter=ready')).json()).total,49);
 // Reload acknowledges the operation and resets selected row identities.
 await page.locator('#leadRows [data-select]:not(:disabled)').first().check();
 await page.locator('.leads-tools summary').click();
 await page.locator('#reload').click();
 await page.waitForFunction(()=>document.querySelector('#leadsSelectionCount')?.textContent.includes('No leads selected'));
 assert.match(await page.locator('#notice').innerText(),/Workbook reloaded/);
 assert.deepEqual(errors,[]);
});
