const products = [
  {id:9,name:'Комбо',category:'main',price:35,desc:'Сытный набор из популярных блюд',image:'combo.jpg'},
  {id:10,name:'Табака',category:'main',price:30,desc:'Жареная курица по-домашнему',image:'tabaka.jpg'},
  {id:11,name:'Форел 100 г',category:'main',price:20,desc:'Свежая форель, 100 грамм',image:'forel.jpg'},
  {id:12,name:'Кайлаи Гови',category:'main',price:65,desc:'Сытное мясное блюдо по-традиционному рецепту',image:'kailai-govi.png'},
  {id:13,name:'Шурбои Гусфанди',category:'main',price:30,desc:'Ароматный суп с бараниной',image:'shurboi-gusfandi.jpg'},
  {id:14,name:'Булен',category:'main',price:10,desc:'Традиционный густой суп',image:'bulen.jpg'},
  {id:15,name:'Фри',category:'side',price:15,desc:'Хрустящий картофель фри',image:'fri.jpg'},
  {id:16,name:'Картошка по деревенски',category:'side',price:15,desc:'Запечённая картошка с хрустящей корочкой',image:'kartoshka-derevenski.jpg'},
  {id:17,name:'Кулча',category:'side',price:3,desc:'Свежая традиционная лепёшка',image:'kulcha.jpg'},
  {id:18,name:'Чака',category:'side',price:3,desc:'Кисломолочный гарнир по-традиционному рецепту',image:'chaka.jpg'},
  {id:19,name:'Ткемайл',category:'side',price:3,desc:'Традиционный восточный соус',image:'tkemail.jpg'},
  {id:20,name:'Капуст',category:'side',price:3,desc:'Свежая закуска из капусты',image:'kapust.jpg'},
  {id:21,name:'Завтрак',category:'main',price:6,desc:'Сытный завтрак по-домашнему',image:'zavtrak.jpg'}
];

const formatSum = value => new Intl.NumberFormat('ru-RU').format(value) + ' сомони';
let currentLanguage = localStorage.getItem('siteLanguage') || 'ru';
const menuGrid = document.getElementById('menuGrid');
const cartItems = document.getElementById('cartItems');
let cart = {};

function renderMenu(filter = 'all') {
  menuGrid.innerHTML = products.filter(p => filter === 'all' || p.category === filter).map(p => `
    <article class="menu-card" data-category="${p.category}">
      <div class="menu-card-image"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
      <div class="menu-card-body">
        <h3>${translateProductName(p.name)}</h3><p>${translateProductDesc(p.desc)}</p>
        <div class="menu-card-footer"><strong class="price">${formatSum(p.price)}</strong><button class="add-button" type="button" data-id="${p.id}" aria-label="${translateText('addProduct')} ${translateProductName(p.name)}">+</button></div>
      </div>
    </article>`).join('');
}

function updateCart() {
  const entries = Object.values(cart);
  const count = entries.reduce((sum, item) => sum + item.qty, 0);
  const total = entries.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('cartCount').textContent = count;
  document.getElementById('cartTotal').textContent = formatSum(total);
  if (!entries.length) {
    cartItems.innerHTML = `<p class="empty-cart">${translateText('emptyCart')}</p>`;
    return;
  }
  cartItems.innerHTML = entries.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div><strong>${translateProductName(item.name)}</strong><span>${formatSum(item.price)}</span></div>
      <div class="quantity"><button type="button" data-action="minus" data-id="${item.id}">−</button><b>${item.qty}</b><button type="button" data-action="plus" data-id="${item.id}">+</button></div>
    </div>`).join('');
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (cart[id]) cart[id].qty += 1;
  else cart[id] = {...product, qty:1};
  updateCart();
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function openCart() {
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartPanel').setAttribute('aria-hidden','false');
  document.getElementById('overlay').classList.add('open');
}
function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartPanel').setAttribute('aria-hidden','true');
  document.getElementById('overlay').classList.remove('open');
}

renderMenu();
menuGrid.addEventListener('click', e => { const button=e.target.closest('.add-button'); if(button) addToCart(Number(button.dataset.id)); });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('active')); button.classList.add('active'); renderMenu(button.dataset.filter);
}));
document.getElementById('cartButton').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('overlay').addEventListener('click', () => { closeCart(); closeOrderModal(); });
cartItems.addEventListener('click', e => {
  const button=e.target.closest('button[data-action]'); if(!button)return;
  const id=Number(button.dataset.id); if(button.dataset.action==='plus') cart[id].qty++; else { cart[id].qty--; if(cart[id].qty<=0) delete cart[id]; }
  updateCart();
});
document.getElementById('checkoutButton').addEventListener('click', () => {
  if(!Object.keys(cart).length){document.getElementById('toast').textContent='Корзина пуста';document.getElementById('toast').classList.add('show');setTimeout(()=>{document.getElementById('toast').classList.remove('show');document.getElementById('toast').textContent='Добавлено в корзину'},1800);return}
  const total=Object.values(cart).reduce((sum,item)=>sum+item.price*item.qty,0);
  document.getElementById('orderTotal').textContent=formatSum(total);
  document.getElementById('orderModal').classList.add('open');
  document.getElementById('orderModal').setAttribute('aria-hidden','false');
  document.getElementById('overlay').classList.add('open');
});

function closeOrderModal(){document.getElementById('orderModal').classList.remove('open');document.getElementById('orderModal').setAttribute('aria-hidden','true');document.getElementById('overlay').classList.remove('open')}
document.getElementById('closeOrderModal').addEventListener('click',closeOrderModal);
document.getElementById('orderForm').addEventListener('submit',event=>{
  event.preventDefault();
  const name=document.getElementById('orderName').value.trim();
  const phone=document.getElementById('orderPhone').value.trim();
  const address=document.getElementById('orderAddress').value.trim();
  const entries=Object.values(cart);
  const total=entries.reduce((sum,item)=>sum+item.price*item.qty,0);
  const items=entries.map(item=>`${item.name} × ${item.qty} — ${formatSum(item.price*item.qty)}`).join('\n');
  const message=`Здравствуйте! Хочу оформить заказ:\n\n${items}\n\nИтого: ${formatSum(total)}\nИмя: ${name}\nТелефон: ${phone}\nАдрес/самовывоз: ${address}`;
  window.open(`https://wa.me/992558802222?text=${encodeURIComponent(message)}`,'_blank','noopener');
  cart={}; updateCart(); event.target.reset(); closeOrderModal(); closeCart();
});
const menuButton=document.getElementById('menuButton');
menuButton.addEventListener('click',()=>{const nav=document.querySelector('.nav');const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.nav').classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));

let selectedRating = 0;
const ratingButtons = document.querySelectorAll('#ratingInput button');
function paintRating(rating) {
  ratingButtons.forEach(button => button.classList.toggle('active', Number(button.dataset.rating) <= rating));
}
ratingButtons.forEach(button => {
  button.addEventListener('click', () => { selectedRating = Number(button.dataset.rating); paintRating(selectedRating); });
  button.addEventListener('mouseenter', () => paintRating(Number(button.dataset.rating)));
});
document.getElementById('ratingInput').addEventListener('mouseleave', () => paintRating(selectedRating));

function createReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review';
  const stars = document.createElement('div');
  stars.className = 'stars';
  stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  const text = document.createElement('p');
  text.textContent = `«${review.text}»`;
  const name = document.createElement('strong');
  name.textContent = review.name;
  card.append(stars, text, name);
  return card;
}

function loadReviews() {
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('chuchabireniReviews')) || []; } catch (error) { saved = []; }
  const grid = document.getElementById('reviewGrid');
  saved.slice().reverse().forEach(review => grid.prepend(createReviewCard(review)));
}

loadReviews();
document.getElementById('reviewForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!selectedRating) {
    document.getElementById('toast').textContent = 'Выберите оценку';
    document.getElementById('toast').classList.add('show');
    setTimeout(() => document.getElementById('toast').classList.remove('show'), 1800);
    return;
  }
  const name = document.getElementById('reviewName').value.trim();
  const text = document.getElementById('reviewText').value.trim();
  if (!name || !text) return;
  let saved = [];
  try { saved = JSON.parse(localStorage.getItem('chuchabireniReviews')) || []; } catch (error) { saved = []; }
  const review = {name, text, rating:selectedRating};
  saved.push(review);
  localStorage.setItem('chuchabireniReviews', JSON.stringify(saved));
  document.getElementById('reviewGrid').prepend(createReviewCard(review));
  event.target.reset();
  selectedRating = 0;
  paintRating(0);
  document.getElementById('toast').textContent = 'Спасибо за ваш отзыв!';
  document.getElementById('toast').classList.add('show');
  setTimeout(() => document.getElementById('toast').classList.remove('show'), 1800);
});

const productNames = {
  'Комбо':'Комбо','Табака':'Табака','Форел 100 г':'Форел 100 г','Кайлаи Гови':'Кайлаи говӣ','Шурбои Гусфанди':'Шӯрбои гӯсфандӣ','Булен':'Булён','Фри':'Фри','Картошка по деревенски':'Картошкаи деҳқонӣ','Кулча':'Кулча','Чака':'Чака','Ткемайл':'Ткемайл','Капуст':'Карам','Завтрак':'Ноҳорӣ'
};
function translateProductName(name) { return currentLanguage === 'tg' && productNames[name] ? productNames[name] : name; }
function translateProductDesc(desc) {
  if(currentLanguage !== 'tg') return desc;
  const map = {'Сытный набор из популярных блюд':'Маҷмӯи сердатории хӯрокҳо','Жареная курица по-домашнему':'Мурғи бирён ба тарзи хонагӣ','Свежая форель, 100 грамм':'Форели тару тоза, 100 грамм','Сытное мясное блюдо по-традиционному рецепту':'Хӯроки сердатори гӯштӣ бо тарзи анъанавӣ','Ароматный суп с бараниной':'Шӯрбои хушбӯи гӯсфандӣ','Традиционный густой суп':'Шӯрбои анъанавии ғафс','Хрустящий картофель фри':'Картошкаи фрии хурсандӣ','Запечённая картошка с хрустящей корочкой':'Картошкаи пухта бо пӯстхои хрусткий','Свежая традиционная лепёшка':'Нони анъанавии тару тоза','Кисломолочный гарнир по-традиционному рецепту':'Чакаи анъанавӣ','Традиционный восточный соус':'Сосаи анъанавии шарқӣ','Свежая закуска из капусты':'Закускаи тару тоза аз карам','Сытный завтрак по-домашнему':'Нохорбаи сердатори хонагӣ'};
  return map[desc] || desc;
}
function translateText(key) {
  const tg = {emptyCart:'Сабад холӣ аст',addProduct:'Илова кардан',cart:'Сабад',checkout:'Тасдиқи фармоиш',total:'Ҷамъ',added:'Ба сабад илова шуд'};
  const ru = {emptyCart:'Корзина пока пуста',addProduct:'Добавить',cart:'Корзина',checkout:'Оформить заказ',total:'Итого',added:'Добавлено в корзину'};
  return currentLanguage === 'tg' ? tg[key] : ru[key];
}

const languageText = {
  ru: {
    nav:['Меню','О нас','Отзывы','Контакты'],
    eyebrow:'Готовим с душой',
    heroTitle:'Настоящи<br><em>чучабирен</em> с традиционным вкусом',
    heroText:'Свежие ингредиенты, богатый бульон. Всё как дома — только вкуснее.',
    menu:'Смотреть меню',delivery:'Доставка',menuEyebrow:'Наше меню',menuTitle:'Выберите любимое',all:'Все',mainFilter:'Основные блюда',sideFilter:'Гарниры и добавки',
    aboutEyebrow:'О нашей кухне',aboutTitle:'Традиции,<br>которые мы бережём',
    aboutText:'Мы готовим каждый день: замешиваем тесто, лепим вручную и варим ароматный бульон на мясных косточках. Никаких полуфабрикатов — только честные продукты.',
    reviewsEyebrow:'Отзывы гостей',reviewsTitle:'Нас выбирают снова',reviewTitle:'Оставьте свой отзыв',reviewName:'Ваше имя',reviewText:'Расскажите, как вам понравилось',reviewSubmit:'Опубликовать отзыв',
    contactsEyebrow:'Закажите прямо сейчас',contactsTitle:'Горячая и свежая<br>доставка до двери',address:'<strong>Наш адрес</strong><br>г. Вахдат, напротив Медколледжа',hours:'<strong>Работаем ежедневно</strong><br>08:00 — 23:00',call:'Позвонить',whatsapp:'Написать в WhatsApp',
    cart:'Корзина',cartTitle:'Ваш заказ',checkout:'Оформить заказ',total:'Итого',emptyCart:'Корзина пока пуста',
    orderTitle:'Ваши данные',orderName:'Имя',orderNamePlaceholder:'Как к вам обращаться?',orderPhone:'Телефон',orderAddress:'Адрес или способ получения',orderAddressPlaceholder:'Адрес доставки или «Самовывоз»',orderPay:'Итого к оплате',orderSubmit:'Заказать в WhatsApp',
    heroInfo:['средняя доставка','рейтинг гостей'],aboutList:['Собственное производство','Свежие продукты ежедневно','Быстрая доставка по городу'],reviewTexts:['Очень вкусно и сытно! Тесто тонкое, начинка сочная, а бульон просто отличный','Заказывал доставку семьёй. Всё приехало горячим, упаковка аккуратная. Обязательно закажем ещё','Лучшие чучабирен в городе! Узнала за традиционным вкусом детства'],reviewNames:['Малика Р.','Шахзод А.','Гульмира К.'],toTop:'Наверх ↑'
  },
  tg: {
    nav:['Меню','Дар бораи мо','Баҳоҳо','Тамос'],
    eyebrow:'Бо меҳр пухта мекунем',
    heroTitle:'Чӯчабирени<br><em>анъанавӣ</em> бо таъми ҳақиқӣ',
    heroText:'Маҳсулоти тару тоза ва шӯрбои сермазза. Ҳамааш мисли хона — вале боз хам вкуснее.',
    menu:'Дидани меню',delivery:'Таҳвил',menuEyebrow:'Менюи мо',menuTitle:'Дӯстдоштаи худатонро интихоб кунед',all:'Ҳама',mainFilter:'Хӯрокҳои асосӣ',sideFilter:'Гарнирҳо ва иловаҳо',
    aboutEyebrow:'Дар бораи ошхонаи мо',aboutTitle:'Анъанаҳоеро,<br>ки мо нигоҳ медорем',
    aboutText:'Ҳар рӯз мо пухтаем: хамир тайёр мекунем, дастӣ печонем ва шӯрбои хушбӯй аз устухонҳои гӯштӣ мепазем. Бе маҳсулоти нимтайёр — танҳо маҳсулоти тоза.',
    reviewsEyebrow:'Баҳои меҳмонон',reviewsTitle:'Мизоҷон бори дигар меоянд',reviewTitle:'Баҳи худатонро гузоред',reviewName:'Номи шумо',reviewText:'Чӣ хел хуш омад? Нависед',reviewSubmit:'Баҳоро нашр кардан',
    contactsEyebrow:'Ҳозир фармоиш диҳед',contactsTitle:'Таҳвилҳои гарм ва<br>тару тоза то даргоҳ',address:'<strong>Суроғаи мо</strong><br>ш. Ваҳдат, муқобили Медколлеҷ',hours:'<strong>Ҳар рӯз кор мекунем</strong><br>08:00 — 23:00',call:'Занг задан',whatsapp:'Дар WhatsApp навиштан',
    cart:'Сабад',cartTitle:'Фармоиши шумо',checkout:'Тасдиқи фармоиш',total:'Ҷамъ',emptyCart:'Сабад холӣ аст',
    orderTitle:'Маълумоти шумо',orderName:'Ном',orderNamePlaceholder:'Чӣ хонем шуморо?',orderPhone:'Телефон',orderAddress:'Суроға ё усули гирифтан',orderAddressPlaceholder:'Суроғаи таҳвил ё «Худгирифтанӣ»',orderPay:'Ҷамъ ба пардохт',orderSubmit:'Дар WhatsApp фармоиш додан',
    heroInfo:['таҳвили миёна','рейтинги меҳмонон'],aboutList:['Истеҳсолоти худӣ','Маҳсулоти тозаи ҳар рӯз','Таҳвили тез дар шаҳр'],reviewTexts:['Хеле хушмазза ва сердатор! Хамир тунук, пурраи ширин ва шурбо одатан аъло','Ман ба оилама таҳвил супордам. Ҳама чиз гарм омад, бастабандӣ боэҳтинот буд. Албатта боз фармоиш медиҳем','Беҳтарин чӯчабирен дар шаҳр! Бӯи таъми анъанавии кӯдакӣ омад'],'reviewNames':['Малика Р.','Шоҳзод А.','Гулмира К.'],'toTop':'Ба боло ↑'
  }
};

if (!['ru','tg'].includes(currentLanguage)) currentLanguage = 'ru';
if (!localStorage.getItem('siteLanguage')) localStorage.setItem('siteLanguage', currentLanguage);

function applyLanguage() {
  const t = languageText[currentLanguage];
  document.documentElement.lang = currentLanguage === 'tg' ? 'tg' : 'ru';
  document.getElementById('languageButton').textContent = currentLanguage === 'tg' ? 'РУС' : 'Тоҷикӣ';
  document.querySelectorAll('.nav a').forEach((el, index) => { el.textContent = t.nav[index]; });
  document.querySelector('.hero .eyebrow').textContent = t.eyebrow;
  document.querySelector('.hero h1').innerHTML = t.heroTitle;
  document.querySelector('.hero-content > p').textContent = t.heroText;
  document.querySelector('.hero-actions a:nth-child(1)').textContent = t.menu;
  document.querySelector('.hero-actions a:nth-child(2)').textContent = t.delivery;
  document.querySelectorAll('.hero-info small').forEach((el, index) => { el.textContent = t.heroInfo[index]; });
  document.querySelector('#menu .eyebrow').textContent = t.menuEyebrow;
  document.querySelector('#menu h2').textContent = t.menuTitle;
  document.querySelector('.filter[data-filter="all"]').textContent = t.all;
  document.querySelector('.filter[data-filter="main"]').textContent = t.mainFilter;
  document.querySelector('.filter[data-filter="side"]').textContent = t.sideFilter;
  document.querySelector('#about .eyebrow').textContent = t.aboutEyebrow;
  document.querySelector('#about h2').innerHTML = t.aboutTitle;
  document.querySelector('#about .about-content > p').textContent = t.aboutText;
  document.querySelectorAll('#about .about-content li').forEach((el, index) => { el.firstChild.textContent = t.aboutList[index]; });
  document.querySelector('#reviews .eyebrow').textContent = t.reviewsEyebrow;
  document.querySelector('#reviews h2').textContent = t.reviewsTitle;
  Array.from(document.querySelectorAll('#reviewGrid .review')).slice(0, 3).forEach((review, index) => {
    const text = review.querySelector('p');
    const name = review.querySelector('strong');
    if (text) text.textContent = '«' + t.reviewTexts[index] + '»';
    if (name) name.textContent = t.reviewNames[index];
  });
  document.querySelector('#reviewForm h3').textContent = t.reviewTitle;
  document.querySelector('#reviewName').placeholder = t.reviewName;
  document.querySelector('#reviewText').placeholder = t.reviewText;
  document.querySelector('#reviewForm .button').textContent = t.reviewSubmit;
  document.querySelector('#contacts .eyebrow').textContent = t.contactsEyebrow;
  document.querySelector('#contacts h2').innerHTML = t.contactsTitle;
  const contactPs = document.querySelectorAll('#contacts .contact-card p');
  contactPs[0].innerHTML = t.address;
  contactPs[1].innerHTML = t.hours;
  document.querySelector('#contacts .button-primary').textContent = t.call;
  document.querySelector('#contacts .button-ghost').textContent = t.whatsapp;
  document.querySelector('footer span').textContent = currentLanguage === 'tg' ? '© 2026 Чӯчабирени Ахсан' : '© 2026 Чучабирени Ахсан';
  document.querySelector('footer a').textContent = t.toTop;
  document.getElementById('cartButton').childNodes[0].textContent = t.cart + ' ';
  document.querySelector('.cart-header h3').textContent = t.cartTitle;
  document.getElementById('checkoutButton').textContent = t.checkout;
  document.querySelector('.cart-footer span').textContent = t.total;
  document.querySelector('#orderModalTitle').textContent = t.orderTitle;
  const orderLabels = document.querySelectorAll('#orderForm label');
  orderLabels[0].childNodes[0].textContent = t.orderName;
  document.getElementById('orderName').placeholder = t.orderNamePlaceholder;
  orderLabels[1].childNodes[0].textContent = t.orderPhone;
  orderLabels[2].childNodes[0].textContent = t.orderAddress;
  document.getElementById('orderAddress').placeholder = t.orderAddressPlaceholder;
  document.querySelector('.order-summary span').textContent = t.orderPay;
  document.querySelector('#orderForm button[type="submit"]').textContent = t.orderSubmit;
  updateCart();
  const activeFilter = document.querySelector('.filter.active');
  renderMenu(activeFilter ? activeFilter.dataset.filter : 'all');
}

applyLanguage();
document.getElementById('languageButton').addEventListener('click', () => {
  currentLanguage = currentLanguage === 'ru' ? 'tg' : 'ru';
  localStorage.setItem('siteLanguage', currentLanguage);
  applyLanguage();
});
