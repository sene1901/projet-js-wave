 let valeurVisible = true;
// affiche et casser le montant
function casserValeur() {
  const valeurAffich = document.getElementById("balance");
  valeurVisible  = !valeurVisible ;
  valeurAffich.textContent = valeurVisible ? solde : "••••••";

  //  changer l’icône de l’œil
  const eyeIcon = document.querySelector(".eye i");
  eyeIcon.classList.toggle("bi-eye");
  eyeIcon.classList.toggle("bi-eye-slash");
}
    //Charger le solde depuis localStorage
let solde = localStorage.getItem("solde");
solde = solde ? parseFloat(solde) : 2500000;

// mise en jour du solde restant apres (transfert,depot,retrait)
  function updateAffichageSolde() {
   document.getElementById("balance").textContent =
    solde.toLocaleString("fr-FR") + " F";
  localStorage.setItem("solde", solde); // sauvegarde après chaque update
  }
    // Génération du QR Code
    new QRCode(document.getElementById("qrcode"), {
      text: "https://www.wave.com/fr/", // mets ton lien/ID ici
      width: 128,
      height: 125,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });





  //  pour l’historique des 3 actions (transfert,depot,retrait)
// --- HISTORIQUE --- //
let historique = [];
let limite = 5; // nombre de résultats affichés initialement

// Charger l'historique depuis localStorage
function chargerHistorique() {
  let data = localStorage.getItem("historique");
  if (data) {
    historique = JSON.parse(data);
  }
  afficherHistoriqueComplet();
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
  afficherHistoriqueComplet();
}

// Afficher l'historique complet ou filtré avec limitation
function afficherHistoriqueComplet(liste = historique) {
  const tbody = document.getElementById("historique");
  tbody.innerHTML = "";

  let afficheListe = liste.slice(0, limite); // Limiter l'affichage
  afficheListe.forEach(op => {
    const tr = document.createElement("tr");
    let couleur = "text-dark";
    if (op.type === "Dépôt") couleur = "text-success";
    if (op.type === "Retrait" || op.type === "Transfert") couleur = "text-danger";

    tr.innerHTML = `
      <td>${op.type} (${op.date})</td>
      <td class="${couleur}">${op.type === "Dépôt" ? "+" : "-"}${op.montant.toLocaleString("fr-FR")} F</td>
    `;
    tbody.appendChild(tr);
  });

  // Gérer le bouton Voir plus
  const voirPlus = document.getElementById("voirPlus");
  if (liste.length > limite) {
    voirPlus.style.display = "block";
  } else {
    voirPlus.style.display = "none";
  }
}

// Filtrer l'historique en temps réel
document.getElementById("rechercheHistorique").addEventListener("keyup", () => {
  let valeur = document.getElementById("rechercheHistorique").value.trim().toLowerCase();

  if (!valeur) {
    limite = 5; // réinitialiser limite
    afficherHistoriqueComplet();
    return;
  }

  let resultat = historique.filter(op =>
    op.type.toLowerCase().includes(valeur) ||
    op.date.toLowerCase().includes(valeur) ||
    op.montant.toString().includes(valeur)
  );

  limite = 5; // réinitialiser limite pour la recherche
  afficherHistoriqueComplet(resultat);
});

// Bouton Voir plus pour charger +10 résultats
document.getElementById("voirPlus").addEventListener("click", () => {
  limite += 5;
  afficherHistoriqueComplet();
});

// Charger l'historique au démarrage
chargerHistorique();




 
  // Gestion transfert
  const form = document.getElementById("formTransfert");
  const inputMontant = document.getElementById("montantTransfert");
  const inputFrais = document.getElementById("frais");

  // Calcul des frais en temps réel quand on tape le montant
  inputMontant.addEventListener("input", () => {
    let montant = parseFloat(inputMontant.value);
    if (!isNaN(montant) && montant > 0) {
      let frais = montant * 0.01;
      inputFrais.value = frais.toFixed(2) + " FCFA";
    } else {
      inputFrais.value = "";
    }
  });

  document.getElementById("btnEnvoyer").addEventListener("click", (e) => {
    e.preventDefault(); // éviter le rechargement de la page
    
    let destinataire = document.getElementById("destinataire").value.trim();
    let montant = parseFloat(inputMontant.value);
    let frais = montant * 0.01;
    let total = montant + frais;

    // Contrôle de saisie
    if (!destinataire || isNaN(montant) || montant <= 0) {
      alert("Veuillez saisir un destinataire et un montant valide !");
      return;
    }

    if (total > solde) {
      form.reset();
      inputFrais.value = "";
      return;
    }

    // Débit du solde
    solde -= total;
    alert(`Transfert de ${montant} FCFA à ${destinataire} effectué avec succès !\nFrais: ${frais} FCFA\nNouveau solde: ${solde} FCFA`);

    // Fermer la modale
    let modal = bootstrap.Modal.getInstance(document.getElementById("modalTransfert"));
    modal.hide();

    // Reset du formulaire après succès
    form.reset();
    inputFrais.value = "";
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