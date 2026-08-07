// js/app.js

// Dados de backup caso o Supabase não esteja configurado ainda (Fallback local)
let doadoresLocal = [
  { id: 1, nome: "Carlos Andrade", tipo_sanguineo: "O-", cidade: "Curitiba", estado: "PR", whatsapp: "5541999998888" },
  { id: 2, nome: "Mariana Souza", tipo_sanguineo: "A+", cidade: "São Paulo", estado: "SP", whatsapp: "5511988887777" },
  { id: 3, nome: "Lucas Mendes", tipo_sanguineo: "O+", cidade: "Curitiba", estado: "PR", whatsapp: "5541977776666" },
  { id: 4, nome: "Fernanda Lima", tipo_sanguineo: "AB-", cidade: "Rio de Janeiro", estado: "RJ", whatsapp: "5521966665555" }
];

let urgenciasLocal = [
  { id: 1, paciente_nome: "Maria das Dores", hospital: "Hospital Erasto Gaertner", tipo_sanguineo: "O-", cidade: "Curitiba, PR", whatsapp: "5541999998888" },
  { id: 2, paciente_nome: "Pedro Henrique", hospital: "Hospital das Clínicas", tipo_sanguineo: "A-", cidade: "São Paulo, SP", whatsapp: "5511988887777" }
];

let mapa;

// Inicialização Geral ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  inicializarMapa();
  carregarUrgencias();
  carregarDoadores();
});

// 1. Inicializador do Mapa Leaflet.js
function inicializarMapa() {
  // Centro inicial no Brasil
  mapa = L.map('mapa').setView([-25.4284, -49.2558], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(mapa);

  // Pontos de Hemocentros no Mapa
  const hemocentros = [
    { nome: "Hemepar Curitiba", lat: -25.4284, lng: -49.2558, tel: "(41) 3281-4000" },
    { nome: "Fundação Pró-Sangue SP", lat: -23.5578, lng: -46.6692, tel: "(11) 4573-7800" },
    { nome: "HemoRio RJ", lat: -22.9098, lng: -43.1884, tel: "0800 282 0708" }
  ];

  hemocentros.forEach(h => {
    L.marker([h.lat, h.lng]).addTo(mapa)
      .bindPopup(`<b>${h.nome}</b><br>Contato: ${h.tel}`);
  });
}

function obterLocalizacaoUsuario() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      mapa.setView([lat, lng], 12);
      L.marker([lat, lng]).addTo(mapa).bindPopup("<b>Sua Posição Atual</b>").openPopup();
    });
  } else {
    alert("Geolocalização não suportada pelo seu navegador.");
  }
}

// 2. Renderização de Doadores
function carregarDoadores(lista = doadoresLocal) {
  const container = document.getElementById("doadoresGrid");
  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center py-8 text-gray-400">Nenhum doador encontrado para essa busca.</div>`;
    return;
  }

  lista.forEach(d => {
    const card = document.createElement("div");
    card.className = "bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition";
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-bold text-gray-900">${d.nome}</h3>
          <span class="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-md">${d.tipo_sanguineo}</span>
        </div>
        <p class="text-xs text-gray-500 flex items-center gap-1 mb-4">
          <i data-lucide="map-pin" class="w-3.5 h-3.5 text-red-500"></i> ${d.cidade} - ${d.estado}
        </p>
      </div>
      <a href="https://wa.me/${d.whatsapp}?text=Ola%20${encodeURIComponent(d.nome)},%20encontrei%20seu%20contato%20no%20VidaEmRede." target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition">
        <i data-lucide="message-circle" class="w-4 h-4"></i> WhatsApp
      </a>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

// 3. Renderização de Pedidos Urgentes
function carregarUrgencias() {
  const container = document.getElementById("urgenciasGrid");
  container.innerHTML = "";

  urgenciasLocal.forEach(u => {
    const card = document.createElement("div");
    card.className = "bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="flex justify-between items-start mb-2">
          <span class="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Urgente</span>
          <span class="text-red-700 font-black text-lg">${u.tipo_sanguineo}</span>
        </div>
        <h4 class="font-bold text-gray-900 text-sm">${u.paciente_nome}</h4>
        <p class="text-xs text-gray-600 mt-1">${u.hospital}</p>
        <p class="text-xs text-gray-500 mt-0.5">${u.cidade}</p>
      </div>
      <a href="https://wa.me/${u.whatsapp}?text=Ola,%20vi%20o%20pedido%20urgente%20no%20VidaEmRede!" target="_blank" class="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-center text-xs transition flex items-center justify-center gap-2">
        <i data-lucide="heart" class="w-3.5 h-3.5"></i> Contatar Responsável
      </a>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

// 4. Aplicação de Filtros
function aplicarFiltros() {
  const tipo = document.getElementById("filterType").value;
  const uf = document.getElementById("filterUF").value;
  const cidade = document.getElementById("filterCityInput").value.toLowerCase().trim();

  const filtrados = doadoresLocal.filter(d => {
    const matchTipo = tipo === "todos" || d.tipo_sanguineo === tipo;
    const matchUF = uf === "todos" || d.estado.toUpperCase() === uf;
    const matchCidade = d.cidade.toLowerCase().includes(cidade);
    return matchTipo && matchUF && matchCidade;
  });

  carregarDoadores(filtrados);
}

function limparTodosFiltros() {
  document.getElementById("filterType").value = "todos";
  document.getElementById("filterUF").value = "todos";
  document.getElementById("filterCityInput").value = "";
  carregarDoadores(doadoresLocal);
}

function executarBuscaRapida() {
  const blood = document.getElementById("quickBlood").value;
  const city = document.getElementById("quickCity").value;

  if (blood) document.getElementById("filterType").value = blood;
  if (city) document.getElementById("filterCityInput").value = city;

  aplicarFiltros();
  window.location.hash = "#doadores";
}

// 5. Calculadora de Compatibilidade Sanguínea
const matrizCompatibilidade = {
  "A+": { doar: ["A+", "AB+"], receber: ["A+", "A-", "O+", "O-"] },
  "A-": { doar: ["A+", "A-", "AB+", "AB-"], receber: ["A-", "O-"] },
  "B+": { doar: ["B+", "AB+"], receber: ["B+", "B-", "O+", "O-"] },
  "B-": { doar: ["B+", "B-", "AB+", "AB-"], receber: ["B-", "O-"] },
  "AB+": { doar: ["AB+ (Receptor Universal)"], receber: ["Todos os tipos sanguíneos"] },
  "AB-": { doar: ["AB+", "AB-"], receber: ["A-", "B-", "AB-", "O-"] },
  "O+": { doar: ["A+", "B+", "AB+", "O+"], receber: ["O+", "O-"] },
  "O-": { doar: ["Todos os tipos sanguíneos (Doador Universal)"], receber: ["O-"] }
};

function selecionarTipoCalculadora(tipo) {
  const dados = matrizCompatibilidade[tipo];
  const output = document.getElementById("calcOutput");

  output.innerHTML = `
    <div class="flex items-center gap-3 border-b border-white/20 pb-4">
      <span class="bg-white text-red-600 font-black text-2xl px-4 py-2 rounded-2xl">${tipo}</span>
      <div>
        <h4 class="font-bold text-white text-lg">Compatibilidade do Tipo ${tipo}</h4>
        <p class="text-xs text-red-200">Resumo de doação e recepção</p>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2">
      <div class="bg-white/10 p-4 rounded-xl border border-white/10">
        <span class="text-xs font-bold uppercase text-emerald-300 block mb-1">Pode Doar Para:</span>
        <p class="font-bold">${dados.doar.join(", ")}</p>
      </div>
      <div class="bg-white/10 p-4 rounded-xl border border-white/10">
        <span class="text-xs font-bold uppercase text-amber-300 block mb-1">Pode Receber De:</span>
        <p class="font-bold">${dados.receber.join(", ")}</p>
      </div>
    </div>
  `;
}

// 6. Manipulação de Modais e Cadastros
function abrirModalUrgencia() { document.getElementById("modalUrgencia").classList.remove("hidden"); }
function fecharModalUrgencia() { document.getElementById("modalUrgencia").classList.add("hidden"); }

function cadastrarDoadorAPI(e) {
  e.preventDefault();
  const novo = {
    id: Date.now(),
    nome: document.getElementById("cadNome").value,
    tipo_sanguineo: document.getElementById("cadTipo").value,
    cidade: document.getElementById("cadCidade").value,
    estado: document.getElementById("cadUF").value.toUpperCase(),
    whatsapp: document.getElementById("cadWhats").value.replace(/\D/g, "")
  };

  doadoresLocal.unshift(novo);
  carregarDoadores(doadoresLocal);
  alert("Doador cadastrado com sucesso na rede voluntária!");
  document.getElementById("formCadastroDoador").reset();
  window.location.hash = "#doadores";
}

function cadastrarPedidoUrgenteAPI(e) {
  e.preventDefault();
  const novo = {
    id: Date.now(),
    paciente_nome: document.getElementById("urgPaciente").value,
    hospital: document.getElementById("urgHospital").value,
    tipo_sanguineo: document.getElementById("urgTipo").value,
    cidade: document.getElementById("urgCidade").value,
    whatsapp: document.getElementById("urgWhats").value.replace(/\D/g, "")
  };

  urgenciasLocal.unshift(novo);
  carregarUrgencias();
  fecharModalUrgencia();
  alert("Pedido emergencial publicado na plataforma!");
}