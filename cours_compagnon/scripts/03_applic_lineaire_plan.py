"""Ch.Espaces vectoriels / applications lineaires : action d'une matrice sur le plan."""
import numpy as np
import matplotlib.pyplot as plt
import sympy as sp

M = np.array([[2, 1],
              [0, 1]])            # matrice de l'application lineaire (modifiable)

# Image du carre unite et des vecteurs de base
carre = np.array([[0, 1, 1, 0, 0], [0, 0, 1, 1, 0]])
image = M @ carre

fig, ax = plt.subplots(figsize=(5, 5))
ax.plot(*carre, label="carre unite")
ax.plot(*image, label="image par $f$")
for v, c in [((1, 0), "tab:green"), ((0, 1), "tab:red")]:
    w = M @ np.array(v)
    ax.annotate("", xy=w, xytext=(0, 0), arrowprops=dict(arrowstyle="->", color=c))
ax.set_aspect("equal"); ax.grid(alpha=.3); ax.legend()
ax.set_title("Image du carre unite")
fig.savefig("03_applic_lineaire_plan.png", dpi=120)

# Noyau, image, rang, valeurs propres (sympy)
S = sp.Matrix(M.tolist())
print("rang      :", S.rank())
print("noyau     :", S.nullspace())
print("det       :", S.det())
print("v. propres:", S.eigenvects())
