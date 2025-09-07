 let valeurVisible = true;
// affiche et casser le montant
function casserValeur() {
  const valeurAffich = document.getElementById("balance");
  valeurVisible  = !valeurVisible ;
  valeurAffich.textContent = valeurVisible ? "120.000 F" : "••••••";

  //  changer l’icône de l’œil
  const eyeIcon = document.querySelector(".eye i");
  eyeIcon.classList.toggle("bi-eye");
  eyeIcon.classList.toggle("bi-eye-slash");
}


    // Génération du QR Code
    new QRCode(document.getElementById("qrcode"), {
      text: "https://www.wave.com/fr/", // mets ton lien/ID ici
      width: 128,
      height: 128,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });

    let solde = 120000; // solde initial (exemple)
// mise en jour du solde restant apres (transfert,depot,retrait)
  function updateAffichageSolde() {
    document.getElementById("balance").textContent =
      solde.toLocaleString("fr-FR") + " F";
  }
  //  pour l’historique des 3 actions (transfert,depot,retrait)
// --- HISTORIQUE --- //
let historique = [];

// Charger l'historique depuis localStorage
function chargerHistorique() {
  let data = localStorage.getItem("historique");
  if (data) {
    historique = JSON.parse(data);
    historique.forEach(op => afficherOperation(op));
  }
}

// Ajouter une opération à l'historique (page + localStorage)
function ajouterHistorique(type, montant) {
  const operation = {
    type: type,
    montant: montant,
    date: new Date().toLocaleString("fr-FR")
  };
  historique.unshift(operation); // ajouter en début
  localStorage.setItem("historique", JSON.stringify(historique));
  afficherOperation(operation);
}

// Afficher une opération dans le tableau
function afficherOperation(op) {
  const tbody = document.getElementById("historique");
  const tr = document.createElement("tr");
  let couleur = "text-dark";
  if (op.type === "Dépôt") couleur = "text-success";
  if (op.type === "Retrait" || op.type === "Transfert") couleur = "text-danger";

  tr.innerHTML = `
    <td>${op.type} (${op.date})</td>
    <td class="${couleur}">${op.type === "Dépôt" ? "+" : "-"}${op.montant.toLocaleString("fr-FR")} F</td>
  `;
  tbody.prepend(tr);
}

 
  // Gestion transfert
  document.getElementById("btnEnvoyer").addEventListener("click", () => {
    let destinataire = document.getElementById("destinataire").value.trim();
    let montant = parseFloat(document.getElementById("montantTransfert").value);
    // controle de saisie
    if (!destinataire || isNaN(montant) || montant <= 0) {
      alert("Veuillez saisir un destinataire et un montant valide !");
      return;
    }

    // Calcul frais
    let frais = montant * 0.02;
    let total = montant + frais;

    if (total > solde) {
      alert("Solde insuffisant pour effectuer ce transfert !");
      return;
    }

    // Mise à jour du solde
    solde -= total;
    updateAffichageSolde();
    ajouterHistorique("Transfert", montant);
    alert(` Transfert de ${montant} F à ${destinataire} effectué.\nFrais : ${frais.toFixed(0)} F`);

    // Fermer la modale proprement
    let modal = bootstrap.Modal.getInstance(document.getElementById("modalTransfert"));
    modal.hide();

    // vider les champs apres saisie
    document.getElementById("destinataire").value = "";
    document.getElementById("montantTransfert").value = "";
  });

  // Gestion Dépôt
document.getElementById("btnDeposer").addEventListener("click", () => {
  let montant = parseFloat(document.getElementById("montantDepot").value);

  if (isNaN(montant) || montant <= 0) {
    alert("Veuillez saisir un montant valide !");
    return;
  }

  // Mise à jour du solde (pas de frais)
  solde += montant;
  updateAffichageSolde();
  ajouterHistorique("Dépôt", montant);

  // Fermer la modale
  let modal = bootstrap.Modal.getInstance(document.getElementById("modalDepot"));
  modal.hide();

  // vider le champ apres saisie
  document.getElementById("montantDepot").value = "";

  alert(` Dépôt de ${montant.toLocaleString("fr-FR")} F effectué.`);
});


  // Gestion Retrait
document.getElementById("btnRetirer").addEventListener("click", () => {
  let montant = parseFloat(document.getElementById("montantRetrait").value);

  if (isNaN(montant) || montant <= 0) {
    alert("Veuillez saisir un montant valide !");
    return;
  }

  if (montant > solde) {
    alert("Solde insuffisant pour effectuer ce retrait !");
    return;
  }

  // Mise à jour du solde
  solde -= montant;
  updateAffichageSolde();
  ajouterHistorique("Retrait", montant);
  // Fermer la modale
  let modal = bootstrap.Modal.getInstance(document.getElementById("modalRetrait"));
  modal.hide();

  // Reset champ
  document.getElementById("montantRetrait").value = "";

  alert(` Retrait de ${montant.toLocaleString("fr-FR")} F effectué.`);
});
// --- INITIALISATION --- //
updateAffichageSolde();
chargerHistorique();