"""Ch.01 Complexes : racines n-iemes d'un complexe, tracees sur le cercle."""
import numpy as np
import matplotlib.pyplot as plt

z = -8 + 0j            # nombre dont on cherche les racines (modifiable)
n = 3                  # ordre de la racine

r, theta = abs(z), np.angle(z)                 # module et argument
k = np.arange(n)
racines = r**(1/n) * np.exp(1j*(theta + 2*np.pi*k)/n)   # formule de Moivre

for kk, w in zip(k, racines):
    print(f"k={kk} : {w:.4f}   (w^n = {w**n:.4f})")

t = np.linspace(0, 2*np.pi, 400)
plt.figure(figsize=(5, 5))
plt.plot(r**(1/n)*np.cos(t), r**(1/n)*np.sin(t), "--", color="gray")
plt.scatter(racines.real, racines.imag, color="crimson", zorder=3)
for kk, w in zip(k, racines):
    plt.annotate(f"$w_{kk}$", (w.real, w.imag), textcoords="offset points", xytext=(6, 6))
plt.axhline(0, color="k", lw=.5); plt.axvline(0, color="k", lw=.5)
plt.gca().set_aspect("equal"); plt.grid(alpha=.3)
plt.title(f"Racines {n}-iemes de {z}")
plt.savefig("01_complexes_racines.png", dpi=120)
