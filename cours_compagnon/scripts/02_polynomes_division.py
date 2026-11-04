"""Ch.02 Polynomes : division euclidienne, racines et factorisation (sympy)."""
import sympy as sp

x = sp.symbols("x")
A = x**4 - 3*x**3 + 2*x**2 + x - 5
B = x**2 - x + 1

Q, R = sp.div(A, B, x)                 # division euclidienne A = B*Q + R
print("Quotient :", Q)
print("Reste    :", R)
print("Verification A = B*Q + R :", sp.expand(B*Q + R - A) == 0)

P = x**4 - 1
print("\nFactorisation sur Q  :", sp.factor(P))
print("Factorisation sur C  :", sp.factor(P, extension=sp.I))
print("Racines (avec multiplicite) :", sp.roots(P, x))
