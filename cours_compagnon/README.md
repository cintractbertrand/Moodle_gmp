# Cours compagnon GMP

Petits scripts Python pour **voir et manipuler** les notions du cours de mathématiques (BUT GMP) : complexes, polynômes, applications linéaires, transformée de Laplace.

Chaque chapitre a une fiche qui explique le script, ce qu'il affiche et comment le modifier.

## Contenu

| Chapitre | Fiche | Script |
|---|---|---|
| 01 Complexes | [chapitres/01_complexes.md](chapitres/01_complexes.md) | [scripts/01_complexes_racines.py](scripts/01_complexes_racines.py) |
| 02 Polynômes | [chapitres/02_polynomes.md](chapitres/02_polynomes.md) | [scripts/02_polynomes_division.py](scripts/02_polynomes_division.py) |
| Espaces vectoriels et applications linéaires | [chapitres/03_applications_lineaires.md](chapitres/03_applications_lineaires.md) | [scripts/03_applic_lineaire_plan.py](scripts/03_applic_lineaire_plan.py) |
| 19 Transformée de Laplace | [chapitres/19_laplace.md](chapitres/19_laplace.md) | [scripts/04_laplace_sympy.py](scripts/04_laplace_sympy.py) |

## Installation

1. Installer [Python 3](https://www.python.org/downloads/).
2. Dans un terminal : `pip install -r requirements.txt`
3. Lancer un script : `python scripts/01_complexes_racines.py`

Les figures `.png` sont créées dans le dossier où vous lancez la commande. Des exemples sont dans [figures/](figures/).

## Comment s'en servir

Ouvrez le script, changez les valeurs marquées « modifiable », relancez, comparez avec votre calcul à la main. Ces scripts **vérifient** vos résultats, ils ne remplacent pas la rédaction d'une solution.

## Licences

- Scripts : MIT (fichier [LICENSE](LICENSE)).
- Textes et figures : CC BY-NC-SA 4.0 (fichier [LICENSE_textes.md](LICENSE_textes.md)).

Auteur : Bertrand Cintract, IUT.
