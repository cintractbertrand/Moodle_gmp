# Chapitre 19 : Transformée de Laplace

Script : [`scripts/04_laplace_sympy.py`](../scripts/04_laplace_sympy.py)

## Idée du cours
La transformée de Laplace $\mathcal{L}(y)(p) = Y(p)$ transforme une équation différentielle en équation algébrique. Pour $y' + 2y = 1$, $y(0)=0$ :
$$pY(p) - y(0) + 2Y(p) = \frac{1}{p}.$$

## Ce que fait le script
1. Calcule la transformée de quelques fonctions usuelles.
2. Résout l'équation algébrique en $Y(p)$, décompose en éléments simples.
3. Revient à $y(t)$ par transformée inverse.
4. Vérifie avec `dsolve`.

## À modifier
Les fonctions de la liste, le second membre et la condition initiale.

## Pour réfléchir
Refaites la décomposition en éléments simples à la main et comparez avec `apart`.
