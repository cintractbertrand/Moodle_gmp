# -*- coding: utf-8 -*-
"""Génère graphe.json (constellation 3D du site) à partir de index.html.

Nœuds : semestres, chapitres, notions (= thèmes des chapitres).
Liens : "hierarchie" (semestre -> chapitre -> notion, et fil S1 -> S2 -> ...)
        "prerequis" (notion A nécessaire pour notion B), liste PREREQ ci-dessous.
Chaque nœud porte l'ancre du cours (#cNNtK) et celle des exercices (#cNNtKn3).

Usage (depuis la racine du dépôt) :  python outils/graphe_json.py
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index.html')
OUT = os.path.join(ROOT, 'graphe.json')

# Semestres du site (numérotation du site : 01 à 17)
SEM = [('S1', '1re année · S1', '01', '06'), ('S2', '1re année · S2', '07', '11'), ('S3', '2e année · S3', '12', '14'),
       ('S4', '2e année · S4', '15', '16'), ('S6', '3e année · S6', '17', '17')]

# Prérequis transversaux : (notion source, notion cible, pourquoi). Notion = "cNNtK" (chapitre NN, thème K du site).
PREREQ = [
    ('c01t1', 'c01t2', 'Moivre et Euler partent de la forme exponentielle'),
    ('c01t1', 'c01t4', 'racines n-ièmes en forme exponentielle'),
    ('c01t3', 'c02t3', 'racines complexes du second degré pour factoriser'),
    ('c01t4', 'c02t3', 'racines n-ièmes pour factoriser Xⁿ − a dans ℂ[X]'),
    ('c01t1', 'c16t1', 'module et argument ↔ coordonnées polaires (r, θ)'),
    ('c01t2', 'c11t3', 'linéariser cosⁿ, sinⁿ avant d\'intégrer'),
    ('c01t3', 'c12t3', 'équation caractéristique : racines complexes'),
    ('c02t1', 'c10t1', 'partie entière = quotient de la division euclidienne'),
    ('c02t2', 'c10t2', 'pôle multiple = racine multiple du dénominateur'),
    ('c02t3', 'c10t2', 'factoriser le dénominateur pour décomposer'),
    ('c02t3', 'c06t2', 'factoriser le polynôme caractéristique'),
    ('c03t1', 'c04t1', 'bases et dimension pour le théorème du rang'),
    ('c03t1', 'c06t1', 'base de vecteurs propres'),
    ('c03t2', 'c13t1', 'vecteur normal du plan tangent'),
    ('c04t1', 'c05t3', 'noyau = solutions du système homogène'),
    ('c04t2', 'c06t1', 'matrice d\'une application dans une autre base'),
    ('c04t3', 'c05t2', 'inverse par la comatrice'),
    ('c05t1', 'c06t2', 'polynôme caractéristique = déterminant'),
    ('c06t1', 'c06t2', 'diagonaliser = changer de base'),
    ('c06t2', 'c06t3', 'Aⁿ = P Dⁿ P⁻¹, systèmes découplés'),
    ('c12t1', 'c06t3', 'systèmes différentiels : équations du 1er ordre'),
    ('c07t1', 'c09t2', 'formule de Taylor : dérivées successives'),
    ('c07t2', 'c08t2', 'dérivée d\'une composée'),
    ('c07t1', 'c11t1', 'primitive = dérivée lue à l\'envers'),
    ('c07t2', 'c13t1', 'dérivées partielles = dérivées usuelles'),
    ('c07t2', 'c13t2', 'règle de la chaîne'),
    ('c07t3', 'c09t3', 'asymptotes et position par DL'),
    ('c07t3', 'c15t3', 'variations de x(t) et y(t)'),
    ('c08t2', 'c11t1', 'primitives en arctan et arcsin'),
    ('c09t1', 'c15t2', 'équivalents pour les branches infinies'),
    ('c09t2', 'c09t3', 'DL pour limites, tangentes, asymptotes'),
    ('c09t2', 'c15t1', 'DL au point stationnaire'),
    ('c10t2', 'c11t3', 'primitives de fractions rationnelles'),
    ('c10t2', 'c17t3', 'originaux : décomposer F(p)'),
    ('c11t1', 'c12t1', 'résoudre y\' + a y = 0 par une primitive'),
    ('c11t2', 'c12t2', 'variation de la constante : intégrer'),
    ('c11t1', 'c14t1', 'intégrales simples imbriquées'),
    ('c11t1', 'c14t2', 'changement de variable en polaires'),
    ('c11t2', 'c17t1', 'transformées usuelles par parties'),
    ('c12t3', 'c12t4', 'solution générale = homogène + particulière'),
    ('c12t4', 'c17t4', 'équations différentielles résolues par Laplace'),
    ('c13t1', 'c13t3', 'forme exacte : dérivées croisées'),
    ('c13t1', 'c13t4', 'points critiques : dérivées partielles nulles'),
    ('c14t1', 'c14t3', 'de deux à trois variables'),
    ('c14t2', 'c14t3', 'cylindriques = polaires + z'),
    ('c14t3', 'c14t4', 'masse, centre de gravité, inertie'),
    ('c15t1', 'c16t2', 'tangente en polaires'),
    ('c15t2', 'c16t3', 'branches infinies en polaires'),
    ('c17t2', 'c17t3', 'retard et amortissement pour les originaux'),
    ('c17t3', 'c17t4', 'revenir au temps'),
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
    for sid, lab, a, b in SEM:
        cs = [c for c in chapters if a <= c['n'] <= b]
        if not cs:
            continue
        nodes.append({'id': sid, 'type': 'semestre', 'label': sid, 'sub': lab, 'sem': sid, 'cours': '#c%st1' % cs[0]['n'], 'exos': '#c%st1n1' % cs[0]['n'],
                      'nb': {'chap': len(cs), 'notions': sum(len(c['themes']) for c in cs)}})
        ids.add(sid)
    sems = [n['id'] for n in nodes]
    for x, y in zip(sems, sems[1:]):
        links.append({'source': x, 'target': y, 'type': 'hierarchie', 'niveau': 'semestre'})
    for c in chapters:
        cid = 'c' + c['n']; sid = sem_of(c['n'])[0]
        tot = {'n1': 0, 'n2': 0, 'n3': 0}
        for k, t in enumerate(c['themes'], 1):
            nid = '%st%d' % (cid, k); q = t.get('q') or {}
            nb = {lv: sum(1 for x in (q.get(lv) or []) if x.get('type') != 'description') for lv in ('n1', 'n2', 'n3')}
            for lv in tot: tot[lv] += nb[lv]
            nodes.append({'id': nid, 'type': 'notion', 'label': t['title'], 'chap': cid, 'chapLabel': c['n'] + ' · ' + c['t'], 'sem': sid,
                          'cours': '#' + nid, 'exos': '#' + nid + ('n3' if nb['n3'] else 'n2' if nb['n2'] else 'n1'), 'nb': nb})
            ids.add(nid)
            links.append({'source': cid, 'target': nid, 'type': 'hierarchie', 'niveau': 'notion'})
        nodes.append({'id': cid, 'type': 'chapitre', 'label': c['n'] + ' · ' + c['t'], 'sem': sid, 'cours': '#%st1' % cid, 'exos': '#%st1n3' % cid,
                      'nb': dict(tot, notions=len(c['themes']))})
        ids.add(cid)
        links.append({'source': sid, 'target': cid, 'type': 'hierarchie', 'niveau': 'chapitre'})
    bad = []
    for a, b, why in PREREQ:
        if a in ids and b in ids:
            links.append({'source': a, 'target': b, 'type': 'prerequis', 'why': why})
        else:
            bad.append((a, b))
    json.dump({'version': 1, 'nodes': nodes, 'links': links}, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print('%d nœuds, %d liens (%d prérequis) -> %s' % (len(nodes), len(links), sum(l['type'] == 'prerequis' for l in links), OUT))
    if bad:
        print('Prérequis ignorés (notion absente) :', bad)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf8')
    main()
