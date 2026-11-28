# -*- coding: utf-8 -*-
"""Génère graphe.json (constellation 3D du site) à partir de index.html.

Nœuds : chapitres et notions (= thèmes des chapitres). Le semestre est un attribut (couleur + amas dans l'espace).
Liens : "hierarchie" (chapitre -> notion)
        "prerequis" (notion A nécessaire pour aborder B)
        "outil"     (technique de A réutilisée dans B, sans être un préalable strict)
La liste LIENS vient d'une analyse du contenu du site (fiches, animations, ~500 questions : voir
../analyse_liens.py et ../analyse_liens.md) croisée avec la progression du cours.
Le nombre entre parenthèses de « preuve » = unités du site (paragraphes, questions) de B qui utilisent la technique de A.

Usage (depuis la racine du dépôt) :  python outils/graphe_json.py
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index.html')
OUT = os.path.join(ROOT, 'graphe.json')

SEM = [('S1', '1re année · S1', '01', '06'), ('S2', '1re année · S2', '07', '11'), ('S3', '2e année · S3', '12', '14'),
       ('S4', '2e année · S4', '15', '16'), ('S6', '3e année · S6', '17', '17')]

P, O = 'prerequis', 'outil'
# Sous-chapitres de l'atelier -> notions du site (numérotation du site : ch. 05 = Déterminants, 06 = Diagonalisation, ...)
ATELIER_VERS_SITE = {
    '01.1': 'c01t1', '01.2': 'c01t1', '01.5': 'c01t1', '01.7': 'c01t1', '01.3': 'c01t2', '01.4': 'c01t3', '01.6': 'c01t4',
    '02.1': 'c02t1', '02.2': 'c02t1', '02.3': 'c02t2', '02.4': 'c02t3',
    '03.1': 'c03t1', '03.2': 'c03t1', '03.3': 'c03t1', '03.4': 'c03t1', '03.5': 'c03t1', '03.6': 'c03t2',
    '04.1': 'c04t1', '04.2': 'c04t2', '04.3': 'c04t2', '04.5': 'c04t2', '04.4': 'c06t1',
    '06.1': 'c05t1', '06.2': 'c05t1', '06.3': 'c04t3', '06.4': 'c05t2', '06.5': 'c04t2', '06.7': 'c05t3', '06.8': 'c05t3',
    '07.1': 'c06t2', '07.3': 'c06t2', '07.2': 'c06t3', '07.4': 'c06t3',
    '08.3': 'c07t1', '08.1': 'c07t2', '08.2': 'c07t3', '09': 'c08t2',
    '10.2': 'c09t1', '10.1': 'c09t2', '10.3': 'c09t3', '10.4': 'c09t3', '10.5': 'c09t3',
    '11.1': 'c10t2', '11.2': 'c10t2', '11.3': 'c10t3',
    '12.1': 'c11t1', '12.3': 'c11t1', '12.2': 'c11t2', '12.2.1': 'c11t2', '12.2.2': 'c11t2', '12.2.3': 'c11t2', '12.6': 'c11t2',
    '12.4': 'c11t3', '12.5': 'c11t3', '12.5.1': 'c11t3', '12.5.2': 'c11t3',
    '13.1': 'c12t1', '13.2': 'c12t3',
    '14.1': 'c13t1', '14.7': 'c13t1', '14.2': 'c13t2', '14.4.1': 'c13t3', '14.4.2': 'c13t3', '14.4.3': 'c13t3', '14.3': 'c13t4',
    '15.1': 'c14t1', '15.2': 'c14t2', '15.3': 'c14t3', '15.4': 'c14t4', '15.5': 'c14t4',
    '16': 'c15t1', '17': 'c16t1',
    '19.1': 'c17t1', '19.4': 'c17t2', '19.2': 'c17t3', '19.3': 'c17t4',
}
# (A, B, type, pourquoi, preuve = nb d'unités du site de B qui utilisent A ; 0 = lien de cours, sans compteur)
LIENS = [
    # Complexes
    ('c01t1', 'c01t2', P, 'Euler et Moivre partent de la forme exponentielle', 8),
    ('c01t1', 'c01t4', P, 'racines n-ièmes en forme exponentielle', 14),
    ('c01t3', 'c02t3', P, 'racines complexes du second degré pour factoriser', 7),
    ('c01t4', 'c02t3', P, 'racines n-ièmes pour factoriser Xⁿ − a', 0),
    ('c01t3', 'c12t3', P, 'équation caractéristique à racines complexes', 12),
    ('c01t2', 'c11t3', P, 'linéariser cosⁿ, sinⁿ avant d\'intégrer', 5),
    ('c01t1', 'c16t1', O, 'module, argument ↔ coordonnées polaires (r, θ)', 0),
    ('c01t3', 'c13t4', O, 'le signe de rt − s² joue le rôle du discriminant', 16),
    # Polynômes
    ('c02t1', 'c10t1', P, 'partie entière = quotient de la division euclidienne', 7),
    ('c02t3', 'c10t1', P, 'factoriser pour trouver pôles et forme irréductible', 12),
    ('c02t2', 'c10t2', P, 'pôle multiple = racine multiple du dénominateur', 0),
    ('c02t3', 'c10t2', P, 'factoriser le dénominateur pour décomposer', 0),
    ('c02t3', 'c06t2', P, 'factoriser le polynôme caractéristique', 0),
    ('c02t2', 'c06t2', O, 'multiplicité d\'une valeur propre', 11),
    # Espaces vectoriels, applications linéaires, matrices
    ('c03t1', 'c04t1', P, 'bases et dimension pour le théorème du rang', 13),
    ('c03t1', 'c04t2', P, 'matrice d\'une application dans des bases', 9),
    ('c03t1', 'c06t1', P, 'base de vecteurs propres', 20),
    ('c03t2', 'c06t3', P, 'matrices symétriques : base orthonormée', 11),
    ('c04t2', 'c04t3', P, 'produit matriciel pour vérifier A A⁻¹ = I', 10),
    ('c04t1', 'c05t3', P, 'noyau = solutions du système homogène', 0),
    ('c04t3', 'c05t2', P, 'inverse par la comatrice', 23),
    ('c04t2', 'c06t1', P, 'matrice d\'une application dans une autre base', 11),
    ('c04t3', 'c06t1', P, 'P⁻¹ dans la formule de changement de base', 15),
    ('c04t2', 'c06t3', P, 'Aⁿ = P Dⁿ P⁻¹ : produits matriciels', 19),
    # Déterminants, diagonalisation
    ('c05t1', 'c05t2', P, 'inverse et bases par le déterminant', 27),
    ('c05t1', 'c05t3', P, 'formules de Cramer', 22),
    ('c05t1', 'c06t2', P, 'polynôme caractéristique = det(A − λI)', 15),
    ('c06t1', 'c06t2', P, 'diagonaliser = changer de base', 6),
    ('c06t2', 'c06t3', P, 'puissances, matrices symétriques, systèmes', 20),
    ('c12t1', 'c06t3', P, 'systèmes différentiels : équations du 1er ordre', 0),
    # Fonctions, trigo réciproques
    ('c07t1', 'c07t2', P, 'dérivées usuelles avant les règles de calcul', 11),
    ('c07t2', 'c08t2', P, 'dérivée d\'une composée arcsin(u), arctan(u)', 12),
    ('c08t1', 'c08t2', P, 'définitions avant les dérivées', 25),
    ('c08t1', 'c08t3', P, 'valeurs et domaines pour simplifier', 27),
    # DL
    ('c07t1', 'c09t2', P, 'formule de Taylor : dérivées successives', 0),
    ('c07t2', 'c09t2', O, 'composer des DL comme des fonctions', 6),
    ('c09t1', 'c09t3', P, 'équivalents pour les limites', 13),
    ('c09t2', 'c09t3', P, 'DL pour limites, tangentes, asymptotes', 27),
    ('c07t3', 'c09t3', P, 'asymptotes et position relative', 13),
    # Fractions rationnelles, intégrales
    ('c10t1', 'c10t2', P, 'partie entière et pôles avant la décomposition', 0),
    ('c10t2', 'c10t3', P, 'décomposition dans ℝ', 7),
    ('c07t1', 'c11t1', P, 'primitive = dérivée lue à l\'envers', 8),
    ('c08t2', 'c11t1', P, 'primitives en arctan et arcsin', 0),
    ('c11t1', 'c11t2', P, 'primitives usuelles dans les parties', 27),
    ('c07t2', 'c11t2', O, 'u\'v + uv\' : dérivée d\'un produit', 5),
    ('c11t1', 'c11t3', P, 'changement de variable', 23),
    ('c10t2', 'c11t3', P, 'éléments simples pour intégrer une fraction', 8),
    ('c08t1', 'c11t3', O, 'primitives en arctan', 9),
    # Équations différentielles
    ('c11t1', 'c12t1', P, 'résoudre y\' + a y = 0 par une primitive', 12),
    ('c12t1', 'c12t2', P, 'homogène puis variation de la constante', 10),
    ('c11t2', 'c12t2', O, 'intégrer par parties pour la constante', 0),
    ('c12t1', 'c12t3', P, 'structure des solutions (homogène + particulière)', 12),
    ('c12t3', 'c12t4', P, 'solution générale = homogène + particulière', 23),
    # Plusieurs variables, intégrales multiples
    ('c07t2', 'c13t1', P, 'dérivées partielles = dérivées usuelles', 9),
    ('c07t2', 'c13t2', P, 'règle de la chaîne', 9),
    ('c13t1', 'c13t2', P, 'dérivées partielles des composées', 17),
    ('c13t1', 'c13t3', P, 'forme exacte : dérivées croisées', 4),
    ('c13t1', 'c13t4', P, 'points critiques : dérivées partielles nulles', 5),
    ('c03t2', 'c13t1', O, 'vecteur normal du plan tangent', 0),
    ('c11t1', 'c14t1', P, 'intégrales simples imbriquées', 14),
    ('c14t1', 'c14t2', P, 'domaine puis passage en polaires', 10),
    ('c11t1', 'c14t2', P, 'changement de variable', 11),
    ('c14t2', 'c14t3', P, 'cylindriques = polaires + z', 15),
    ('c14t1', 'c14t3', P, 'de deux à trois variables', 5),
    ('c14t1', 'c14t4', P, 'aires et masses par intégrales doubles', 8),
    ('c14t3', 'c14t4', P, 'volumes, centre de gravité, inertie', 0),
    # Courbes
    ('c07t3', 'c15t3', P, 'variations de x(t) et y(t)', 0),
    ('c09t2', 'c15t1', P, 'DL au point stationnaire', 0),
    ('c07t3', 'c15t2', P, 'asymptotes et branches infinies', 16),
    ('c09t1', 'c15t2', P, 'équivalents pour les branches infinies', 0),
    ('c15t1', 'c15t3', P, 'étude locale dans le plan d\'étude', 5),
    ('c14t2', 'c16t1', O, 'coordonnées polaires', 27),
    ('c15t1', 'c16t2', P, 'tangente : même idée qu\'en paramétré', 0),
    ('c15t2', 'c16t3', P, 'branches infinies en polaires', 0),
    ('c07t3', 'c16t3', O, 'plan d\'étude d\'une fonction', 18),
    ('c09t1', 'c16t3', O, 'équivalents pour les branches', 7),
    # Laplace
    ('c11t2', 'c17t1', P, 'transformées usuelles par parties', 0),
    ('c17t1', 'c17t2', P, 'propriétés à partir des transformées usuelles', 4),
    ('c17t2', 'c17t3', P, 'retard et amortissement pour les originaux', 0),
    ('c10t2', 'c17t3', P, 'originaux : décomposer F(p) en éléments simples', 11),
    ('c17t3', 'c17t4', P, 'revenir au temps', 0),
    ('c12t1', 'c17t4', P, 'équations du 1er ordre résolues par Laplace', 13),
    ('c12t3', 'c17t4', P, 'équations du 2nd ordre résolues par Laplace', 12),
]


def main():
    s = open(SRC, encoding='utf8').read()
    i = s.find('const CHAPTERS=') + len('const CHAPTERS=')
    chapters, _ = json.JSONDecoder().raw_decode(s[i:])
    m = re.search(r'const MASQUES=(\[.*?\]);', s)
    masques = set(json.loads(m.group(1))) if m else set()
    chapters = [c for c in chapters if c['n'] not in masques]

    nodes, links, ids = [], [], set()
    sem_of = lambda n: next(x for x in SEM if x[2] <= n <= x[3])
    for c in chapters:
        cid = 'c' + c['n']; sid, slab = sem_of(c['n'])[:2]
        tot = {'n1': 0, 'n2': 0, 'n3': 0}
        for k, t in enumerate(c['themes'], 1):
            nid = '%st%d' % (cid, k); q = t.get('q') or {}
            nb = {lv: sum(1 for x in (q.get(lv) or []) if x.get('type') != 'description') for lv in ('n1', 'n2', 'n3')}
            for lv in tot: tot[lv] += nb[lv]
            nodes.append({'id': nid, 'type': 'notion', 'label': t['title'], 'chap': cid, 'chapLabel': c['n'] + ' · ' + c['t'], 'sem': sid, 'semLabel': slab,
                          'cours': '#' + nid, 'exos': '#' + nid + ('n3' if nb['n3'] else 'n2' if nb['n2'] else 'n1'), 'nb': nb})
            ids.add(nid)
            links.append({'source': cid, 'target': nid, 'type': 'hierarchie'})
        nodes.append({'id': cid, 'type': 'chapitre', 'label': c['n'] + ' · ' + c['t'], 'sem': sid, 'semLabel': slab, 'cours': '#%st1' % cid, 'exos': '#%st1n3' % cid,
                      'nb': dict(tot, notions=len(c['themes']))})
        ids.add(cid)
    bad, par = [], {}
    for a, b, typ, why, preuve in LIENS:
        if a in ids and b in ids: par[(a, b)] = {'source': a, 'target': b, 'type': typ, 'why': why, 'preuve': preuve, 'fiches': 0}
        else: bad.append((a, b))
    # Dépendances tirées des corrigés de l'atelier (codes atelier -> notions du site), cf. outils/dependances.json
    D = json.load(open(os.path.join(ROOT, 'outils', 'dependances.json'), encoding='utf8'))['liens']
    rang = {'prerequis': 2, 'application': 2, 'outil': 1}
    for d in D:
        a, b = ATELIER_VERS_SITE.get(d['a']), ATELIER_VERS_SITE.get(d['b'])
        if not a or not b or a == b or a not in ids or b not in ids: continue
        if (b, a) in par: continue  # garder le sens du cours
        typ = 'prerequis' if d['type'] in ('prerequis', 'application') else 'outil'
        o = par.get((a, b))
        if o is None:
            par[(a, b)] = {'source': a, 'target': b, 'type': typ, 'why': ('utilise : ' + d['raison']) if d['source'] == 'fiches' else d['raison'], 'preuve': 0, 'fiches': d['fiches']}
        else:
            o['fiches'] = max(o['fiches'], d['fiches'])
            if rang[typ] > rang.get(o['type'], 0): o['type'] = typ
    for o in par.values(): links.append(o)
    json.dump({'version': 2, 'nodes': nodes, 'links': links}, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    n = lambda t: sum(l['type'] == t for l in links)
    print('%d nœuds, %d liens (%d prérequis, %d outils) -> %s' % (len(nodes), len(links), n(P), n(O), OUT))
    if bad:
        print('Liens ignorés (notion absente ou doublon) :', bad)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf8')
    main()
