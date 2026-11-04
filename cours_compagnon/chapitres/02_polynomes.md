# Chapitre 02 : Polynômes

Script : [`scripts/02_polynomes_division.py`](../scripts/02_polynomes_division.py)

## Idée du cours
Pour deux polynômes $A$ et $B \neq 0$, il existe un unique couple $(Q,R)$ avec
$$A = BQ + R, \qquad \deg R < \deg B.$$
Un polynôme se factorise différemment sur $\mathbb{Q}$ et sur $\mathbb{C}$.

## Ce que fait le script
1. Effectue la division euclidienne de `A` par `B` (`sympy.div`).
2. Vérifie que $BQ + R - A = 0$.
3. Factorise $x^4 - 1$ sur $\mathbb{Q}$ puis sur $\mathbb{C}$.
4. Affiche les racines avec leur multiplicité.

## À modifier
`A`, `B` et `P` : essayez vos propres polynômes, puis comparez avec votre division faite à la main.

## Pour réfléchir
Pourquoi la factorisation sur $\mathbb{C}$ est-elle complète, alors que sur $\mathbb{Q}$ il reste un facteur de degré 2 ?
