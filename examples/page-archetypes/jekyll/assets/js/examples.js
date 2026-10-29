/* Framework-neutral progressive enhancement. No remote requests or persistent user data. */
(() => {
  'use strict';
  document.querySelectorAll('[data-demo-fields]').forEach(fieldset => { fieldset.disabled = false; });
  document.querySelectorAll('[data-demo-form]').forEach(form => {
    const status = form.querySelector('[data-form-status]');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      status.textContent = 'Example validated locally. Nothing was sent, saved, or authenticated.';
      // Do not retain even illustrative passwords or verification codes.
      form.querySelectorAll('[type=password], [name=code]').forEach(input => { input.value = ''; });
    });
    // A validation message describes the submitted values, not later edits.
    form.addEventListener('input', () => { status.textContent = ''; });
    form.addEventListener('change', () => { status.textContent = ''; });
    form.addEventListener('reset', () => { status.textContent = ''; });
  });

  document.querySelectorAll('[data-listing]').forEach(listing => {
    const items = [...listing.querySelectorAll('[data-list-item]')];
    const size = Number(listing.dataset.pageSize);
    if (items.length <= size) return;
    const nav = listing.querySelector('nav');
    const previous = nav.querySelector('[data-previous]');
    const next = nav.querySelector('[data-next]');
    let page = 0;
    const render = () => {
      items.forEach((item, index) => { item.hidden = index < page * size || index >= (page + 1) * size; });
      previous.disabled = page === 0;
      next.disabled = (page + 1) * size >= items.length;
      nav.querySelector('[data-page-status]').textContent = `Page ${page + 1} of ${Math.ceil(items.length / size)}`;
    };
    previous.addEventListener('click', () => { page--; render(); if (previous.disabled) next.focus(); });
    next.addEventListener('click', () => { page++; render(); if (next.disabled) previous.focus(); });
    nav.hidden = false;
    render();
  });

  const search = document.querySelector('.example-search');
  if (search) {
    const index = JSON.parse(document.getElementById('example-search-index').textContent);
    const input = search.querySelector('input');
    const results = document.querySelector('[data-search-results]');
    const status = document.querySelector('[data-search-status]');
    const run = () => {
      const query = input.value.trim().slice(0, 200);
      input.value = query;
      const url = new URL(location.href);
      query ? url.searchParams.set('q', query) : url.searchParams.delete('q');
      history.replaceState(null, '', url);
      results.replaceChildren();
      if (!query) { status.textContent = 'Enter a word or phrase to search the collection.'; return; }
      const words = query.toLocaleLowerCase().split(/\s+/u);
      const matches = index.filter(entry => words.every(word => `${entry.title} ${entry.summary} ${entry.category}`.toLocaleLowerCase().includes(word)));
      status.textContent = matches.length ? `${matches.length} result${matches.length === 1 ? '' : 's'} for “${query}”.` : `No results for “${query}”. Try fewer words or browse the example index.`;
      for (const entry of matches) {
        const li = document.createElement('li');
        const body = document.createElement('div');
        const heading = document.createElement('h3');
        const anchor = document.createElement('a');
        anchor.href = entry.url;
        anchor.textContent = entry.title;
        heading.append(anchor);
        const summary = document.createElement('p');
        summary.textContent = entry.summary;
        body.append(heading, summary);
        li.append(body);
        results.append(li);
      }
    };
    input.value = new URL(location.href).searchParams.get('q') || '';
    search.addEventListener('submit', event => { event.preventDefault(); run(); });
    run();
  }

  const dialog = document.querySelector('.example-lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-enlarge]').forEach(anchor => anchor.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const image = dialog.querySelector('img');
      image.src = anchor.href;
      image.alt = anchor.querySelector('img').alt;
      dialog.querySelector('figcaption').textContent = anchor.dataset.caption;
      dialog.showModal();
    }));
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
  }

  document.querySelectorAll('[data-workspace]').forEach(workspace => {
    const records = [...workspace.querySelectorAll('[data-record]')];
    const filter = workspace.querySelector('[data-record-filter]');
    const review = workspace.querySelector('[data-review-record]');
    const reset = workspace.querySelector('[data-reset-workspace]');
    const detail = workspace.querySelector('[data-active-record]');
    const status = workspace.querySelector('[data-workspace-status]');
    const original = records.map(record => record.querySelector('.example-tag').textContent);
    let active = null;
    const count = () => {
      workspace.querySelector('[data-record-count]').textContent = `${records.filter(record => !record.hidden).length} of ${records.length} records shown.`;
    };
    const select = record => {
      active = record;
      records.forEach(item => item.querySelector('button').setAttribute('aria-pressed', String(item === active)));
      detail.replaceChildren();
      for (const source of record.querySelectorAll('button, p, .example-tag')) {
        const p = document.createElement('p');
        p.textContent = source.textContent;
        detail.append(p);
      }
      review.disabled = false;
      status.textContent = `Selected ${record.querySelector('button').textContent}. Changes affect this preview only.`;
    };
    records.forEach(record => {
      const button = record.querySelector('button');
      button.disabled = false;
      button.addEventListener('click', () => select(record));
    });
    filter.disabled = false;
    reset.disabled = false;
    const applyFilter = () => {
      const query = filter.value.trim().toLocaleLowerCase();
      records.forEach(record => { record.hidden = !record.textContent.toLocaleLowerCase().includes(query); });
      count();
      if (active?.hidden) {
        active.querySelector('button').setAttribute('aria-pressed', 'false');
        active = null;
        detail.textContent = 'The selected record is outside this filter. Select a visible record.';
        review.disabled = true;
      }
    };
    filter.addEventListener('input', applyFilter);
    review.addEventListener('click', () => {
      if (!active) return;
      active.querySelector('.example-tag').textContent = 'Reviewed locally';
      select(active); applyFilter();
      if (!active) { status.textContent = 'Marked reviewed in page memory. The record no longer matches this filter. No server record was changed.'; filter.focus(); }
      else status.textContent = 'Marked reviewed in page memory. No server record was changed.';
    });
    reset.addEventListener('click', () => {
      records.forEach((record, i) => { record.querySelector('.example-tag').textContent = original[i]; record.hidden = false; record.querySelector('button').setAttribute('aria-pressed', 'false'); });
      active = null; filter.value = ''; detail.textContent = 'Select a record to inspect it.'; review.disabled = true;
      status.textContent = 'Demonstration reset. No changes were saved.';
      count();
    });
    count();
  });

  const chat = document.querySelector('[data-chat]');
  if (chat) {
    const messages = document.querySelector('[data-messages]');
    const original = [...messages.children].map(node => node.cloneNode(true));
    const input = chat.querySelector('textarea');
    const status = chat.querySelector('[data-chat-status]');
    chat.addEventListener('submit', event => {
      event.preventDefault();
      if (!input.value.trim()) { input.setCustomValidity('Enter a message before adding it.'); input.reportValidity(); return; }
      const item = document.createElement('li');
      const name = document.createElement('strong'); name.textContent = 'You · Local preview';
      const text = document.createElement('p'); text.textContent = input.value.trim();
      item.append(name, text); messages.append(item); input.value = '';
      status.textContent = 'Added to this preview. Not sent to anyone; cleared when you leave or reload.';
      input.focus();
    });
    input.addEventListener('input', () => input.setCustomValidity(''));
    chat.querySelector('[data-clear-chat]').addEventListener('click', () => {
      messages.replaceChildren(...original.map(node => node.cloneNode(true)));
      input.value = ''; input.setCustomValidity(''); status.textContent = 'Conversation reset. Nothing was delivered.';
    });
  }

  document.querySelectorAll('[data-sensors]').forEach(sensors => {
    const mode = sensors.querySelector('select'); const ventilation = sensors.querySelector('input');
    mode.disabled = false; ventilation.disabled = false;
    const update = () => {
      sensors.querySelector('[data-temperature]').textContent = `${mode.value} °C`;
      sensors.querySelector('[data-sensor-status]').textContent = `Simulation updated. Preview ventilation ${ventilation.checked ? 'enabled' : 'disabled'}. No real device is connected.`;
    };
    mode.addEventListener('change', update); ventilation.addEventListener('change', update);
  });
  document.querySelectorAll('[data-scene]').forEach(scene => {
    const select = scene.querySelector('select'); const image = scene.querySelector('img');
    const views = { coast: 'Illustrated coastline with observation markers.', station: 'Stylised field station beside water.', notebook: 'An open field notebook with observation lines.' };
    select.disabled = false;
    select.addEventListener('change', () => {
      if (!Object.hasOwn(views, select.value)) return;
      image.src = new URL(`${select.value}.svg`, image.src).href;
      image.alt = views[select.value];
      scene.querySelector('[data-scene-caption]').textContent = `${select.selectedOptions[0].textContent} · Original fictional illustration.`;
      scene.querySelector('[data-scene-status]').textContent = `Showing ${select.selectedOptions[0].textContent}. No immersive device is connected.`;
    });
  });
})();
