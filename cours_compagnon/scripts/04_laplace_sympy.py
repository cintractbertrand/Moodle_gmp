"""Ch.19 Laplace : transformee, inverse, resolution d'une equation differentielle."""
import sympy as sp

t, p = sp.symbols("t p", positive=True)

# Transformee de quelques fonctions usuelles
for f in [sp.exp(-2*t), sp.sin(3*t), t**2, sp.exp(-t)*sp.cos(2*t)]:
    F = sp.laplace_transform(f, t, p, noconds=True)
    print(f"L({f})(p) = {sp.simplify(F)}")

# Resolution de y' + 2y = 1, y(0)=0 :  p Y - y(0) + 2Y = 1/p
Y = sp.symbols("Y")
sol = sp.solve(sp.Eq(p*Y - 0 + 2*Y, 1/p), Y)[0]
print("\nY(p) =", sol)
print("decomposition :", sp.apart(sol, p))
y = sp.inverse_laplace_transform(sp.apart(sol, p), p, t)
print("y(t) =", sp.simplify(y))

# Verification directe avec dsolve
yf = sp.Function("y")
print("dsolve :", sp.dsolve(yf(t).diff(t) + 2*yf(t) - 1, yf(t), ics={yf(0): 0}))
