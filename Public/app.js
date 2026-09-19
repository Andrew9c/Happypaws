(function(){

  function fmt(n){ return '$' + n.toLocaleString('en-US'); }

  const ART = {
    'Dogs': `<svg viewBox="0 0 100 100" role="img" aria-label="Dog"><circle cx="50" cy="58" r="28" fill="var(--p1)"/><ellipse cx="26" cy="34" rx="9" ry="15" fill="var(--p1)" transform="rotate(-25 26 34)"/><ellipse cx="74" cy="34" rx="9" ry="15" fill="var(--p1)" transform="rotate(25 74 34)"/><ellipse cx="50" cy="68" rx="15" ry="11" fill="var(--p2)"/><circle cx="42" cy="52" r="4" fill="var(--navy)"/><circle cx="58" cy="52" r="4" fill="var(--navy)"/><ellipse cx="50" cy="70" rx="4.5" ry="3.2" fill="var(--navy)"/><path d="M43 76 Q50 80 57 76" stroke="var(--navy)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    'Cats': `<svg viewBox="0 0 100 100" role="img" aria-label="Cat"><path d="M28 22 L38 46 L20 44 Z" fill="var(--p1)"/><path d="M72 22 L80 44 L62 46 Z" fill="var(--p1)"/><circle cx="50" cy="58" r="27" fill="var(--p1)"/><ellipse cx="50" cy="67" rx="13" ry="9" fill="var(--p2)"/><circle cx="42" cy="54" r="3.6" fill="var(--navy)"/><circle cx="58" cy="54" r="3.6" fill="var(--navy)"/><path d="M50 66 l-4 -4 h8 z" fill="var(--navy)"/><path d="M18 62 L34 60 M18 68 L34 66 M82 62 L66 60 M82 68 L66 66" stroke="var(--navy)" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    'Birds': `<svg viewBox="0 0 100 100" role="img" aria-label="Bird"><ellipse cx="46" cy="58" rx="26" ry="22" fill="var(--p1)"/><circle cx="70" cy="38" r="14" fill="var(--p1)"/><path d="M83 38 L94 34 L83 45 Z" fill="var(--p2)"/><circle cx="74" cy="34" r="2.6" fill="var(--navy)"/><path d="M24 56 Q10 58 20 76 Q34 74 34 60 Z" fill="var(--p2)"/><path d="M30 78 L26 90 M46 82 L44 92" stroke="var(--navy)" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    'Fish & aquatics': `<svg viewBox="0 0 100 100" role="img" aria-label="Fish"><ellipse cx="42" cy="52" rx="28" ry="18" fill="var(--p1)"/><path d="M70 52 L92 36 L92 68 Z" fill="var(--p2)"/><path d="M34 36 Q42 24 54 34 Q46 40 40 40 Z" fill="var(--p2)"/><circle cx="26" cy="48" r="3.6" fill="var(--cream)"/><path d="M18 52 Q10 52 18 60" stroke="var(--navy)" stroke-width="1.6" fill="none"/></svg>`,
    'Small pets': `<svg viewBox="0 0 100 100" role="img" aria-label="Small pet"><circle cx="50" cy="58" r="27" fill="var(--p1)"/><circle cx="30" cy="34" r="9" fill="var(--p1)"/><circle cx="70" cy="34" r="9" fill="var(--p1)"/><circle cx="30" cy="66" r="8" fill="var(--p2)" opacity="0.5"/><circle cx="70" cy="66" r="8" fill="var(--p2)" opacity="0.5"/><circle cx="42" cy="54" r="3.4" fill="var(--navy)"/><circle cx="58" cy="54" r="3.4" fill="var(--navy)"/><ellipse cx="50" cy="64" rx="3.4" ry="2.6" fill="var(--navy)"/></svg>`,
    'Reptiles': `<svg viewBox="0 0 100 100" role="img" aria-label="Reptile"><path d="M20 66 Q30 40 55 46 Q80 50 84 30" stroke="var(--p1)" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="86" cy="27" r="11" fill="var(--p1)"/><circle cx="90" cy="23" r="2.4" fill="var(--navy)"/><circle cx="30" cy="60" r="9" fill="var(--p2)"/><circle cx="46" cy="46" r="9" fill="var(--p2)"/><circle cx="64" cy="45" r="9" fill="var(--p2)"/></svg>`
  };

  const PALETTE = [
    ['var(--barn)', 'var(--cream-2)'],
    ['var(--pine)', 'var(--cream-2)'],
    ['var(--mustard)', 'var(--navy-2)'],
    ['var(--navy-2)', 'var(--cream-2)'],
    ['var(--umber)', 'var(--cream-2)'],
    ['var(--teal)', 'var(--cream-2)']
  ];

  function artFor(category){
    return ART[category] || '';
  }

  function paletteFor(variant){
    return PALETTE[variant % PALETTE.length];
  }

  let catalog = { pets: [], food: [] };
  let categories = [];
  const allItemsById = {};
  const cart = {};

  const catNav = document.getElementById('catNav');
  const petSections = document.getElementById('petSections');
  const foodGrid = document.getElementById('foodGrid');
  const cartCountEl = document.getElementById('cartCount');
  const drawerItemsEl = document.getElementById('drawerItems');
  const subtotalEl = document.getElementById('subtotalAmt');
  const toastEl = document.getElementById('toast');
  const checkoutBtn = document.getElementById('checkoutBtn');

  let toastTimer = null;
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.classList.remove('show'), 2200);
  }

  async function loadCatalog(){
    try{
      const res = await fetch('/api/products');
      catalog = await res.json();
    }catch(err){
      petSections.innerHTML = '<p class="loading-msg">Could not load the catalog. Is the server running?</p>';
      return;
    }

    catalog.pets.forEach(p=> allItemsById[p.id] = p);
    catalog.food.forEach(f=> allItemsById[f.id] = f);

    categories = [...new Set(catalog.pets.map(p=>p.category))];

    renderNav();
    renderPetSections();
    renderFood();
    renderCart();
  }

  function renderNav(){
    categories.forEach(cat=>{
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.addEventListener('click', ()=>{
        const el = document.getElementById('sec-' + slug(cat));
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      });
      catNav.appendChild(btn);
    });
  }

  function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-'); }

  function renderPetSections(){
    petSections.innerHTML = '';
    categories.forEach(cat=>{
      const items = catalog.pets.filter(p=>p.category === cat);
      const section = document.createElement('section');
      section.className = 'section';
      section.id = 'sec-' + slug(cat);

      const head = document.createElement('div');
      head.className = 'section-head';
      const icon = items[0] ? items[0].icon : '';
      head.innerHTML = `<div><h3>${icon} ${cat}</h3><p>All ${cat.toLowerCase()} are U.S.-bred, priced at current market averages, and shipped with a starter bag of the right food.</p></div>`;
      section.appendChild(head);

      const grid = document.createElement('div');
      grid.className = 'grid';

      items.forEach(p=>{
        const [c1, c2] = paletteFor(p.variant || 0);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="card-art" style="--p1:${c1}; --p2:${c2};">
            ${artFor(cat)}
            <span class="price-tag">${fmt(p.price)}</span>
          </div>
          <div class="card-body">
            <span class="kind">${p.breed || cat} · ${p.age || ''}</span>
            <h4>${p.name}</h4>
            <p class="desc">${p.description} · food included</p>
            <button class="add-btn" data-id="${p.id}">Add to cart</button>
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      petSections.appendChild(section);
    });
  }

  function renderFood(){
    foodGrid.innerHTML = '';
    catalog.food.forEach(f=>{
      const card = document.createElement('div');
      card.className = 'food-card';
      card.innerHTML = `
        <div class="icon">${f.icon}</div>
        <div class="info">
          <h4>${f.name}</h4>
          <p class="desc">${f.description}</p>
          <div class="row-bottom">
            <span class="price">${fmt(f.price)}</span>
            <button data-id="${f.id}">Add</button>
          </div>
        </div>
      `;
      foodGrid.appendChild(card);
    });
  }

  function addToCart(id, btnEl){
    if(!cart[id]) cart[id] = 0;
    cart[id] += 1;
    renderCart();
    showToast(allItemsById[id].name + ' added to cart');
    if(btnEl){
      const original = btnEl.textContent;
      btnEl.textContent = 'Added ✓';
      btnEl.classList.add('added');
      setTimeout(()=>{ btnEl.textContent = original; btnEl.classList.remove('added'); }, 1200);
    }
  }

  function removeFromCart(id){
    delete cart[id];
    renderCart();
  }

  function renderCart(){
    const ids = Object.keys(cart);
    let count = 0, subtotal = 0;
    ids.forEach(id=>{ count += cart[id]; subtotal += cart[id] * allItemsById[id].price; });
    cartCountEl.textContent = count;
    subtotalEl.textContent = fmt(subtotal);

    if(ids.length === 0){
      drawerItemsEl.innerHTML = '<div class="drawer-empty">Your cart is empty. Browse pets and provisions above.</div>';
      return;
    }

    drawerItemsEl.innerHTML = '';
    ids.forEach(id=>{
      const item = allItemsById[id];
      const qty = cart[id];
      const row = document.createElement('div');
      row.className = 'line-item';
      row.innerHTML = `
        <div class="li-icon">${item.icon}</div>
        <div class="li-info">
          <div class="nm">${item.name}${qty > 1 ? ' × ' + qty : ''}</div>
          <div class="px">${fmt(item.price)} each</div>
        </div>
        <button class="li-remove" data-id="${id}">Remove</button>
      `;
      drawerItemsEl.appendChild(row);
    });
  }

  document.body.addEventListener('click', (e)=>{
    const addBtn = e.target.closest('.add-btn, .food-card button');
    if(addBtn){ addToCart(addBtn.dataset.id, addBtn); return; }
    const removeBtn = e.target.closest('.li-remove');
    if(removeBtn){ removeFromCart(removeBtn.dataset.id); }
  });

  const overlay = document.getElementById('overlay');
  const drawer = document.getElementById('drawer');
  function openDrawer(){ overlay.classList.add('open'); drawer.classList.add('open'); }
  function closeDrawer(){ overlay.classList.remove('open'); drawer.classList.remove('open'); }
  document.getElementById('cartOpenBtn').addEventListener('click', openDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  checkoutBtn.addEventListener('click', async ()=>{
    const ids = Object.keys(cart);
    if(ids.length === 0){ showToast('Your cart is empty'); return; }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Redirecting to secure checkout…';

    try{
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      });
      const data = await res.json();

      if(data.url){
        window.location.href = data.url;
      } else {
        showToast(data.error || 'Could not start checkout');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Check out';
      }
    }catch(err){
      showToast('Network error — try again');
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Check out';
    }
  });

  loadCatalog();

})();
