import csv, json, os, re, sys, time, hashlib
from collections import deque
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'outputs', 'partner-import')
os.makedirs(OUT, exist_ok=True)
STATE_PATH = os.path.join(OUT, 'import_state.json')
CSV_PATH = os.path.join(OUT, 'ethiopages_addisbiz_2merkato_drafts.csv')
APP_DATA_PATH = os.path.join(ROOT, 'app', 'data', 'publicDiscovery.json')
LOG_PATH = os.path.join(OUT, 'import.log')
USER_AGENT = 'EthioPages authorized directory importer/0.1'
HEADERS = {'User-Agent': USER_AGENT, 'Accept-Language': 'en,am;q=0.9'}
FIELDS = ['external_id','name','category','subcategory','description','city','region','neighborhood','address','landmark','latitude','longitude','phone','whatsapp','telegram','email','website','facebook','instagram','tiktok','opening_hours','price_range','services','amenities','image_url_1','image_url_2','image_url_3','image_credit','google_maps_url','tripadvisor_url','rating','review_count','source','source_url','verified','status','featured']
SEEDS = [('AddisBiz', 'https://addisbiz.com/business-directory/'), ('2merkato', 'https://www.2merkato.com/directory/')]
MAX_PAGES = int(os.environ.get('ETHIOPAGES_MAX_PAGES', '100000'))
DELAY = float(os.environ.get('ETHIOPAGES_DELAY', '0.8'))

def log(message):
    line = time.strftime('%Y-%m-%d %H:%M:%S') + ' ' + message
    print(line, flush=True)
    with open(LOG_PATH, 'a', encoding='utf-8') as f: f.write(line + '\n')

def load_state():
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH, encoding='utf-8') as f: return json.load(f)
    return {'queue': [{'source': s, 'url': u} for s, u in SEEDS], 'seen': [], 'records': [], 'errors': []}

def save_state(state):
    state_tmp = STATE_PATH + '.tmp'; csv_tmp = CSV_PATH + '.tmp'; app_tmp = APP_DATA_PATH + '.tmp'
    with open(state_tmp, 'w', encoding='utf-8') as f: json.dump(state, f, ensure_ascii=False)
    os.replace(state_tmp, STATE_PATH)
    with open(csv_tmp, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS); writer.writeheader(); writer.writerows(state['records'])
    os.replace(csv_tmp, CSV_PATH)
    # Keep the complete crawl in the state/CSV outputs. The client-side preview
    # must stay small enough for Vinext's worker bundle and HMR renderer.
    with open(app_tmp, 'w', encoding='utf-8-sig') as f: json.dump(state['records'][:120], f, ensure_ascii=False)
    os.replace(app_tmp, APP_DATA_PATH)

def clean(value): return re.sub(r'\s+', ' ', value or '').strip()
def absolute(url, base): return urljoin(base, url).split('#')[0]
def same_host(url, host): return urlparse(url).netloc.endswith(host)
def text(node): return clean(node.get_text(' ', strip=True)) if node else ''

def add_record(state, source, url, soup, title, description='', category=''):
    body = text(soup.select_one('main') or soup.select_one('#content') or soup.body)
    phone = next(iter(re.findall(r'(?:\+251|0)(?:[\s-]?\d){8,12}', body)), '')
    emails = re.findall(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}', body, re.I)
    links = [a.get('href','') for a in soup.select('a[href]')]
    website = next((x for x in links if x.startswith('http') and urlparse(x).netloc not in ('addisbiz.com','www.addisbiz.com','2merkato.com','www.2merkato.com')), '')
    images = []
    for img in soup.select('img[src]'):
        src = absolute(img.get('src'), url)
        if src.startswith('http') and src not in images and 'logo' not in src.lower(): images.append(src)
    external = hashlib.sha1((source + '|' + url).encode()).hexdigest()[:16]
    name = clean(title) or clean(soup.title.get_text()) if soup.title else url
    city = 'Addis Ababa' if 'addis' in body.lower() else ''
    record = dict.fromkeys(FIELDS, '')
    record.update({'external_id': source.upper() + '-' + external, 'name': name, 'category': category or 'Other', 'description': clean(description)[:800], 'city': city, 'phone': phone, 'email': emails[0] if emails else '', 'website': website, 'image_url_1': images[0] if images else '', 'image_url_2': images[1] if len(images)>1 else '', 'image_url_3': images[2] if len(images)>2 else '', 'image_credit': source, 'source': source, 'source_url': url, 'verified': 'no', 'status': 'draft', 'featured': 'no'})
    key = (record['name'].lower(), record['city'].lower(), record['phone'])
    if record['name'] and not any((r['name'].lower(), r['city'].lower(), r['phone']) == key for r in state['records']): state['records'].append(record)

def discover_links(source, url, soup):
    out=[]; host='addisbiz.com' if source=='AddisBiz' else '2merkato.com'
    for a in soup.select('a[href]'):
        link=absolute(a.get('href'), url)
        if not same_host(link, host): continue
        path=urlparse(link).path
        if source=='AddisBiz':
            if '/business-directory/' in path and path.rstrip('/') != '/business-directory': out.append(link)
        else:
            if path.startswith('/directory/') and path.rstrip('/') != '/directory': out.append(link)
    return list(dict.fromkeys(out))

def is_detail(source, url):
    path=urlparse(url).path.rstrip('/')
    if source=='2merkato': return bool(re.match(r'^/directory/\d+-', path))
    parts=[p for p in path.split('/') if p]
    return len(parts)>=3 and parts[0]=='business-directory'

def category_from(url, soup):
    crumb = soup.select_one('.breadcrumbs, .breadcrumb, .entry-title, h1')
    return text(crumb).replace('Companies in Ethiopia','').replace('Business Directory','').strip()

def main():
    state=load_state(); state['seen']=list(dict.fromkeys(state.get('seen', []))); queue=deque(state.get('queue', [])); processed=0
    session=requests.Session(); session.headers.update(HEADERS)
    while queue and processed < MAX_PAGES:
        item=queue.popleft(); source=item['source']; url=item['url']
        if url in state['seen']: continue
        state['seen'].append(url); processed += 1
        try:
            response=session.get(url, timeout=30); response.raise_for_status()
            soup=BeautifulSoup(response.text, 'html.parser')
            if is_detail(source, url):
                title = text(soup.select_one('h1, .entry-title, .page-header h2'))
                description = text(soup.select_one('.description, .entry-content, .item-description, .post-content'))
                add_record(state, source, url, soup, title, description, category_from(url, soup))
            for link in discover_links(source, url, soup):
                if link not in state['seen'] and len(queue) < MAX_PAGES*2: queue.append({'source':source,'url':link})
            if processed % 25 == 0: save_state(state); log(f'processed={processed} queued={len(queue)} records={len(state["records"])} source={source}')
        except Exception as exc:
            state['errors'].append({'source':source,'url':url,'error':str(exc)})
            log(f'error source={source} url={url} error={exc}')
        time.sleep(DELAY)
    state['queue']=list(queue); save_state(state); log(f'finished processed={processed} remaining={len(queue)} records={len(state["records"])} errors={len(state["errors"])}')

if __name__ == '__main__': main()
