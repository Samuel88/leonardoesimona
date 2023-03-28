// Imposta la data di fine del countdown
const countDownDate = new Date("Jun 8, 2023 16:00:00").getTime();

// Aggiorna il countdown ogni secondo
const x = setInterval(function () {
  // Ottieni la data e l'ora correnti
  const now = new Date().getTime();

  // Calcola la differenza tra la data di fine del countdown e la data corrente
  const distance = countDownDate - now;

  // Calcola i giorni, le ore, i minuti e i secondi rimanenti
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Mostra il countdown nella pagina HTML
  document.getElementById("countdown").innerHTML =
    '<div class="col-sm-auto col-12"><p class="m-0">' +
    days +
    "</p> <span>GIORNI</span></div>" +
    '<div class="col-sm-auto col-12"><p class="m-0">' +
    hours +
    "</p> <span>ORE</span></div>" +
    '<div class="col-sm-auto col-12"><p class="m-0">' +
    minutes +
    "</p> <span>MINUTI</span></div>" +
    '<div class="col-sm-auto col-12"><p class="m-0">' +
    seconds +
    "</p> <span>SECONDI</span></div>";

  // Se il countdown è terminato, mostra un messaggio di avviso
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("countdown").innerHTML = "EXPIRED";
  }
}, 1000);

function clickAuguri() {
  const element = document.getElementById("form-auguri");
  element.classList.toggle("d-none");
}


// Seleziona il menu
const menu = document.querySelector('nav');

// Ottieni l'altezza del menu
const menuHeight = menu.offsetHeight;

// Aggiungi l'evento scroll alla finestra di visualizzazione
window.addEventListener('scroll', () => {
  // Ottieni la posizione della finestra di visualizzazione
  const scrollPosition = window.scrollY;

  // Aggiungi la classe "menu-fixed" se la finestra di visualizzazione è scorsa oltre l'altezza del menu
  if (scrollPosition >= menuHeight) {
    menu.classList.add('fixed-top');
  } else {
    // Rimuovi la classe "menu-fixed" se la finestra di visualizzazione è scorsa al di sopra dell'altezza del menu
    menu.classList.remove('fixed-top');
  }
});

//
// Alpine
//
const API_URL = "https://www.el-giorno-gioviale.it";

function decodeEntity(inputStr) {
  var textarea = document.createElement("textarea");
  textarea.innerHTML = inputStr;
  return textarea.value;
}

async function getLists() {
  const json = await (
    await fetch(`${API_URL}/wp-json/wp/v2/wedding-lists?acf_format=standard&_embed&per_page=100`)
  ).json();
  return json.map((list) => ({
    id: list.id,
    titolo: decodeEntity(list.title.rendered),
    sottotitolo: list.acf.sottotitolo,
    icona: list.acf.icona,
    form: list.acf.form,
    immagine: list._embedded['wp:featuredmedia']['0'].source_url,
  }));
}

async function submitRsvp({
                            nome,
                            email,
                            telefono,
                            conchi,
                            intolleranze,
                            conferma
                          }) {
  const RSVP_ENDPOINT = `${API_URL}/wp-json/contact-form-7/v1/contact-forms/8/feedback`;
  const formdata = new FormData();
  formdata.append("your-name", nome);
  formdata.append("your-email", email);
  formdata.append("your-tel", telefono);
  formdata.append("your-conchi", conchi);
  formdata.append("your-intolleranze", intolleranze);
  formdata.append("your-conferma", conferma);

  const cf7Response = await (
    await fetch(
      RSVP_ENDPOINT,
      {
        method: "POST",
        body: formdata,
      }
    )
  ).json();

  if (cf7Response?.status === 'mail_sent') {
    return cf7Response?.message;
  } else {
    throw new Error(cf7Response.message);
  }
}

async function submitAuguri({nome, messaggio}) {
  const AUGURI_ENDPOINT = `${API_URL}/wp-json/contact-form-7/v1/contact-forms/5/feedback`;
  const formdata = new FormData();
  formdata.append("your-name", nome);
  formdata.append("your-messaggio", messaggio);

  return await (
    await fetch(
      AUGURI_ENDPOINT,
      {
        method: "POST",
        body: formdata,
      }
    )
  ).json();
}

document.addEventListener("alpine:init", () => {
  Alpine.store("weddingLists", {
    data: [],
    init() {
      getLists().then((data) => {
        console.log(data);
        this.data = data;
      });
    },
  });

  Alpine.data("formRsvp", () => ({
    nome: '',
    email: '',
    telefono: '',
    conchi: '',
    intolleranze: '',
    conferma: "",
    msg: '',
    msgErr: '',
    submit() {
      submitRsvp({
        nome: this.nome,
        email: this.email,
        telefono: this.telefono,
        conchi: this.conchi,
        intolleranze: this.intolleranze,
        conferma: this.conferma,
      }).then(msg => {
        this.msg = msg;
      }, (msgErr => {
        this.msgErr = msgErr;
      }));
    },
  }));

  Alpine.data("formAuguri", () => ({
    show: false,
    nome: "",
    messaggio: "",
    msg: "",
    submit() {
      submitRsvp({
        nome: this.nome,
        messaggio: this.messaggio
      }).then((auguriResp) => {
        this.msg = auguriResp.message;
      });
    },
  }));
});
