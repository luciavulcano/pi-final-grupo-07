const API = '/api';


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

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

  window.__toastTimer = setTimeout(
    () => toast.classList.remove('show'),
    1800
  );

}


function togglePassword() {

  const input =
    document.getElementById('senha');

  const btn =
    document.querySelector('.toggle-pass');

  if (!input) {
    return;
  }

  input.type =
    input.type === 'password'
      ? 'text'
      : 'password';

  if (btn) {

    btn.textContent =
      input.type === 'password'
        ? 'Mostrar'
        : 'Ocultar';

  }

}


function money(value) {

  return Number(value || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL'
    }
  );

}


/* =========================================================
   API
   ========================================================= */

async function api(url, options = {}) {

  try {

    const response =
      await fetch(
        API + url,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          ...options
        }
      );


    const texto =
      await response.text();


    let data = {};


    try {

      data =
        texto
          ? JSON.parse(texto)
          : {};

    } catch (e) {

      data = {
        message: texto
      };

    }


    console.log('----------------------------------');
    console.log('API:', API + url);
    console.log('HTTP:', response.status);
    console.log('RESPOSTA:', data);
    console.log('----------------------------------');


    if (!response.ok) {

      throw new Error(
        data.erro ||
        data.message ||
        data.mensagem ||
        data.error ||
        `Erro HTTP ${response.status}`
      );

    }


    return data;

  } catch (e) {

    console.error(
      'Erro na chamada da API:',
      url,
      e
    );

    throw e;

  }

}


/* =========================================================
   CLIENTE / SESSÃO
   ========================================================= */

function getClientId() {

  return Number(
    localStorage.getItem('fd_cliente_id') || 0
  );

}


function getClientName() {

  return localStorage.getItem(
    'fd_cliente_nome'
  ) || '';

}


function usuarioEstaLogado() {

  return !!localStorage.getItem(
    'fd_cliente_id'
  );

}


function atualizarUsuarioLogado() {

  const usuarioLogado =
    document.getElementById(
      'usuario-logado'
    );

  const nomeUsuario =
    document.getElementById(
      'nome-usuario'
    );

  const logoutBtn =
    document.getElementById(
      'logout-btn'
    );

  const loginLink =
    document.getElementById(
      'login-link'
    );

  const cadastroLink =
    document.querySelector(
      'a[href="cadastro.html"]'
    );


  if (
    !usuarioLogado ||
    !nomeUsuario ||
    !logoutBtn
  ) {

    return;

  }


  if (usuarioEstaLogado()) {

    const nome =
      getClientName();


    nomeUsuario.textContent =
      nome || 'Usuário';


    usuarioLogado.style.display =
      'inline';


    logoutBtn.style.display =
      'inline-block';


    if (loginLink) {

      loginLink.style.display =
        'none';

    }


    if (cadastroLink) {

      cadastroLink.style.display =
        'none';

    }

  } else {

    usuarioLogado.style.display =
      'none';


    logoutBtn.style.display =
      'none';


    if (loginLink) {

      loginLink.style.display =
        'inline';

    }


    if (cadastroLink) {

      cadastroLink.style.display =
        'inline';

    }

  }

}


/* =========================================================
   CARRINHO
   ========================================================= */

function getCartKey() {

  if (usuarioEstaLogado()) {

    const clienteId =
      getClientId();


    return `fd_cart_${clienteId}`;

  }


  return 'fd_guest_cart';

}


function getCart() {

  const chaveCarrinho =
    getCartKey();


  const saved =
    localStorage.getItem(
      chaveCarrinho
    );


  if (!saved) {

    return [];

  }


  try {

    const cart =
      JSON.parse(saved);


    if (!Array.isArray(cart)) {

      return [];

    }


    return cart;

  } catch (e) {

    console.error(
      'Erro ao ler o carrinho:',
      e
    );


    localStorage.removeItem(
      chaveCarrinho
    );


    return [];

  }

}


function saveCart(cart) {

  const chaveCarrinho =
    getCartKey();


  localStorage.setItem(
    chaveCarrinho,
    JSON.stringify(cart)
  );


  updateCartCounters();

}


/*
 * Migra o carrinho do visitante
 * para o usuário após o login.
 */
function migrarCarrinhoVisitante() {

  const guestSaved =
    localStorage.getItem(
      'fd_guest_cart'
    );


  if (!guestSaved) {

    return;

  }


  let guestCart = [];


  try {

    guestCart =
      JSON.parse(
        guestSaved
      );

  } catch (e) {

    console.error(
      'Erro ao ler carrinho de visitante:',
      e
    );


    localStorage.removeItem(
      'fd_guest_cart'
    );


    return;

  }


  if (
    !Array.isArray(guestCart) ||
    guestCart.length === 0
  ) {

    localStorage.removeItem(
      'fd_guest_cart'
    );


    return;

  }


  const clienteId =
    getClientId();


  if (!clienteId) {

    return;

  }


  const chaveUsuario =
    `fd_cart_${clienteId}`;


  const userSaved =
    localStorage.getItem(
      chaveUsuario
    );


  let userCart = [];


  if (userSaved) {

    try {

      userCart =
        JSON.parse(
          userSaved
        );

    } catch (e) {

      console.error(
        'Erro ao ler carrinho do usuário:',
        e
      );


      userCart = [];

    }

  }


  if (!Array.isArray(userCart)) {

    userCart = [];

  }


  /*
   * Junta os produtos.
   */
  guestCart.forEach(
    guestItem => {

      const itemExistente =
        userCart.find(
          item =>
            item.produtoId ===
            guestItem.produtoId
        );


      if (itemExistente) {

        itemExistente.quantidade +=
          guestItem.quantidade;

      } else {

        userCart.push(
          guestItem
        );

      }

    }
  );


  localStorage.setItem(
    chaveUsuario,
    JSON.stringify(userCart)
  );


  localStorage.removeItem(
    'fd_guest_cart'
  );


  updateCartCounters();

}


function cartCount() {

  return getCart().reduce(
    (total, item) =>
      total +
      Number(item.quantidade || 0),
    0
  );

}


function updateCartCounters() {

  const count =
    cartCount();


  document
    .querySelectorAll('#cart-count')
    .forEach(
      el => {
        el.textContent =
          count;
      }
    );


  const sticky =
    document.getElementById(
      'sticky-items'
    );


  if (sticky) {

    sticky.textContent =
      `${count} itens`;

  }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

  localStorage.removeItem(
    'fd_cliente_id'
  );


  localStorage.removeItem(
    'fd_cliente_nome'
  );


  atualizarUsuarioLogado();

  updateCartCounters();


  showToast(
    'Você saiu da sua conta.'
  );


  setTimeout(
    () => {

      window.location.href =
        'login.html';

    },
    500
  );

}


/* =========================================================
   PRODUTOS / CARRINHO
   ========================================================= */

async function addToCart(productId) {

  try {

    const restauranteId =
      Number(
        localStorage.getItem(
          'fd_restaurante_id'
        ) || 0
      );


    if (!restauranteId) {

      showToast(
        'Restaurante não identificado.'
      );

      return;

    }


    const products =
      await api(
        `/restaurantes/${restauranteId}/produtos`
      );


    const product =
      products.find(
        p =>
          p.id === productId
      );


    if (!product) {

      showToast(
        'Produto não encontrado.'
      );

      return;

    }


    const cart =
      getCart();


    const item =
      cart.find(
        i =>
          i.produtoId ===
          product.id
      );


    if (item) {

      item.quantidade++;

    } else {

      cart.push({
        produtoId: product.id,
        nome: product.nome,
        preco: product.preco,
        quantidade: 1,
        icone: product.icone
      });

    }


    saveCart(cart);

    updateCartCounters();


    showToast(
      `${product.nome} adicionado ao carrinho`
    );


  } catch (e) {

    console.error(
      'Erro ao adicionar produto:',
      e
    );


    showToast(
      e.message
    );

  }

}


/* =========================================================
   RESTAURANTES
   ========================================================= */

function selectTag(button) {

  button.classList.toggle(
    'selected'
  );

}


async function filterRestaurants() {

  const term =
    (
      document.getElementById(
        'busca'
      )?.value || ''
    ).trim();


  const grid =
    document.getElementById(
      'restaurants'
    );


  if (!grid) {

    return;

  }


  try {

    const restaurants =
      await api(
        '/restaurantes' +
        (
          term
            ? `?busca=${encodeURIComponent(term)}`
            : ''
        )
      );


    renderRestaurants(
      restaurants
    );


  } catch (e) {

    showToast(
      e.message
    );

  }

}


async function setCategory(category) {

  const input =
    document.getElementById(
      'busca'
    );


  if (input) {

    input.value =
      category;

  }


  const grid =
    document.getElementById(
      'restaurants'
    );


  if (!grid) {

    return;

  }


  try {

    const restaurants =
      await api(
        `/restaurantes?categoria=${encodeURIComponent(category)}`
      );


    renderRestaurants(
      restaurants
    );


  } catch (e) {

    showToast(
      e.message
    );

  }

}


function renderRestaurants(restaurants) {

  const grid =
    document.getElementById(
      'restaurants'
    );


  if (!grid) {

    return;

  }


  grid.innerHTML =
    restaurants.map(
      r => `

        <article class="restaurant-card">

          <div class="restaurant-icon">
            ${r.icone || '🍽️'}
          </div>

          <h3>
            ${r.nome}
          </h3>

          <p>
            ${r.categoria}
          </p>

          <div class="stars">

            ${
              '★'.repeat(
                Math.round(
                  Number(r.avaliacao || 0)
                )
              )
            }${
              '☆'.repeat(
                5 -
                Math.round(
                  Number(r.avaliacao || 0)
                )
              )
            }

          </div>

          <a
            class="btn small"
            href="produtos.html?restaurante=${r.id}">

            Ver cardápio

          </a>

        </article>

      `
    ).join('') ||

    '<p class="muted">Nenhum restaurante encontrado.</p>';

}


async function carregarRestaurantes() {

  const grid =
    document.getElementById(
      'restaurants'
    );


  if (!grid) {

    return;

  }


  try {

    const restaurants =
      await api(
        '/restaurantes'
      );


    renderRestaurants(
      restaurants
    );


  } catch (e) {

    console.error(
      'Erro ao carregar restaurantes:',
      e
    );


    showToast(
      e.message
    );

  }

}


/* =========================================================
   PRODUTOS
   ========================================================= */

async function carregarProdutos() {

  const grid =
    document.getElementById(
      'product-grid'
    );


  if (!grid) {

    return;

  }


  const params =
    new URLSearchParams(
      location.search
    );


  const restaurantId =
    Number(
      params.get(
        'restaurante'
      ) || 1
    );


  try {

    const restaurants =
      await api(
        '/restaurantes'
      );


    const restaurant =
      restaurants.find(
        r =>
          r.id === restaurantId
      ) || restaurants[0];


    if (!restaurant) {

      grid.innerHTML =
        '<p class="muted">Restaurante não encontrado.</p>';

      return;

    }


    const products =
      await api(
        `/restaurantes/${restaurant.id}/produtos`
      );


    const icon =
      document.getElementById(
        'restaurant-icon'
      );


    const name =
      document.getElementById(
        'restaurant-name'
      );


    const info =
      document.getElementById(
        'restaurant-info'
      );


    if (icon) {

      icon.textContent =
        restaurant.icone || '🍽️';

    }


    if (name) {

      name.textContent =
        restaurant.nome;

    }


    if (info) {

      info.textContent =
        `${restaurant.categoria} • ${Number(
          restaurant.avaliacao || 0
        ).toFixed(1)} ★ • ${restaurant.tempoMin}–${restaurant.tempoMax} min`;

    }


    if (
      !products ||
      !products.length
    ) {

      grid.innerHTML =
        '<p class="muted">Nenhum produto encontrado neste restaurante.</p>';

    } else {

      grid.innerHTML =
        products.map(
          p => `

            <article class="product-card">

              <div class="food-photo">

                ${p.icone || '🍽️'}

              </div>

              <div class="product-info">

                <h3>
                  ${p.nome}
                </h3>

                <p>
                  ${p.descricao || ''}
                </p>

                <strong>
                  ${money(p.preco)}
                </strong>

                <button
                  type="button"
                  class="btn small"
                  onclick="addToCart(${p.id})">

                  Adicionar

                </button>

              </div>

            </article>

          `
        ).join('');

    }


    /*
     * Guarda o restaurante atual.
     */
    localStorage.setItem(
      'fd_restaurante_id',
      restaurant.id
    );


    updateCartCounters();


  } catch (e) {

    console.error(
      'Erro ao carregar produtos:',
      e
    );


    grid.innerHTML =
      `<p class="muted">${e.message}</p>`;


    showToast(
      e.message
    );

  }

}


/* =========================================================
   PAGAMENTO
   ========================================================= */

async function carregarPagamento() {

  const itemsEl =
    document.getElementById(
      'summary-items'
    );


  if (!itemsEl) {

    return;

  }


  const cart =
    getCart();


  let total =
    0;


  itemsEl.innerHTML =
    cart.map(
      i => {

        const subtotal =
          Number(i.preco || 0) *
          Number(i.quantidade || 0);


        total +=
          subtotal;


        return `

          <div class="summary-line">

            <span>
              ${i.quantidade}x ${i.nome}
            </span>

            <b>
              ${money(subtotal)}
            </b>

          </div>

        `;

      }
    ).join('');


  const totalEl =
    document.getElementById(
      'summary-total'
    );


  if (totalEl) {

    totalEl.textContent =
      money(total);

  }


  updateCartCounters();

}


/* =========================================================
   CONFIRMAR PEDIDO
   ========================================================= */

async function confirmOrder() {

  const clienteId =
    getClientId();


  /*
   * Para finalizar o pedido,
   * o cliente precisa estar logado.
   */
  if (!clienteId) {

    location.href =
      'login.html';

    return;

  }


  const cart =
    getCart();


  if (!cart.length) {

    showToast(
      'Seu carrinho está vazio.'
    );

    return;

  }


  const selected =
    document.querySelector(
      'input[name="pay"]:checked'
    );


  const forma =
    selected?.value ||
    'CARTAO';


  try {

    /*
     * Cria o pedido.
     */
    const pedido =
      await api(
        '/pedidos',
        {

          method: 'POST',

          body:
            JSON.stringify({

              clienteId,

              restauranteId:
                Number(
                  localStorage.getItem(
                    'fd_restaurante_id'
                  ) || 1
                ),

              endereco:
                'Rua das Flores, 250 — Recife/PE',

              formaPagamento:
                forma,

              trocoPara:
                forma === 'DINHEIRO'
                  ? 100
                  : null,

              itens:
                cart.map(
                  i => ({

                    produtoId:
                      i.produtoId,

                    quantidade:
                      i.quantidade

                  })
                )

            })

        }
      );


    /*
     * Guarda o pedido criado.
     */
    localStorage.setItem(
      'fd_pedido_id',
      pedido.id
    );


    /*
     * Aprova o pedido.
     */
    const aprovado =
      await api(
        `/pedidos/${pedido.id}/aprovar`,
        {

          method: 'POST'

        }
      );


    /*
     * Pedido concluído:
     * limpa somente o carrinho
     * deste cliente.
     */
    localStorage.removeItem(
      `fd_cart_${clienteId}`
    );


    /*
     * Atualiza imediatamente
     * o contador do carrinho.
     */
    updateCartCounters();


    /*
     * Mantém o pedido atual salvo.
     */
    localStorage.setItem(
      'fd_pedido_id',
      aprovado.id
    );


    showToast(
      `Pedido ${aprovado.codigo} aprovado (simulação)!`
    );


    /*
     * Vai para o acompanhamento.
     */
    setTimeout(
      () => {

        location.href =
          'pedido.html';

      },
      800
    );


  } catch (e) {

    console.error(
      'Erro ao confirmar pedido:',
      e
    );


    showToast(
      e.message ||
      'Não foi possível concluir o pedido.'
    );

  }

}


/* =========================================================
   ACOMPANHAMENTO DO PEDIDO
   ========================================================= */

function statusLabel(status) {

  return {

    RECEBIDO:
      'Pedido recebido',

    EM_PREPARACAO:
      'Preparando',

    SAIU_PARA_ENTREGA:
      'Saiu para entrega',

    ENTREGUE:
      'Entregue'

  }[status] || status;

}


function statusIndex(status) {

  return {

    RECEBIDO: 0,

    EM_PREPARACAO: 1,

    SAIU_PARA_ENTREGA: 2,

    ENTREGUE: 3

  }[status] ?? 0;

}


function getOrderId() {

  return Number(
    localStorage.getItem(
      'fd_pedido_id'
    ) || 0
  );

}


async function carregarPedido() {

  const container =
    document.getElementById(
      'pedido-page'
    );


  if (!container) {

    return;

  }


  const id =
    getOrderId();


  if (!id) {

    showToast(
      'Nenhum pedido encontrado.'
    );

    return;

  }


  try {

    const p =
      await api(
        `/pedidos/${id}`
      );


    const index =
      statusIndex(
        p.status
      );


    document.getElementById(
      'pedido-codigo'
    ).textContent =
      `Pedido #${p.codigo}`;


    document.getElementById(
      'pedido-restaurante'
    ).textContent =
      `${p.restaurante.nome} • previsão de chegada 19:45–20:00`;


    document.getElementById(
      'status-badge'
    ).textContent =
      statusLabel(
        p.status
      );


    const steps =
      document.querySelectorAll(
        '.track-step'
      );


    steps.forEach(
      (el, i) => {

        el.classList.toggle(
          'done',
          i < index ||
          (
            p.status === 'ENTREGUE' &&
            i === 3
          )
        );


        el.classList.toggle(
          'active',
          i === index &&
          p.status !== 'ENTREGUE'
        );


        const timeElement =
          el.querySelector(
            'small'
          );


        if (timeElement) {

          timeElement.textContent =
            i <= index

              ? new Date(
                  p.criadoEm
                ).toLocaleTimeString(
                  'pt-BR',
                  {
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )

              : '--:--';

        }

      }
    );


    const deliveryMessage =
      document.getElementById(
        'delivery-message'
      );


    if (deliveryMessage) {

      deliveryMessage.innerHTML =
        p.status === 'ENTREGUE'

          ? `

            <b>
              Pedido entregue!
            </b>

            <p>
              Obrigado por pedir com o FastDelivery.
            </p>

          `

          : `

            <b>
              ${statusLabel(p.status)}.
            </b>

            <p>
              Você pode avançar a simulação pela próxima etapa.
            </p>

          `;

    }


    const itensPedido =
      document.getElementById(
        'itens-pedido'
      );


    if (itensPedido) {

      itensPedido.innerHTML =
        (p.itens || []).map(
          i => `

            <div class="summary-line">

              <span>
                ${i.quantidade}x ${i.produto.nome}
              </span>

              <b>
                ${money(
                  i.quantidade *
                  i.precoUnitario
                )}
              </b>

            </div>

          `
        ).join('');

    }


    const totalPedido =
      document.getElementById(
        'total-pedido'
      );


    if (totalPedido) {

      totalPedido.textContent =
        money(
          p.valorTotal
        );

    }


    const formaPagamento =
      document.getElementById(
        'forma-pagamento'
      );


    if (formaPagamento) {

      formaPagamento.textContent =

        p.formaPagamento === 'CARTAO'

          ? 'Cartão de crédito'

          : p.formaPagamento === 'PIX'

            ? 'PIX'

            : 'Dinheiro';

    }


    const btn =
      document.getElementById(
        'advance-status'
      );


    if (btn) {

      if (
        p.status === 'ENTREGUE'
      ) {

        btn.style.display =
          'none';

      } else {

        btn.style.display =
          'block';


        btn.textContent =
          `Simular: ${
            index === 0
              ? 'Preparando'
              : index === 1
                ? 'Saiu para entrega'
                : 'Entregue'
          }`;

      }

    }


    const avaliarLink =
      document.getElementById(
        'avaliar-link'
      );


    if (avaliarLink) {

      avaliarLink.style.display =
        p.status === 'ENTREGUE'
          ? 'block'
          : 'none';

    }


  } catch (e) {

    console.error(
      'Erro ao carregar pedido:',
      e
    );


    showToast(
      e.message
    );

  }

}


async function avancarPedido() {

  const id =
    getOrderId();


  if (!id) {

    showToast(
      'Nenhum pedido encontrado.'
    );

    return;

  }


  try {

    await api(
      `/pedidos/${id}/avancar`,
      {
        method: 'POST'
      }
    );


    carregarPedido();


  } catch (e) {

    showToast(
      e.message
    );

  }

}


/* =========================================================
   AVALIAÇÃO
   ========================================================= */

async function enviarAvaliacao(event) {

  event.preventDefault();


  const id =
    getOrderId();


  const clienteId =
    getClientId();


  if (!clienteId) {

    location.href =
      'login.html';

    return;

  }


  const nota =
    Number(

      document.querySelector(
        'input[name="rating"]:checked'
      )?.value || 5

    );


  const comentario =
    document.querySelector(
      'textarea'
    )?.value || '';


  const tags =
    [
      ...document.querySelectorAll(
        '.tags .selected'
      )
    ]
      .map(
        x =>
          x.textContent.trim()
      )
      .join(', ');


  try {

    await api(
      `/pedidos/${id}/avaliacao`,
      {

        method: 'POST',

        body:
          JSON.stringify({

            clienteId,

            nota,

            comentario,

            tags

          })

      }
    );


    showToast(
      'Avaliação enviada. Obrigado!'
    );


    setTimeout(
      () => {

        location.href =
          'index.html';

      },
      700
    );


  } catch (e) {

    showToast(
      e.message
    );

  }

}


/* =========================================================
   CADASTRO
   ========================================================= */

async function cadastrar(event) {

  event.preventDefault();


  const inputs =
    document.querySelectorAll(
      'input'
    );


  const nome =
    inputs[0]?.value || '';


  const telefone =
    inputs[1]?.value || '';


  const email =
    inputs[2]?.value || '';


  const senha =
    inputs[3]?.value || '';


  const confirma =
    inputs[4]?.value || '';


  if (senha !== confirma) {

    showToast(
      'As senhas não conferem.'
    );

    return;

  }


  try {

    await api(
      '/clientes',
      {

        method: 'POST',

        body:
          JSON.stringify({

            nome,

            telefone,

            email,

            senha

          })

      }
    );


    showToast(
      'Cadastro realizado com sucesso!'
    );


    setTimeout(
      () => {

        location.href =
          'login.html';

      },
      700
    );


  } catch (e) {

    showToast(
      e.message
    );

  }

}


/* =========================================================
   TELA DO CARRINHO
   ========================================================= */

function carregarCarrinho() {

  const container =
    document.getElementById(
      'cart-items'
    );


  const empty =
    document.getElementById(
      'cart-empty'
    );


  const footer =
    document.getElementById(
      'cart-footer'
    );


  const totalElement =
    document.getElementById(
      'cart-total'
    );


  if (!container) {

    return;

  }


  const cart =
    getCart();


  if (!cart.length) {

    container.innerHTML =
      '';


    if (empty) {

      empty.style.display =
        'block';

    }


    if (footer) {

      footer.style.display =
        'none';

    }


    updateCartCounters();

    return;

  }


  if (empty) {

    empty.style.display =
      'none';

  }


  if (footer) {

    footer.style.display =
      'block';

  }


  let total =
    0;


  container.innerHTML =
    cart.map(

      (item, index) => {

        const subtotal =
          Number(item.preco || 0) *
          Number(item.quantidade || 0);


        total +=
          subtotal;


        const restauranteId =
          localStorage.getItem(
            'fd_restaurante_id'
          ) || 1;


        return `

          <article class="cart-item">

            <div class="food-photo">

              ${item.icone || '🍽️'}

            </div>


            <div class="cart-item-info">

              <a

                href="produtos.html?restaurante=${restauranteId}"

                class="cart-product-link">

                <h3>
                  ${item.nome}
                </h3>

              </a>


              <p>

                ${money(item.preco)}
                por unidade

              </p>


              <strong>

                ${money(subtotal)}

              </strong>

            </div>


            <div class="cart-item-actions">

              <button

                type="button"

                class="qty-btn"

                onclick="alterarQuantidade(${index}, -1)">

                −

              </button>


              <span class="qty-value">

                ${item.quantidade}

              </span>


              <button

                type="button"

                class="qty-btn"

                onclick="alterarQuantidade(${index}, 1)">

                +

              </button>


              <button

                type="button"

                class="remove-cart"

                onclick="removerItemCarrinho(${index})">

                Excluir

              </button>

            </div>

          </article>

        `;

      }

    ).join('');


  if (totalElement) {

    totalElement.textContent =
      money(total);

  }


  updateCartCounters();

}


function alterarQuantidade(
  index,
  variacao
) {

  const cart =
    getCart();


  if (!cart[index]) {

    return;

  }


  cart[index].quantidade +=
    variacao;


  if (
    cart[index].quantidade <= 0
  ) {

    cart.splice(
      index,
      1
    );

  }


  saveCart(cart);

  carregarCarrinho();

}


function removerItemCarrinho(index) {

  const cart =
    getCart();


  if (!cart[index]) {

    return;

  }


  const nome =
    cart[index].nome;


  cart.splice(
    index,
    1
  );


  saveCart(cart);

  carregarCarrinho();


  showToast(
    `${nome} removido do carrinho.`
  );

}


/* =========================================================
   LOGIN
   ========================================================= */

async function login(event) {

  event.preventDefault();


  const email =
    document.querySelector(
      'input[type="email"]'
    ).value;


  const senha =
    document.getElementById(
      'senha'
    ).value;


  try {

    const data =
      await api(
        '/auth/login',
        {

          method: 'POST',

          body:
            JSON.stringify({

              email,

              senha

            })

        }
      );


    /*
     * Salva a sessão.
     */
    localStorage.setItem(
      'fd_cliente_id',
      data.id
    );


    localStorage.setItem(
      'fd_cliente_nome',
      data.nome
    );


    /*
     * Migra o carrinho de visitante.
     */
    migrarCarrinhoVisitante();


    showToast(
      `Olá, ${data.nome}!`
    );


    setTimeout(
      () => {

        location.href =
          'index.html';

      },
      700
    );


  } catch (e) {

    showToast(
      e.message
    );

  }

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    /*
     * Sessão
     */
    atualizarUsuarioLogado();


    /*
     * Contador do carrinho
     */
    updateCartCounters();


    /*
     * Restaurante
     */
    carregarRestaurantes();


    /*
     * Produtos
     */
    carregarProdutos();


    /*
     * Pagamento
     */
    carregarPagamento();


    /*
     * Acompanhamento
     */
    carregarPedido();


    /*
     * Carrinho
     */
    carregarCarrinho();


    /*
     * Cadastro
     */
    const cadastroForm =
      document.getElementById(
        'cadastro-form'
      );


    if (cadastroForm) {

      cadastroForm.addEventListener(
        'submit',
        cadastrar
      );

    }


    /*
     * Login
     */
    const loginForm =
      document.getElementById(
        'login-form'
      );


    if (loginForm) {

      loginForm.addEventListener(
        'submit',
        login
      );

    }


    /*
     * Avaliação
     */
    const reviewForm =
      document.getElementById(
        'review-form'
      );


    if (reviewForm) {

      reviewForm.addEventListener(
        'submit',
        enviarAvaliacao
      );

    }

  }
);