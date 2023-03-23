// Imposta la data di fine del countdown
var countDownDate = new Date("Jun 8, 2023 16:00:00").getTime();

// Aggiorna il countdown ogni secondo
var x = setInterval(function () {
  // Ottieni la data e l'ora correnti
  var now = new Date().getTime();

  // Calcola la differenza tra la data di fine del countdown e la data corrente
  var distance = countDownDate - now;

  // Calcola i giorni, le ore, i minuti e i secondi rimanenti
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

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

//
// Alpine
//
const API_URL = "https://temiwordpress.httdev.it";

async function getLists() {
  const json = await (
    await fetch(`${API_URL}/test/wp-json/wp/v2/lists`)
  ).json();
  return json.map((list) => ({
    id: list.id,
    titolo: list.title.rendered,
    sottotitolo: list.meta.sottotitolo,
    immagine: list.meta.immagine,
  }));
}

async function submitRsvp(nome, email, partecipa) {
  const formdata = new FormData();
  formdata.append("your-name", nome);
  formdata.append("your-email", email);
  formdata.append("your-partecipa", partecipa);

  return await (
    await fetch(
      `${API_URL}/test/wp-json/contact-form-7/v1/contact-forms/12/feedback`,
      {
        method: "POST",
        body: formdata,
      }
    )
  ).json();
}

document.addEventListener("alpine:init", () => {
  Alpine.store("lists", {
    data: [],
    init() {
      getLists().then((data) => {
        this.data = data;
      });
    },
  });

  Alpine.data("formRsvp", () => ({
    nome: "",
    telefono: "",
    partecipa: "",
    submit() {
      submitRsvp(this.nome, this.telefono, this.partecipa);
    },
  }));
});
