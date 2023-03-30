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
    '<div class="col-auto"><p class="m-0">' +
    days +
    "</p> <span>GIORNI</span></div>" +
    '<div class="col-auto"><p class="m-0">' +
    hours +
    "</p> <span>ORE</span></div>" +
    '<div class="col-auto"><p class="m-0">' +
    minutes +
    "</p> <span>MINUTI</span></div>" +
    '<div class="col-auto"><p class="m-0">' +
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
  element.scrollIntoView();
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

// Risposta OK
// {
//   "contact_form_id": 8,
//   "status": "mail_sent",
//   "message": "Grazie per il tuo messaggio. È stato inviato.",
//   "posted_data_hash": "a48022ff9c6f3a219c8e93f4d09c9fd0",
//   "into": "#",
//   "invalid_fields": []
// }
async function submitContactForm(baseUrl, cf7Id, dataObj) {
  // Genero l'endpoint
  const endpoint = `${baseUrl}/wp-json/contact-form-7/v1/contact-forms/${cf7Id}/feedback`;

  // Creo i dati della form
  const formData = new FormData();
  for (const [key, value] of Object.entries(dataObj)) {
    formData.append(key, value);
  }

  // Mando la richiesta
  const response = await fetch(endpoint, {
    method: 'post',
    body: formData
  });
  const json = await response.json();

  if (json.status) {
    if (json.status === 'validation_failed') { // Validazione Fallita
      throw new Error(json.message);
      /*
      json.invalid_fields.map(field => {
        return {
          campo: field.field,
          messaggio: field.message,
        }
      })
      */
    } else if (json.status === 'mail_sent') { // Mail inviata
      return json?.message;
    }
  }
}

document.addEventListener("alpine:init", () => {

  Alpine.data('weddingListView', () => ({
    data: JSON.stringify({
      query: `
        query weddingListQuery {
          weddingLists(where: {orderby: {field: POSIZIONE, order: ASC}, status: PUBLISH}) {
            nodes {
              title
              groupWeddingList {
                form
                sottotitolo
                posizione
                icona {
                  sourceUrl
                }
              }
              featuredImage {
                node {
                  sourceUrl
                }
              }
              id
            }
          }
        }
      `
    }),
    result: '',
    weddingLists: [],

    parseWeddingListResponse(data) {
      return data.weddingLists.nodes.map(weddingList => ({
        id: weddingList.id,
        titolo: weddingList.title,
        sottotitolo: weddingList.groupWeddingList.sottotitolo,
        form: weddingList.groupWeddingList.form,
        immagine: weddingList.featuredImage.node.sourceUrl,
        icona: weddingList.groupWeddingList.icona.sourceUrl,
        posizione: weddingList.groupWeddingList.posizione,
      }));
    },

    init() {
      this.result = 'Caricamento...';
      fetch(`${API_URL}/wp/graphql`, {
        method: 'post',
        body: this.data,
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(result => {
          if (result.errors && result.errors.length > 0) {
            this.result = result.errors.map(e => e.message).join('\n');
          }
          this.weddingLists = this.parseWeddingListResponse(result.data);
        });
    }
  }));

  Alpine.data("formRsvp", () => ({
    nome: '',
    email: '',
    telefono: '',
    conchi: '',
    intolleranze: '',
    conferma: '',
    msg: '',
    msgErr: '',
    clear() {
      this.nome = '';
      this.email = '';
      this.telefono = '';
      this.conchi = '';
      this.intolleranze = '';
      this.conferma = "";
      // Rimuovo la classe di validazione
      this.$refs.formElem.classList.remove('was-validated');
    },
    submit() {
      // Aggiungo la classe di validazione
      this.$refs.formElem.classList.add('was-validated');

      if (this.$refs.formElem.checkValidity()) {
        // Creo la funzione per gestire la richiesta
        const submitRsvp = (data) => submitContactForm(API_URL, 8, data);
        submitRsvp({
          'your-name': this.nome,
          'your-email': this.email,
          'your-tel': this.telefono,
          'your-conchi': this.conchi,
          'your-intolleranze': this.intolleranze,
          'your-conferma': this.conferma,
        }).then(msg => {
          this.msg = msg;
          this.clear();
        }, (msgErr => {
          this.msgErr = msgErr;
        }));
      }
    },
  }));

  Alpine.data("formAuguri", () => ({
    show: false,
    nome: "",
    messaggio: "",
    msg: "",
    msgErr: '',
    clear() {
      this.nome = "";
      this.messaggio = "";
      // Rimuovo la classe di validazione
      this.$refs.formElem.classList.remove('was-validated');
    },
    submit() {
      // Aggiungo la classe di validazione
      this.$refs.formElem.classList.add('was-validated');

      if (this.$refs.formElem.checkValidity()) {
        // Creo la funzione per gestire la richiesta
        const submitAuguri = (data) => submitContactForm(API_URL, 5, data);
        submitAuguri({
          'your-name': this.nome,
          'your-messaggio': this.messaggio
        }).then(msg => {
          this.msg = msg;
          this.clear();
        }, (msgErr => {
          this.msgErr = msgErr;
        }));
      }
    },
  }));
});


document.addEventListener('click', function (event) {
  const menu = document.querySelector('.navbar-collapse');

  // chiude il menu se si fa clic su un elemento del menu
  if (event.target.closest('.navbar-collapse.show a')) {
    menu.classList.remove('show');
    return;
  }

  // chiude il menu se si fa clic fuori dal menu
  if (menu.classList.contains('show') && !menu.contains(event.target)) {
    menu.classList.remove('show');
  }
});