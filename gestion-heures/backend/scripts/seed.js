const pool = require('../config/db');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad2 = (n) => String(n).padStart(2, '0');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = { reset: false, anneeId: null };
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--reset') out.reset = true;
    if (a === '--annee' && args[i + 1]) out.anneeId = Number(args[i + 1]);
  }
  return out;
};

const getActiveOrProvidedAnneeId = async (anneeId) => {
  if (anneeId) return anneeId;
  const [rows] = await pool.execute('SELECT id FROM annees_academiques WHERE active = 1 LIMIT 1');
  if (!rows[0]) throw new Error("Aucune année académique active trouvée. Spécifie --annee <id>.");
  return rows[0].id;
};

const main = async () => {
  const { reset, anneeId: providedAnneeId } = parseArgs();
  const anneeId = await getActiveOrProvidedAnneeId(providedAnneeId);

  const [deptRows] = await pool.execute('SELECT id, nom, code FROM departements');
  const byCode = new Map(deptRows.map((d) => [d.code, d]));

  const deptInfo = byCode.get('INFO') || deptRows.find((d) => /info/i.test(d.code) || /informatique/i.test(d.nom));
  const deptGest = byCode.get('GEST') || deptRows.find((d) => /gest/i.test(d.code) || /gestion/i.test(d.nom));

  if (!deptInfo || !deptGest) {
    throw new Error('Départements INFO et GEST introuvables. Vérifie la table departements.');
  }

  const [adminRows] = await pool.execute("SELECT id FROM utilisateurs WHERE role = 'admin' AND actif = 1 ORDER BY id LIMIT 1");
  const adminUserId = adminRows[0]?.id || null;

  if (reset) {
    await pool.execute('UPDATE utilisateurs SET enseignant_id = NULL WHERE enseignant_id IS NOT NULL');
    await pool.execute('DELETE FROM heures_effectuees');
    await pool.execute('DELETE FROM attributions');
    await pool.execute('DELETE FROM matieres WHERE annee_id = ?', [anneeId]);
    await pool.execute('DELETE FROM enseignants');
  }

  const noms = ['KONE', 'YAO', 'KOUAME', 'TRAORE', 'BAMBA', 'SOULE', 'GBE', 'DIABATE', 'COULIBALY', 'KOFFI', 'NDA', 'KASSI', 'KOUADIO'];
  const prenoms = ['Awa', 'Mariam', 'Fatou', 'Adama', 'Ibrahim', 'Kader', 'Nadia', 'Serge', 'Yves', 'Clarisse', 'Jean', 'Franck', 'Esther', 'Kevin'];
  const grades = ['Assistant', 'Maître-Assistant', 'Professeur', 'Autre'];
  const statuts = ['Permanent', 'Vacataire'];

  const enseignants = [];
  for (let i = 0; i < 20; i += 1) {
    const nom = pick(noms);
    const prenom = pick(prenoms);
    const matricule = `PIG${new Date().getFullYear()}${pad2(i + 1)}${randInt(10, 99)}`;
    const grade = pick(grades);
    const statut = pick(statuts);
    const departement_id = i < 10 ? deptInfo.id : deptGest.id;
    const taux_horaire_cm = randInt(6000, 14000);
    const taux_horaire_td = randInt(4000, 9000);
    const taux_horaire_tp = randInt(3000, 8000);
    const heures_contractuelles = randInt(40, 90);

    const [res] = await pool.execute(
      `INSERT INTO enseignants (nom, prenom, matricule, grade, statut, departement_id,
        taux_horaire_cm, taux_horaire_td, taux_horaire_tp, heures_contractuelles)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        nom,
        prenom,
        matricule,
        grade,
        statut,
        departement_id,
        taux_horaire_cm,
        taux_horaire_td,
        taux_horaire_tp,
        heures_contractuelles,
      ]
    );
    enseignants.push({ id: res.insertId, departement_id });
  }

  const niveaux = ['L1', 'L2', 'L3', 'M1', 'M2'];

  const catalogue = {
    Informatique: {
      departement_id: deptInfo.id,
      filiere: 'Informatique',
      modules: {
        L1: ['Algorithmique', 'Programmation 1', 'Architecture des ordinateurs', 'Bureautique', 'Bases des réseaux'],
        L2: ['Programmation 2', 'Bases de données', 'Systèmes d\'exploitation', 'Réseaux 1', 'Développement Web 1'],
        L3: ['Génie logiciel', 'Réseaux 2', 'Sécurité informatique', 'Développement Web 2', 'Administration Systèmes'],
        M1: ['Cloud & DevOps', 'Data Engineering', 'Cybersécurité', 'IA & Machine Learning', 'Architecture applicative'],
        M2: ['Projet professionnel', 'Audit & Gouvernance SI', 'Big Data', 'Sécurité avancée', 'Stage / Mémoire'],
      },
    },
    Compta: {
      departement_id: deptGest.id,
      filiere: 'Compta',
      modules: {
        L1: ['Comptabilité générale', 'Maths financières', 'Introduction au droit', 'Gestion', 'Microéconomie'],
        L2: ['Comptabilité analytique', 'Fiscalité 1', 'Contrôle de gestion', 'Macroéconomie', 'Excel avancé'],
        L3: ['Audit', 'Fiscalité 2', 'Gestion financière', 'Droit fiscal', 'Systèmes d\'information comptable'],
        M1: ['Normes IFRS', 'Reporting', 'Finance d\'entreprise', 'Tableaux de bord', 'ERP (Sage/Odoo)'],
        M2: ['Gestion des risques', 'Consolidation', 'Projet / Cas pratique', 'Mémoire', 'Stage'],
      },
    },
    Marketing: {
      departement_id: deptGest.id,
      filiere: 'Marketing',
      modules: {
        L1: ['Marketing fondamental', 'Communication', 'Introduction à la gestion', 'Comportement du consommateur', 'Outils bureautiques'],
        L2: ['Étude de marché', 'Marketing digital', 'Techniques de vente', 'CRM', 'Communication digitale'],
        L3: ['Stratégie marketing', 'Brand management', 'E-commerce', 'Publicité', 'Négociation commerciale'],
        M1: ['Marketing data', 'Growth marketing', 'Stratégie de marque', 'Gestion de projet', 'Marketing international'],
        M2: ['Plan marketing', 'Cas pratiques', 'Innovation', 'Mémoire', 'Stage'],
      },
    },
  };

  const matieres = [];
  for (const filiereKey of Object.keys(catalogue)) {
    const fil = catalogue[filiereKey];
    for (const niveau of niveaux) {
      const mods = fil.modules[niveau] || [];
      for (const intitule of mods) {
        const volume_cm_prevu = randInt(12, 45);
        const volume_td_prevu = randInt(8, 30);
        const volume_tp_prevu = filiereKey === 'Informatique' ? randInt(6, 30) : randInt(0, 12);
        const [res] = await pool.execute(
          `INSERT INTO matieres (intitule, filiere, niveau, volume_cm_prevu, volume_td_prevu, volume_tp_prevu, departement_id, annee_id)
           VALUES (?,?,?,?,?,?,?,?)`,
          [intitule, fil.filiere, niveau, volume_cm_prevu, volume_td_prevu, volume_tp_prevu, fil.departement_id, anneeId]
        );
        matieres.push({ id: res.insertId, departement_id: fil.departement_id, filiere: fil.filiere, niveau });
      }
    }
  }

  const pickMatieresForTeacher = (enseignant) => {
    const poolMat = matieres.filter((m) => m.departement_id === enseignant.departement_id);
    const count = randInt(3, 6);
    const picked = new Set();
    while (picked.size < Math.min(count, poolMat.length)) picked.add(pick(poolMat));
    return Array.from(picked);
  };

  const attributions = [];
  for (const ens of enseignants) {
    const mats = pickMatieresForTeacher(ens);
    for (const m of mats) {
      const semestre = pick(['S1', 'S2', 'Annuel']);
      const [res] = await pool.execute(
        'INSERT INTO attributions (enseignant_id, matiere_id, annee_id, semestre) VALUES (?,?,?,?)',
        [ens.id, m.id, anneeId, semestre]
      );
      attributions.push({ id: res.insertId, enseignant_id: ens.id, matiere_id: m.id });
    }
  }

  const mkRandomDate = () => {
    const month = randInt(10, 7 + 12);
    const year = month > 12 ? 2026 : 2025;
    const m = ((month - 1) % 12) + 1;
    const day = randInt(1, 26);
    return `${year}-${pad2(m)}-${pad2(day)}`;
  };

  const typeHeures = ['CM', 'TD', 'TP'];
  const salles = ['A1', 'A2', 'B1', 'B2', 'C1', 'LAB', 'Amphi'];

  for (const attr of attributions) {
    const sessions = randInt(8, 22);
    for (let i = 0; i < sessions; i += 1) {
      const type_heure = pick(typeHeures);
      const duree = [1.5, 2, 2.5, 3, 4][randInt(0, 4)];

      const r = Math.random();
      const statut_validation = r < 0.7 ? 'validee' : r < 0.95 ? 'en_attente' : 'rejetee';
      const valide_par = statut_validation === 'en_attente' ? null : adminUserId;
      const valide_le = statut_validation === 'en_attente' ? null : new Date();

      await pool.execute(
        `INSERT INTO heures_effectuees
         (attribution_id, date_cours, type_heure, duree, salle, observations, statut_validation, valide_par, valide_le)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          attr.id,
          mkRandomDate(),
          type_heure,
          duree,
          pick(salles),
          null,
          statut_validation,
          valide_par,
          valide_le,
        ]
      );
    }
  }

  console.log('Seed terminé.');
  console.log(`- Année: ${anneeId}`);
  console.log(`- Enseignants créés: ${enseignants.length}`);
  console.log(`- Matières créées: ${matieres.length}`);
  console.log(`- Attributions créées: ${attributions.length}`);

  await pool.end();
};

main().catch(async (err) => {
  console.error('Erreur seed:', err.message);
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
