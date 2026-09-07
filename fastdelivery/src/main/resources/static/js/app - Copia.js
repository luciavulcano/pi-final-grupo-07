const API = '/api';

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function togglePassword() {
  const input = document.getElementById('senha');
  const btn = document.querySelector('.toggle-pass');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  if (btn) btn.textContent = input.type === 'password' ? 'Mostrar' : 'Ocultar';
}

async function api(url, options = {}) {
  const response = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || 'Não foi possível concluir a operação.');
  return data;
}

function getClientId() { return Number(localStorage.getItem('fd_cliente_id') || 0); }
function getOrderId() { return Number(localStorage.getItem('fd_pedido_id') || 0); }

function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getCart() {
  const saved = localStorage.getItem('fd_cart');
  if (saved) return JSON.parse(saved);
  const cart = [
    { produtoId: 1, nome: 'Classic Bacon', preco: 29.90, quantidade: 2, icone: '🍔' },
    { produtoId: 3, nome: 'Batata Crocante', preco: 14.90, quantidade: 1, icone: '🍟' }
  ];
  localStorage.setItem('fd_cart', JSON.stringify(cart));
  return cart;
}

function saveCart(cart) {
  localStorage.setItem('fd_cart', JSON.stringify(cart));
  updateCartCounters();
}

function cartCount() { return getCart().reduce((total, item) => total + item.quantidade, 0); }

function updateCartCounters() {
  const count = cartCount();
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = count);
  const sticky = document.getElementById('sticky-items');
  if (sticky) sticky.textContent = `${count} itens`;
}

async function addToCart(productId) {
  try {
    const products = await api(`/restaurantes/1/produtos`);
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const cart = getCart();
    const item = cart.find(i => i.produtoId === product.id);
    if (item) item.quantidade++;
    else cart.push({ produtoId: product.id, nome: product.nome, preco: product.preco, quantidade: 1, icone: product.icone });
    saveCart(cart);
    showToast(`${product.nome} adicionado ao pedido`);
  } catch (e) { showToast(e.message); }
}

function selectTag(button) { button.classList.toggle('selected'); }

async function filterRestaurants() {
  const term = (document.getElementById('busca')?.value || '').trim();
  const grid = document.getElementById('restaurants');
  if (!grid) return;
  try {
    const restaurants = await api('/restaurantes' + (term ? `?busca=${encodeURIComponent(term)}` : ''));
    renderRestaurants(restaurants);
  } catch (e) { showToast(e.message); }
}

async function setCategory(category) {
  const input = document.getElementById('busca');
  if (input) input.value = category;
  const grid = document.getElementById('restaurants');
  if (!grid) return;
  try {
    const restaurants = await api(`/restaurantes?categoria=${encodeURIComponent(category)}`);
    renderRestaurants(restaurants);
  } catch (e) { showToast(e.message); }
}

function renderRestaurants(restaurants) {
  const grid = document.getElementById('restaurants');
  grid.innerHTML = restaurants.map(r => `
    <article class="restaurant-card">
      <div class="restaurant-icon">${r.icone}</div>
      <h3>${r.nome}</h3><p>${r.categoria}</p>
      <div class="stars">${'★'.repeat(Math.round(r.avaliacao))}${'☆'.repeat(5 - Math.round(r.avaliacao))}</div>
      <a class="btn small" href="produtos.html?restaurante=${r.id}">Ver cardápio</a>
    </article>`).join('') || '<p class="muted">Nenhum restaurante encontrado.</p>';
}

async function carregarRestaurantes() {
  if (!document.getElementById('restaurants')) return;
  try { renderRestaurants(await api('/restaurantes')); } catch (e) { showToast(e.message); }
}

async function carregarProdutos() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const params = new URLSearchParams(location.search);
  const restaurantId = Number(params.get('restaurante') || 1);
  try {
    const restaurants = await api(`/restaurantes`);
    const restaurant = restaurants.find(r => r.id === restaurantId) || restaurants[0];
    const products = await api(`/restaurantes/${restaurant.id}/produtos`);
    const icon = document.getElementById('restaurant-icon');
    const name = document.getElementById('restaurant-name');
    const info = document.getElementById('restaurant-info');
    if (icon) icon.textContent = restaurant.icone;
    if (name) name.textContent = restaurant.nome;
    if (info) info.textContent = `${restaurant.categoria} • ${restaurant.avaliacao.toFixed(1)} ★ • ${restaurant.tempoMin}–${restaurant.tempoMax} min`;
    grid.innerHTML = products.map(p => `
      <article class="product-card">
        <div class="food-photo">${p.icone}</div>
        <div class="product-info"><h3>${p.nome}</h3><p>${p.descricao}</p><strong>${money(p.preco)}</strong>
        <button class="btn small" onclick="addToCart(${p.id})">Adicionar</button></div>
      </article>`).join('');
    localStorage.setItem('fd_restaurante_id', restaurant.id);
    updateCartCounters();
  } catch (e) { showToast(e.message); }
}

async function carregarPagamento() {
  const itemsEl = document.getElementById('summary-items');
  if (!itemsEl) return;
  const cart = getCart();
  let total = 0;
  itemsEl.innerHTML = cart.map(i => {
    const subtotal = i.preco * i.quantidade; total += subtotal;
    return `<div class="summary-line"><span>${i.quantidade}x ${i.nome}</span><b>${money(subtotal)}</b></div>`;
  }).join('');
  document.getElementById('summary-total').textContent = money(total);
  updateCartCounters();
}

async function confirmOrder() {
  const clienteId = getClientId();
  if (!clienteId) { location.href = 'login.html'; return; }
  const cart = getCart();
  if (!cart.length) { showToast('Seu carrinho está vazio.'); return; }
  const selected = document.querySelector('input[name="pay"]:checked');
  const forma = selected?.value || 'CARTAO';
  try {
    const pedido = await api('/pedidos', {
      method: 'POST', body: JSON.stringify({
        clienteId,
        restauranteId: Number(localStorage.getItem('fd_restaurante_id') || 1),
        endereco: 'Rua das Flores, 250 — Recife/PE',
        formaPagamento: forma,
        trocoPara: forma === 'DINHEIRO' ? 100 : null,
        itens: cart.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade }))
      })
    });
    localStorage.setItem('fd_pedido_id', pedido.id);
    const aprovado = await api(`/pedidos/${pedido.id}/aprovar`, { method: 'POST' });
    localStorage.removeItem('fd_cart');
    localStorage.setItem('fd_pedido_id', aprovado.id);
    showToast(`Pedido ${aprovado.codigo} aprovado (simulação)!`);
    setTimeout(() => location.href = 'pedido.html', 800);
  } catch (e) { showToast(e.message); }
}

function statusLabel(status) {
  return ({ RECEBIDO:'Pedido recebido', EM_PREPARACAO:'Preparando', SAIU_PARA_ENTREGA:'Saiu para entrega', ENTREGUE:'Entregue' })[status] || status;
}

function statusIndex(status) { return ({ RECEBIDO:0, EM_PREPARACAO:1, SAIU_PARA_ENTREGA:2, ENTREGUE:3 })[status] ?? 0; }

async function carregarPedido() {
  const container = document.getElementById('pedido-page');
  if (!container) return;
  const id = getOrderId();
  if (!id) { showToast('Nenhum pedido encontrado.'); return; }
  try {
    const p = await api(`/pedidos/${id}`);
    const index = statusIndex(p.status);
    document.getElementById('pedido-codigo').textContent = `Pedido #${p.codigo}`;
    document.getElementById('pedido-restaurante').textContent = `${p.restaurante.nome} • previsão de chegada 19:45–20:00`;
    document.getElementById('status-badge').textContent = statusLabel(p.status);
    const steps = document.querySelectorAll('.track-step');
    steps.forEach((el, i) => {
      el.classList.toggle('done', i < index || (p.status === 'ENTREGUE' && i === 3));
      el.classList.toggle('active', i === index && p.status !== 'ENTREGUE');
      el.querySelector('small').textContent = i <= index ? new Date(p.criadoEm).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '--:--';
    });
    document.getElementById('delivery-message').innerHTML = p.status === 'ENTREGUE' ? '<b>Pedido entregue!</b><p>Obrigado por pedir com o FastDelivery.</p>' : `<b>${statusLabel(p.status)}.</b><p>Você pode avançar a simulação pela próxima etapa.</p>`;
    document.getElementById('itens-pedido').innerHTML = p.itens.map(i => `<div class="summary-line"><span>${i.quantidade}x ${i.produto.nome}</span><b>${money(i.quantidade * i.precoUnitario)}</b></div>`).join('');
    document.getElementById('total-pedido').textContent = money(p.valorTotal);
    document.getElementById('forma-pagamento').textContent = p.formaPagamento === 'CARTAO' ? 'Cartão de crédito' : p.formaPagamento === 'PIX' ? 'PIX' : 'Dinheiro';
    const btn = document.getElementById('advance-status');
    if (p.status === 'ENTREGUE') { btn.style.display='none'; }
    else { btn.style.display='block'; btn.textContent = `Simular: ${index === 0 ? 'Preparando' : index === 1 ? 'Saiu para entrega' : 'Entregue'}`; }
    if (p.status === 'ENTREGUE') document.getElementById('avaliar-link').style.display='block';
  } catch (e) { showToast(e.message); }
}

async function avancarPedido() {
  const id = getOrderId();
  try { await api(`/pedidos/${id}/avancar`, { method:'POST' }); carregarPedido(); } catch(e) { showToast(e.message); }
}

async function enviarAvaliacao(event) {
  event.preventDefault();
  const id = getOrderId(), clienteId = getClientId();
  const nota = Number(document.querySelector('input[name="rating"]:checked')?.value || 5);
  const comentario = document.querySelector('textarea')?.value || '';
  const tags = [...document.querySelectorAll('.tags .selected')].map(x => x.textContent.trim()).join(', ');
  try {
    await api(`/pedidos/${id}/avaliacao`, { method:'POST', body: JSON.stringify({ clienteId, nota, comentario, tags }) });
    showToast('Avaliação enviada. Obrigado!'); setTimeout(() => location.href='index.html', 700);
  } catch(e) { showToast(e.message); }
}

async function cadastrar(event) {
  event.preventDefault();
  const inputs = document.querySelectorAll('input');
  const nome = inputs[0].value, telefone = inputs[1].value, email = inputs[2].value, senha = inputs[3].value, confirma = inputs[4].value;
  if (senha !== confirma) { showToast('As senhas não conferem.'); return; }
  try { await api('/clientes', { method:'POST', body:JSON.stringify({nome, telefone, email, senha}) }); showToast('Cadastro realizado com sucesso!'); setTimeout(()=>location.href='login.html',700); }
  catch(e) { showToast(e.message); }
}

async function login(event) {
  event.preventDefault();
  const email = document.querySelector('input[type="email"]').value;
  const senha = document.getElementById('senha').value;
  try {
    const data = await api('/auth/login', { method:'POST', body:JSON.stringify({email, senha}) });
    localStorage.setItem('fd_cliente_id', data.id); localStorage.setItem('fd_cliente_nome', data.nome);
    showToast(`Olá, ${data.nome}!`); setTimeout(()=>location.href='index.html',700);
  } catch(e) { showToast(e.message); }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCounters();
  carregarRestaurantes(); carregarProdutos(); carregarPagamento(); carregarPedido();
  const cadastroForm = document.getElementById('cadastro-form'); if (cadastroForm) cadastroForm.addEventListener('submit', cadastrar);
  const loginForm = document.getElementById('login-form'); if (loginForm) loginForm.addEventListener('submit', login);
  const reviewForm = document.getElementById('review-form'); if (reviewForm) reviewForm.addEventListener('submit', enviarAvaliacao);
});
