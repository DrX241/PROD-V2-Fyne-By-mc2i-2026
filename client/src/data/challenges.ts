// Défis préconstruits pour "Read Me If You Can"
// Cette banque de données permet de réduire la dépendance à l'API

// Types
interface QuizResponse {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface CodeChallenge {
  id: string;
  code: string;
  language: 'python' | 'sql';
  question: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  responses: QuizResponse[];
  explanation: string;
  hint?: string;
}

// Défis Python - Niveau Débutant
export const pythonDebutant: CodeChallenge[] = [
  {
    id: "python-debutant-1",
    code: `def verifier_nombre_pair(n):
    if n % 2 == 0:
        return True
    else:
        return False

# Test de la fonction
print(verifier_nombre_pair(4))
print(verifier_nombre_pair(7))`,
    language: "python",
    question: "Quel est le résultat de cette fonction lorsqu'on lui passe le nombre 9 ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "True", isCorrect: false },
      { id: "b", text: "False", isCorrect: true },
      { id: "c", text: "None", isCorrect: false },
      { id: "d", text: "Une erreur sera générée", isCorrect: false }
    ],
    explanation: "La fonction vérifie si un nombre est pair en testant si le reste de la division par 2 est égal à 0. Pour le nombre 9, le reste de la division par 2 est 1, donc la fonction retourne False.",
    hint: "Rappelez-vous que l'opérateur % calcule le reste de la division. Un nombre pair a un reste de 0 quand il est divisé par 2."
  },
  {
    id: "python-debutant-2",
    code: `nombres = [1, 2, 3, 4, 5]
somme = 0

for nombre in nombres:
    if nombre % 2 == 0:
        somme += nombre

print(somme)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il calcule la somme de tous les nombres et affiche 15", isCorrect: false },
      { id: "b", text: "Il calcule la somme des nombres pairs et affiche 6", isCorrect: true },
      { id: "c", text: "Il calcule la somme des nombres impairs et affiche 9", isCorrect: false },
      { id: "d", text: "Il compte le nombre de nombres pairs et affiche 2", isCorrect: false }
    ],
    explanation: "Ce code parcourt la liste [1, 2, 3, 4, 5] et ajoute à la variable 'somme' uniquement les nombres pairs (ceux divisibles par 2). Dans cette liste, les nombres pairs sont 2 et 4, donc la somme affichée est 2 + 4 = 6.",
    hint: "Regardez bien la condition dans la boucle for. Quels nombres de la liste répondent à cette condition ?"
  },
  {
    id: "python-debutant-3",
    code: `def transformer_liste(liste):
    resultat = []
    for element in liste:
        resultat.append(element * 2)
    return resultat

nombres = [1, 2, 3, 4, 5]
print(transformer_liste(nombres))`,
    language: "python",
    question: "Quel est le résultat de l'exécution de ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "[1, 2, 3, 4, 5, 1, 2, 3, 4, 5]", isCorrect: false },
      { id: "b", text: "[2, 4, 6, 8, 10]", isCorrect: true },
      { id: "c", text: "[1, 4, 9, 16, 25]", isCorrect: false },
      { id: "d", text: "10", isCorrect: false }
    ],
    explanation: "La fonction 'transformer_liste' parcourt chaque élément de la liste passée en paramètre et ajoute à une nouvelle liste le double de chaque élément. Avec la liste [1, 2, 3, 4, 5], le résultat est [2, 4, 6, 8, 10].",
    hint: "La fonction multiplie chaque élément par 2 et stocke le résultat dans une nouvelle liste."
  },
  {
    id: "python-debutant-4",
    code: `def compter_voyelles(texte):
    voyelles = "aeiouy"
    compteur = 0
    
    for caractere in texte.lower():
        if caractere in voyelles:
            compteur += 1
            
    return compteur

phrase = "Bonjour le monde"
print(compter_voyelles(phrase))`,
    language: "python",
    question: "Combien de voyelles seront comptées dans la phrase 'Bonjour le monde' ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "4", isCorrect: false },
      { id: "b", text: "5", isCorrect: true },
      { id: "c", text: "6", isCorrect: false },
      { id: "d", text: "7", isCorrect: false }
    ],
    explanation: "La fonction compte le nombre de voyelles (a, e, i, o, u, y) dans le texte. Dans 'Bonjour le monde', on trouve: o, o, u, e, o, soit 5 voyelles au total.",
    hint: "Pensez à compter toutes les voyelles, y compris celles qui apparaissent plusieurs fois."
  },
  {
    id: "python-debutant-5",
    code: `def inverser_dictionnaire(dico):
    resultat = {}
    for cle, valeur in dico.items():
        resultat[valeur] = cle
    return resultat

notes = {"Alice": 85, "Bob": 92, "Charlie": 78}
print(inverser_dictionnaire(notes))`,
    language: "python",
    question: "Que fait cette fonction et quel sera le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle inverse l'ordre des paires clé-valeur: {'Charlie': 78, 'Bob': 92, 'Alice': 85}", isCorrect: false },
      { id: "b", text: "Elle échange les clés et les valeurs: {85: 'Alice', 92: 'Bob', 78: 'Charlie'}", isCorrect: true },
      { id: "c", text: "Elle crée un nouveau dictionnaire avec les mêmes clés: {'Alice': 'Alice', 'Bob': 'Bob', 'Charlie': 'Charlie'}", isCorrect: false },
      { id: "d", text: "Une erreur sera générée car les valeurs ne peuvent pas être des clés", isCorrect: false }
    ],
    explanation: "Cette fonction crée un nouveau dictionnaire où les valeurs du dictionnaire original deviennent les clés, et les clés deviennent les valeurs. Avec le dictionnaire notes, cela donne {85: 'Alice', 92: 'Bob', 78: 'Charlie'}.",
    hint: "Observez comment les paires clé-valeur sont traitées dans la boucle for."
  },
  {
    id: "python-debutant-6",
    code: `texte = "Python est un langage de programmation"
mots = texte.split()
print(len(mots))`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il compte le nombre de caractères dans le texte et affiche 40", isCorrect: false },
      { id: "b", text: "Il compte le nombre de mots dans le texte et affiche 6", isCorrect: true },
      { id: "c", text: "Il compte le nombre de lettres 'p' et affiche 3", isCorrect: false },
      { id: "d", text: "Il affiche la liste des mots: ['Python', 'est', 'un', 'langage', 'de', 'programmation']", isCorrect: false }
    ],
    explanation: "La méthode split() sans argument découpe une chaîne de caractères à chaque espace et retourne une liste des mots. Ensuite, len() calcule la longueur de cette liste, soit le nombre de mots. Dans ce cas, il y a 6 mots.",
    hint: "La méthode split() divise une chaîne en une liste de sous-chaînes."
  },
  {
    id: "python-debutant-7",
    code: `nombres = [10, 5, 8, 3, 12]
max_val = nombres[0]
for nombre in nombres:
    if nombre > max_val:
        max_val = nombre
print(max_val)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il trouve la somme des nombres et affiche 38", isCorrect: false },
      { id: "b", text: "Il trouve la valeur maximale et affiche 12", isCorrect: true },
      { id: "c", text: "Il affiche le premier nombre: 10", isCorrect: false },
      { id: "d", text: "Il compte le nombre d'éléments et affiche 5", isCorrect: false }
    ],
    explanation: "Ce code initialise max_val avec le premier élément de la liste (10), puis parcourt tous les éléments. Si un élément est plus grand que max_val, celui-ci est mis à jour. À la fin, max_val contient la plus grande valeur trouvée: 12.",
    hint: "Suivez l'évolution de la variable max_val à chaque itération de la boucle."
  },
  {
    id: "python-debutant-8",
    code: `def calcul_moyenne(nombres):
    if len(nombres) == 0:
        return 0
    return sum(nombres) / len(nombres)

resultats = [15, 18, 12, 14, 16]
print(calcul_moyenne(resultats))`,
    language: "python",
    question: "Quel est le résultat affiché par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "15", isCorrect: true },
      { id: "b", text: "16", isCorrect: false },
      { id: "c", text: "14", isCorrect: false },
      { id: "d", text: "75", isCorrect: false }
    ],
    explanation: "Cette fonction calcule la moyenne d'une liste de nombres en divisant leur somme par le nombre d'éléments. Pour la liste [15, 18, 12, 14, 16], la somme est 75 et il y a 5 éléments, donc la moyenne est 75/5 = 15.",
    hint: "La fonction sum() calcule la somme des éléments d'une liste."
  },
  {
    id: "python-debutant-9",
    code: `def est_palindrome(mot):
    return mot == mot[::-1]

print(est_palindrome("radar"))
print(est_palindrome("python"))`,
    language: "python",
    question: "Que fait cette fonction et quels seront les résultats affichés ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle vérifie si le mot contient des lettres répétées et affiche False, False", isCorrect: false },
      { id: "b", text: "Elle vérifie si le mot se lit de la même façon dans les deux sens et affiche True, False", isCorrect: true },
      { id: "c", text: "Elle compte le nombre de voyelles et affiche 2, 1", isCorrect: false },
      { id: "d", text: "Elle vérifie si la première lettre est identique à la dernière et affiche True, False", isCorrect: false }
    ],
    explanation: "La fonction vérifie si un mot est un palindrome, c'est-à-dire s'il se lit de la même façon de gauche à droite et de droite à gauche. La notation mot[::-1] retourne le mot inversé. 'radar' est un palindrome (True) alors que 'python' ne l'est pas (False).",
    hint: "L'expression mot[::-1] crée une copie inversée de la chaîne de caractères."
  },
  {
    id: "python-debutant-10",
    code: `nombres = list(range(1, 6))
carres = [n**2 for n in nombres]
print(carres)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il crée une liste de nombres de 1 à 5 et affiche [1, 2, 3, 4, 5]", isCorrect: false },
      { id: "b", text: "Il calcule le carré de chaque nombre de 1 à 5 et affiche [1, 4, 9, 16, 25]", isCorrect: true },
      { id: "c", text: "Il calcule la puissance de 2 pour chaque nombre et affiche [2, 4, 8, 16, 32]", isCorrect: false },
      { id: "d", text: "Il affiche une erreur car range() ne peut pas être utilisé avec list()", isCorrect: false }
    ],
    explanation: "Ce code utilise d'abord range(1, 6) pour créer une séquence de nombres de 1 à 5, puis la convertit en liste. Ensuite, il utilise une compréhension de liste pour calculer le carré de chaque nombre. Le résultat est [1, 4, 9, 16, 25].",
    hint: "L'opérateur ** en Python est utilisé pour l'exponentiation. n**2 signifie n au carré."
  },
  {
    id: "python-debutant-11",
    code: `def saluer(nom, heure=12):
    if heure < 12:
        return f"Bonjour {nom}, il est {heure}h du matin"
    elif heure < 18:
        return f"Bonjour {nom}, il est {heure}h de l'après-midi"
    else:
        return f"Bonsoir {nom}, il est {heure}h du soir"

print(saluer("Thomas", 9))
print(saluer("Julie"))`,
    language: "python",
    question: "Quels sont les deux résultats affichés par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "'Bonjour Thomas, il est 9h du matin' et 'Bonjour Julie, il est 12h du matin'", isCorrect: false },
      { id: "b", text: "'Bonjour Thomas, il est 9h du matin' et 'Bonjour Julie, il est 12h de l'après-midi'", isCorrect: true },
      { id: "c", text: "'Bonjour Thomas' et 'Bonjour Julie'", isCorrect: false },
      { id: "d", text: "'Bonsoir Thomas, il est 9h du soir' et 'Bonjour Julie, il est 12h de l'après-midi'", isCorrect: false }
    ],
    explanation: "La fonction saluer() prend un paramètre obligatoire 'nom' et un paramètre optionnel 'heure' qui a une valeur par défaut de 12. Pour le premier appel, avec Thomas et 9, le message est du matin. Pour le second appel, avec Julie et sans préciser l'heure, la valeur par défaut 12 est utilisée, ce qui donne un message de l'après-midi.",
    hint: "Les paramètres avec des valeurs par défaut permettent d'appeler une fonction sans spécifier tous les arguments."
  },
  {
    id: "python-debutant-12",
    code: `fruits = ["pomme", "banane", "orange", "fraise", "kiwi"]
print(fruits[1:4])`,
    language: "python",
    question: "Quel est le résultat affiché par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "['pomme', 'banane', 'orange', 'fraise']", isCorrect: false },
      { id: "b", text: "['banane', 'orange', 'fraise']", isCorrect: true },
      { id: "c", text: "['banane', 'orange', 'fraise', 'kiwi']", isCorrect: false },
      { id: "d", text: "['pomme', 'orange', 'kiwi']", isCorrect: false }
    ],
    explanation: "En Python, le découpage (slicing) avec [1:4] signifie 'prendre les éléments à partir de l'indice 1 (inclus) jusqu'à l'indice 4 (exclu)'. Les indices commencent à 0, donc l'indice 1 correspond à 'banane' et l'indice 3 (le dernier inclus) correspond à 'fraise'.",
    hint: "Dans une opération de découpage list[start:end], l'élément à l'indice start est inclus, mais l'élément à l'indice end est exclu."
  },
  {
    id: "python-debutant-13",
    code: `mot = "Python"
resultat = ""
for i in range(len(mot)):
    resultat += mot[len(mot) - 1 - i]
print(resultat)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il affiche le mot original: 'Python'", isCorrect: false },
      { id: "b", text: "Il inverse le mot et affiche: 'nohtyP'", isCorrect: true },
      { id: "c", text: "Il affiche les lettres en double: 'PPyytthhoonn'", isCorrect: false },
      { id: "d", text: "Il affiche uniquement les voyelles: 'yo'", isCorrect: false }
    ],
    explanation: "Ce code parcourt chaque position du mot, de 0 à la longueur-1. Pour chaque position i, il ajoute au résultat le caractère situé à la position (len(mot) - 1 - i), c'est-à-dire en partant de la fin. Cela inverse le mot 'Python' pour donner 'nohtyP'.",
    hint: "Suivez l'évolution de la variable i et calculez l'indice utilisé pour chaque itération."
  },
  {
    id: "python-debutant-14",
    code: `def diviser(a, b):
    try:
        resultat = a / b
        return resultat
    except ZeroDivisionError:
        return "Division par zéro impossible"

print(diviser(10, 2))
print(diviser(10, 0))`,
    language: "python",
    question: "Quels sont les résultats affichés par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "5.0 et None", isCorrect: false },
      { id: "b", text: "5.0 et 'Division par zéro impossible'", isCorrect: true },
      { id: "c", text: "5 et 0", isCorrect: false },
      { id: "d", text: "Une erreur est générée lors de la deuxième division", isCorrect: false }
    ],
    explanation: "Cette fonction tente de diviser a par b. Pour diviser(10, 2), elle renvoie 5.0 (résultat d'une division flottante). Pour diviser(10, 0), qui causerait normalement une ZeroDivisionError, le bloc except intercepte l'erreur et renvoie le message 'Division par zéro impossible'.",
    hint: "Le bloc try/except permet de gérer les erreurs qui pourraient survenir pendant l'exécution."
  },
  {
    id: "python-debutant-15",
    code: `liste = [3, 1, 4, 1, 5, 9, 2, 6, 5]
liste.sort()
print(liste)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il trie la liste dans l'ordre croissant et affiche [1, 1, 2, 3, 4, 5, 5, 6, 9]", isCorrect: true },
      { id: "b", text: "Il trie la liste dans l'ordre décroissant et affiche [9, 6, 5, 5, 4, 3, 2, 1, 1]", isCorrect: false },
      { id: "c", text: "Il supprime les doublons et affiche [3, 1, 4, 5, 9, 2, 6]", isCorrect: false },
      { id: "d", text: "Il affiche la liste originale sans changement: [3, 1, 4, 1, 5, 9, 2, 6, 5]", isCorrect: false }
    ],
    explanation: "La méthode sort() trie la liste en place, dans l'ordre croissant par défaut. Les éléments sont réorganisés du plus petit au plus grand, y compris les doublons. Le résultat est [1, 1, 2, 3, 4, 5, 5, 6, 9].",
    hint: "La méthode sort() modifie la liste originale, contrairement à la fonction sorted() qui retourne une nouvelle liste triée."
  },
  {
    id: "python-debutant-16",
    code: `def convertir_temperature(celsius):
    fahrenheit = celsius * 9/5 + 32
    return fahrenheit

temp_celsius = 25
temp_fahrenheit = convertir_temperature(temp_celsius)
print(f"{temp_celsius}°C équivaut à {temp_fahrenheit}°F")`,
    language: "python",
    question: "Quel est le résultat affiché par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "25°C équivaut à 57°F", isCorrect: false },
      { id: "b", text: "25°C équivaut à 77.0°F", isCorrect: true },
      { id: "c", text: "25°C équivaut à 77°F", isCorrect: false },
      { id: "d", text: "25°C équivaut à 45°F", isCorrect: false }
    ],
    explanation: "Cette fonction convertit une température de Celsius en Fahrenheit selon la formule F = C × 9/5 + 32. Pour 25°C, le calcul donne 25 × 9/5 + 32 = 45 + 32 = 77.0°F.",
    hint: "Faites attention à l'ordre des opérations dans la formule de conversion."
  },
  {
    id: "python-debutant-17",
    code: `phrase = "Le Python est un langage de programmation populaire"
mots = phrase.split()
resultat = "-".join(mots)
print(resultat)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il compte le nombre de mots et affiche 8", isCorrect: false },
      { id: "b", text: "Il joint les mots avec des tirets et affiche 'Le-Python-est-un-langage-de-programmation-populaire'", isCorrect: true },
      { id: "c", text: "Il retire les espaces et affiche 'LePythonestunlangagedeprogrammationpopulaire'", isCorrect: false },
      { id: "d", text: "Il ajoute des tirets entre chaque lettre et affiche 'L-e- -P-y-t-h-o-n- -e-s-t...'", isCorrect: false }
    ],
    explanation: "Le code divise d'abord la phrase en une liste de mots avec split(). Ensuite, join() est utilisé pour recombiner ces mots en une seule chaîne en plaçant un tiret entre chaque mot. Le résultat est une phrase où les espaces ont été remplacés par des tirets.",
    hint: "La méthode split() divise une chaîne en une liste, tandis que join() fait l'inverse en combinant une liste en une chaîne."
  },
  {
    id: "python-debutant-18",
    code: `notes = {"math": 15, "physique": 12, "histoire": 18, "anglais": 14}
matieres = list(notes.keys())
print(matieres)`,
    language: "python",
    question: "Quel est le résultat affiché par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "['math', 'physique', 'histoire', 'anglais']", isCorrect: true },
      { id: "b", text: "[15, 12, 18, 14]", isCorrect: false },
      { id: "c", text: "{'math': 15, 'physique': 12, 'histoire': 18, 'anglais': 14}", isCorrect: false },
      { id: "d", text: "[('math', 15), ('physique', 12), ('histoire', 18), ('anglais', 14)]", isCorrect: false }
    ],
    explanation: "La méthode keys() d'un dictionnaire retourne un objet itérable contenant toutes les clés du dictionnaire. En convertissant cet objet en liste avec list(), on obtient une liste des clés, soit ['math', 'physique', 'histoire', 'anglais'].",
    hint: "Pour récupérer les valeurs d'un dictionnaire, on utiliserait values() au lieu de keys()."
  },
  {
    id: "python-debutant-19",
    code: `nombre = 12345
somme = 0
while nombre > 0:
    somme += nombre % 10
    nombre = nombre // 10
print(somme)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il calcule la somme des chiffres de 12345 et affiche 15", isCorrect: true },
      { id: "b", text: "Il calcule le produit des chiffres de 12345 et affiche 120", isCorrect: false },
      { id: "c", text: "Il inverse le nombre et affiche 54321", isCorrect: false },
      { id: "d", text: "Il compte le nombre de chiffres et affiche 5", isCorrect: false }
    ],
    explanation: "Ce code calcule la somme des chiffres d'un nombre entier. À chaque itération, il ajoute le dernier chiffre (nombre % 10) à la somme, puis supprime ce dernier chiffre en divisant le nombre par 10 (division entière). Pour 12345, la somme des chiffres est 1+2+3+4+5 = 15.",
    hint: "L'opération nombre % 10 donne le dernier chiffre du nombre, tandis que nombre // 10 supprime ce dernier chiffre."
  },
  {
    id: "python-debutant-20",
    code: `def filtrer_positifs(liste):
    return [x for x in liste if x > 0]

nombres = [-3, 4, 0, -1, 7, -5, 2]
print(filtrer_positifs(nombres))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle supprime les nombres négatifs et affiche [4, 0, 7, 2]", isCorrect: false },
      { id: "b", text: "Elle garde uniquement les nombres positifs et affiche [4, 7, 2]", isCorrect: true },
      { id: "c", text: "Elle compte les nombres positifs et affiche 3", isCorrect: false },
      { id: "d", text: "Elle remplace les nombres négatifs par 0 et affiche [0, 4, 0, 0, 7, 0, 2]", isCorrect: false }
    ],
    explanation: "Cette fonction utilise une compréhension de liste pour créer une nouvelle liste contenant uniquement les éléments positifs (strictement supérieurs à 0) de la liste d'origine. Les nombres 4, 7 et 2 sont les seuls nombres positifs de la liste originale.",
    hint: "La condition x > 0 dans la compréhension de liste filtre tous les éléments négatifs et nuls."
  },
  {
    id: "python-debutant-21",
    code: `def compte_occurences(texte, lettre):
    return texte.lower().count(lettre.lower())

phrase = "Python est un langage de Programmation"
print(compte_occurences(phrase, "p"))`,
    language: "python",
    question: "Quel est le résultat affiché par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "1", isCorrect: false },
      { id: "b", text: "2", isCorrect: true },
      { id: "c", text: "3", isCorrect: false },
      { id: "d", text: "0", isCorrect: false }
    ],
    explanation: "Cette fonction compte le nombre d'occurrences d'une lettre dans un texte, en ignorant la casse (majuscules/minuscules). Dans la phrase 'Python est un langage de Programmation', la lettre 'p' apparaît deux fois: au début de 'Python' et de 'Programmation'.",
    hint: "La méthode lower() convertit toutes les lettres en minuscules avant de compter, ce qui rend la recherche insensible à la casse."
  },
  {
    id: "python-debutant-22",
    code: `def afficher_table(n, max=10):
    for i in range(1, max + 1):
        print(f"{n} x {i} = {n * i}")

afficher_table(7, 5)`,
    language: "python",
    question: "Que fait cette fonction et combien de lignes seront affichées ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle affiche la table de multiplication de 7, de 7×1 à 7×10, soit 10 lignes", isCorrect: false },
      { id: "b", text: "Elle affiche la table de multiplication de 7, de 7×1 à 7×5, soit 5 lignes", isCorrect: true },
      { id: "c", text: "Elle affiche les multiples de 7 jusqu'à 5×7, soit 1 ligne avec [7, 14, 21, 28, 35]", isCorrect: false },
      { id: "d", text: "Elle affiche la somme de 7 et des nombres de 1 à 5, soit 1 ligne avec 35", isCorrect: false }
    ],
    explanation: "Cette fonction affiche la table de multiplication d'un nombre n jusqu'à n×max. Avec n=7 et max=5, elle affiche les cinq premières lignes de la table de 7: 7×1=7, 7×2=14, 7×3=21, 7×4=28, 7×5=35.",
    hint: "Le paramètre max=10 est une valeur par défaut, mais elle est remplacée par 5 dans l'appel de fonction."
  },
  {
    id: "python-debutant-23",
    code: `nombres = [1, 2, 3, 4, 5]
resultat = nombres.pop(2)
print(nombres)
print(resultat)`,
    language: "python",
    question: "Quels sont les résultats affichés par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "[1, 2, 4, 5] et 3", isCorrect: true },
      { id: "b", text: "[1, 2, 3, 4] et 5", isCorrect: false },
      { id: "c", text: "[1, 3, 4, 5] et 2", isCorrect: false },
      { id: "d", text: "[1, 2, 4, 5] et None", isCorrect: false }
    ],
    explanation: "La méthode pop(index) retire l'élément à l'indice spécifié de la liste et le retourne. Avec pop(2), l'élément à l'indice 2 (le troisième élément, soit 3) est retiré de la liste. La liste devient [1, 2, 4, 5] et la valeur retournée est 3.",
    hint: "Souvenez-vous que les indices en Python commencent à 0, donc l'indice 2 correspond au troisième élément."
  },
  {
    id: "python-debutant-24",
    code: `animaux = ["chat", "chien", "lapin", "hamster"]
for i, animal in enumerate(animaux, start=1):
    print(f"{i}. {animal}")`,
    language: "python",
    question: "Que fait ce code et comment sera formatée la sortie ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il affiche la liste indexée à partir de 0: '0. chat', '1. chien', etc.", isCorrect: false },
      { id: "b", text: "Il affiche la liste numérotée: '1. chat', '2. chien', '3. lapin', '4. hamster'", isCorrect: true },
      { id: "c", text: "Il affiche uniquement les noms des animaux: 'chat', 'chien', 'lapin', 'hamster'", isCorrect: false },
      { id: "d", text: "Il compte le nombre de lettres dans chaque nom d'animal", isCorrect: false }
    ],
    explanation: "La fonction enumerate() retourne des paires (indice, valeur) pour chaque élément de l'itérable. Le paramètre start=1 fait commencer la numérotation à 1 au lieu de 0. Chaque ligne affichée est formatée avec le numéro suivi du nom de l'animal.",
    hint: "Le paramètre start permet de spécifier la valeur de départ pour l'indexation dans enumerate()."
  },
  {
    id: "python-debutant-25",
    code: `def dernier_element(sequence, defaut=None):
    if not sequence:
        return defaut
    return sequence[-1]

print(dernier_element([1, 2, 3, 4]))
print(dernier_element(""))
print(dernier_element([], "vide"))`,
    language: "python",
    question: "Quels sont les trois résultats affichés par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "4, None, 'vide'", isCorrect: true },
      { id: "b", text: "4, '', []", isCorrect: false },
      { id: "c", text: "[4], None, 'vide'", isCorrect: false },
      { id: "d", text: "4, '', 'vide'", isCorrect: false }
    ],
    explanation: "Cette fonction retourne le dernier élément d'une séquence (liste, chaîne, etc.). Si la séquence est vide, elle retourne la valeur par défaut. Pour [1, 2, 3, 4], le dernier élément est 4. Pour une chaîne vide '', la séquence est vide, donc la fonction retourne None (la valeur par défaut). Pour [] avec le défaut 'vide', elle retourne 'vide'.",
    hint: "L'indice -1 en Python accède au dernier élément d'une séquence."
  },
  {
    id: "python-debutant-26",
    code: `noms = ["Alice", "Bob", "Charlie", "David"]
ages = [25, 30, 22, 35]

for nom, age in zip(noms, ages):
    print(f"{nom} a {age} ans")`,
    language: "python",
    question: "Que fait ce code et comment fonctionne-t-il ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il associe chaque nom à son âge et affiche 4 lignes, une pour chaque personne", isCorrect: true },
      { id: "b", text: "Il crée un dictionnaire où les noms sont les clés et les âges les valeurs", isCorrect: false },
      { id: "c", text: "Il vérifie si les deux listes ont la même longueur et affiche True", isCorrect: false },
      { id: "d", text: "Il calcule l'âge moyen et l'associe à chaque nom", isCorrect: false }
    ],
    explanation: "La fonction zip() combine des éléments de plusieurs itérables en un itérable de tuples. Ici, elle associe chaque nom à l'âge correspondant à la même position. La boucle for parcourt ces paires et affiche une ligne pour chaque personne, formatée avec son nom et son âge.",
    hint: "zip() s'arrête lorsque le plus court des itérables est épuisé."
  },
  {
    id: "python-debutant-27",
    code: `def valeur_absolue(nombre):
    if nombre < 0:
        return -nombre
    return nombre

print(valeur_absolue(-5))
print(valeur_absolue(3))`,
    language: "python",
    question: "Que fait cette fonction et quels sont les résultats affichés ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle inverse le signe du nombre et affiche 5, -3", isCorrect: false },
      { id: "b", text: "Elle calcule la valeur absolue et affiche 5, 3", isCorrect: true },
      { id: "c", text: "Elle multiplie le nombre par -1 et affiche 5, -3", isCorrect: false },
      { id: "d", text: "Elle affiche True, False (si le nombre est négatif ou non)", isCorrect: false }
    ],
    explanation: "Cette fonction calcule la valeur absolue d'un nombre. Si le nombre est négatif, elle retourne son opposé (-nombre, qui est positif). Si le nombre est positif ou nul, elle le retourne tel quel. Pour -5, elle retourne 5; pour 3, elle retourne 3.",
    hint: "La valeur absolue d'un nombre est sa distance par rapport à zéro, sans tenir compte de son signe."
  },
  {
    id: "python-debutant-28",
    code: `nombres = [1, 2, 3, 4, 5]
doubles = map(lambda x: x * 2, nombres)
print(list(doubles))`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il double chaque nombre et affiche [2, 4, 6, 8, 10]", isCorrect: true },
      { id: "b", text: "Il filtre les nombres pairs et affiche [2, 4]", isCorrect: false },
      { id: "c", text: "Il crée une fonction double et l'applique à la liste entière", isCorrect: false },
      { id: "d", text: "Il affiche l'objet map sans le convertir: <map object at 0x...>", isCorrect: false }
    ],
    explanation: "La fonction map() applique une fonction (ici, une fonction lambda qui multiplie par 2) à chaque élément d'un itérable et retourne un nouvel itérable. La conversion en liste avec list() permet d'obtenir tous les résultats sous forme de liste: [2, 4, 6, 8, 10].",
    hint: "La fonction lambda x: x * 2 est une fonction anonyme qui prend un argument x et retourne x multiplié par 2."
  },
  {
    id: "python-debutant-29",
    code: `texte = "Python"
for i in range(len(texte)):
    print(texte[:i+1])`,
    language: "python",
    question: "Que fait ce code et que va-t-il afficher ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Les lettres individuelles: 'P', 'y', 't', etc.", isCorrect: false },
      { id: "b", text: "Des sous-chaînes croissantes: 'P', 'Py', 'Pyt', 'Pyth', 'Pytho', 'Python'", isCorrect: true },
      { id: "c", text: "Des sous-chaînes décroissantes: 'Python', 'Pytho', 'Pyth', etc.", isCorrect: false },
      { id: "d", text: "Des permutations des lettres de 'Python'", isCorrect: false }
    ],
    explanation: "Ce code utilise une boucle pour afficher des sous-chaînes de plus en plus longues du mot 'Python'. À chaque itération i, il affiche la sous-chaîne du début jusqu'à l'indice i inclus ([:i+1]). Cela crée un effet d'animation textuelle où le mot se construit progressivement.",
    hint: "Le découpage de chaîne texte[:i+1] donne tous les caractères du début jusqu'à la position i (incluse)."
  },
  {
    id: "python-debutant-30",
    code: `def est_premier(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

print(est_premier(7))
print(est_premier(12))`,
    language: "python",
    question: "Que fait cette fonction et quels sont les résultats affichés ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle vérifie si un nombre est premier et affiche True, False", isCorrect: true },
      { id: "b", text: "Elle vérifie si un nombre est pair et affiche False, True", isCorrect: false },
      { id: "c", text: "Elle calcule les facteurs premiers et affiche [7], [2, 2, 3]", isCorrect: false },
      { id: "d", text: "Elle vérifie si un nombre est divisible par 7 et affiche True, False", isCorrect: false }
    ],
    explanation: "Cette fonction détermine si un nombre est premier (divisible uniquement par 1 et lui-même). Elle utilise plusieurs optimisations: vérification rapide pour les petits nombres, élimination des multiples de 2 et 3, puis vérification des diviseurs potentiels de forme 6k±1 jusqu'à la racine carrée du nombre. 7 est premier (True), 12 ne l'est pas (False).",
    hint: "Un nombre premier n'a que deux diviseurs: 1 et lui-même."
  },
  {
    id: "python-debutant-31",
    code: `dictionnaire = {"a": 1, "b": 2, "c": 3}
cle = "b"
if cle in dictionnaire:
    print(f"La clé {cle} existe avec la valeur {dictionnaire[cle]}")
else:
    print(f"La clé {cle} n'existe pas")`,
    language: "python",
    question: "Quel est le résultat affiché par ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "La clé b existe avec la valeur 2", isCorrect: true },
      { id: "b", text: "La clé b n'existe pas", isCorrect: false },
      { id: "c", text: "La valeur b existe avec la clé 2", isCorrect: false },
      { id: "d", text: "KeyError: 'b'", isCorrect: false }
    ],
    explanation: "Ce code vérifie si une clé ('b') existe dans un dictionnaire. La condition 'if cle in dictionnaire' permet de tester la présence de la clé de façon sécurisée. Puisque la clé 'b' existe et a pour valeur 2, le message 'La clé b existe avec la valeur 2' est affiché.",
    hint: "L'opérateur 'in' permet de vérifier si une clé existe dans un dictionnaire sans risquer d'erreur."
  },
  {
    id: "python-debutant-32",
    code: `def filtrer_mots(texte, longueur_min):
    mots = texte.split()
    return [mot for mot in mots if len(mot) >= longueur_min]

phrase = "Le Python est un langage de programmation puissant et facile à apprendre"
print(filtrer_mots(phrase, 6))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle compte les mots de plus de 6 lettres et affiche 3", isCorrect: false },
      { id: "b", text: "Elle filtre les mots d'au moins 6 lettres et affiche ['Python', 'langage', 'programmation', 'puissant', 'apprendre']", isCorrect: true },
      { id: "c", text: "Elle affiche les 6 premiers mots: ['Le', 'Python', 'est', 'un', 'langage', 'de']", isCorrect: false },
      { id: "d", text: "Elle affiche les mots avec exactement 6 lettres: ['Python']", isCorrect: false }
    ],
    explanation: "Cette fonction divise le texte en mots et ne conserve que ceux dont la longueur est supérieure ou égale à longueur_min (ici, 6). Dans la phrase donnée, les mots ayant au moins 6 lettres sont 'Python', 'langage', 'programmation', 'puissant' et 'apprendre'.",
    hint: "L'opérateur >= compare la longueur de chaque mot avec la longueur minimale requise."
  },
  {
    id: "python-debutant-33",
    code: `nombres = [10, 20, 30, 40, 50]
total = 0
i = 0

while i < len(nombres):
    total += nombres[i]
    i += 2

print(total)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il calcule la somme de tous les nombres et affiche 150", isCorrect: false },
      { id: "b", text: "Il calcule la somme des nombres d'indice pair et affiche 90", isCorrect: true },
      { id: "c", text: "Il calcule la somme des nombres pairs et affiche 110", isCorrect: false },
      { id: "d", text: "Il affiche le nombre d'éléments dans la liste: 5", isCorrect: false }
    ],
    explanation: "Ce code utilise une boucle while pour parcourir la liste en incrémentant l'indice i de 2 à chaque itération. Cela signifie qu'il accède aux éléments d'indice 0, 2, 4, etc. Dans cette liste, ce sont les éléments 10, 30 et 50. La somme de ces nombres est 10 + 30 + 50 = 90.",
    hint: "L'incrémentation i += 2 fait sauter un élément à chaque itération."
  },
  {
    id: "python-debutant-34",
    code: `def combiner_listes(liste1, liste2):
    if len(liste1) != len(liste2):
        return "Les listes doivent avoir la même longueur"
    
    resultat = []
    for i in range(len(liste1)):
        resultat.append((liste1[i], liste2[i]))
    
    return resultat

nombres = [1, 2, 3]
lettres = ["a", "b", "c"]
print(combiner_listes(nombres, lettres))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle fusionne les deux listes et affiche [1, 2, 3, 'a', 'b', 'c']", isCorrect: false },
      { id: "b", text: "Elle crée des paires d'éléments et affiche [(1, 'a'), (2, 'b'), (3, 'c')]", isCorrect: true },
      { id: "c", text: "Elle vérifie si les deux listes sont identiques et affiche False", isCorrect: false },
      { id: "d", text: "Elle crée un dictionnaire et affiche {1: 'a', 2: 'b', 3: 'c'}", isCorrect: false }
    ],
    explanation: "Cette fonction prend deux listes de même longueur et crée une nouvelle liste contenant des tuples, où chaque tuple combine les éléments aux mêmes indices dans les deux listes. Pour les listes [1, 2, 3] et ['a', 'b', 'c'], le résultat est [(1, 'a'), (2, 'b'), (3, 'c')].",
    hint: "Cette fonction fait manuellement ce que la fonction zip() fait de manière intégrée en Python."
  },
  {
    id: "python-debutant-35",
    code: `def tronquer_texte(texte, longueur_max):
    if len(texte) <= longueur_max:
        return texte
    return texte[:longueur_max] + "..."

message = "Python est un langage de programmation facile à apprendre"
print(tronquer_texte(message, 20))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle compte le nombre de caractères et affiche 58", isCorrect: false },
      { id: "b", text: "Elle tronque le texte à 20 caractères et affiche 'Python est un langag...'", isCorrect: true },
      { id: "c", text: "Elle affiche les 20 premiers mots du texte", isCorrect: false },
      { id: "d", text: "Elle divise le texte en segments de 20 caractères", isCorrect: false }
    ],
    explanation: "Cette fonction limite un texte à une longueur maximale. Si le texte est plus long que longueur_max, elle le tronque à cette longueur et ajoute '...' à la fin. Pour le message donné, avec une longueur maximale de 20, le résultat est 'Python est un langag...'.",
    hint: "Le découpage de chaîne texte[:longueur_max] retourne les longueur_max premiers caractères."
  },
  {
    id: "python-debutant-36",
    code: `nombres = list(range(1, 101))
resultat = sum(n for n in nombres if n % 3 == 0 and n % 5 == 0)
print(resultat)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il calcule la somme des nombres de 1 à 100 et affiche 5050", isCorrect: false },
      { id: "b", text: "Il calcule la somme des nombres divisibles par 3 et par 5 et affiche 315", isCorrect: true },
      { id: "c", text: "Il compte les nombres divisibles par 3 et par 5 et affiche 6", isCorrect: false },
      { id: "d", text: "Il affiche une liste des nombres divisibles par 3 et par 5", isCorrect: false }
    ],
    explanation: "Ce code crée d'abord une liste des nombres de 1 à 100. Ensuite, il utilise une expression génératrice pour calculer la somme des nombres qui sont à la fois divisibles par 3 et par 5 (c'est-à-dire divisibles par 15). Ces nombres sont 15, 30, 45, 60, 75, 90, et leur somme est 315.",
    hint: "Un nombre divisible à la fois par 3 et par 5 est divisible par leur plus petit commun multiple, qui est 15."
  },
  {
    id: "python-debutant-37",
    code: `mots = ["python", "programmation", "code", "développeur", "logiciel"]
mots.sort(key=len)
print(mots)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il trie les mots par ordre alphabétique", isCorrect: false },
      { id: "b", text: "Il trie les mots par longueur croissante: ['code', 'python', 'logiciel', 'développeur', 'programmation']", isCorrect: true },
      { id: "c", text: "Il compte le nombre de lettres dans chaque mot", isCorrect: false },
      { id: "d", text: "Il trie les mots par longueur décroissante", isCorrect: false }
    ],
    explanation: "Ce code trie la liste de mots selon leur longueur (nombre de caractères), grâce au paramètre key=len qui indique d'utiliser la fonction len() comme critère de tri. Le résultat est une liste où les mots sont ordonnés du plus court au plus long.",
    hint: "Le paramètre key de la méthode sort() définit la fonction à appliquer sur chaque élément pour déterminer l'ordre de tri."
  },
  {
    id: "python-debutant-38",
    code: `def est_anagramme(mot1, mot2):
    # Ignorer les espaces et la casse
    mot1 = mot1.lower().replace(" ", "")
    mot2 = mot2.lower().replace(" ", "")
    
    # Vérifier si les mots ont les mêmes lettres
    return sorted(mot1) == sorted(mot2)

print(est_anagramme("listen", "silent"))
print(est_anagramme("triangle", "integral"))`,
    language: "python",
    question: "Que fait cette fonction et quels sont les résultats affichés ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle vérifie si deux mots ont la même longueur et affiche True, True", isCorrect: false },
      { id: "b", text: "Elle vérifie si deux mots sont des anagrammes et affiche True, True", isCorrect: true },
      { id: "c", text: "Elle vérifie si deux mots commencent par la même lettre et affiche False, False", isCorrect: false },
      { id: "d", text: "Elle vérifie si deux mots sont identiques et affiche False, False", isCorrect: false }
    ],
    explanation: "Cette fonction détermine si deux mots sont des anagrammes, c'est-à-dire s'ils contiennent exactement les mêmes lettres dans un ordre différent. Elle convertit d'abord les mots en minuscules et retire les espaces, puis compare les versions triées des deux mots. 'listen' et 'silent' sont des anagrammes, tout comme 'triangle' et 'integral'.",
    hint: "Trier les lettres d'un mot permet de comparer facilement si deux mots contiennent exactement les mêmes lettres, indépendamment de leur ordre."
  },
  {
    id: "python-debutant-39",
    code: `texte = "bonjour le monde"
resultat = texte.title()
print(resultat)`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il met tout le texte en majuscules: 'BONJOUR LE MONDE'", isCorrect: false },
      { id: "b", text: "Il met la première lettre de chaque mot en majuscule: 'Bonjour Le Monde'", isCorrect: true },
      { id: "c", text: "Il met uniquement la première lettre du texte en majuscule: 'Bonjour le monde'", isCorrect: false },
      { id: "d", text: "Il compte le nombre de mots dans le texte et affiche 3", isCorrect: false }
    ],
    explanation: "La méthode title() met la première lettre de chaque mot en majuscule. Elle convertit 'bonjour le monde' en 'Bonjour Le Monde', où chaque mot commence par une majuscule.",
    hint: "Cette méthode est souvent utilisée pour formater des titres ou des noms propres."
  },
  {
    id: "python-debutant-40",
    code: `def multiplier_liste(liste, facteur):
    for i in range(len(liste)):
        liste[i] *= facteur
    return liste

nombres = [1, 2, 3, 4]
resultat = multiplier_liste(nombres, 3)
print(nombres)
print(resultat)`,
    language: "python",
    question: "Que fait cette fonction et quels sont les résultats affichés ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "[1, 2, 3, 4] et [3, 6, 9, 12]", isCorrect: false },
      { id: "b", text: "[3, 6, 9, 12] et [3, 6, 9, 12]", isCorrect: true },
      { id: "c", text: "[1, 2, 3, 4] et None", isCorrect: false },
      { id: "d", text: "[3, 6, 9, 12] et None", isCorrect: false }
    ],
    explanation: "Cette fonction multiplie chaque élément d'une liste par un facteur, en modifiant la liste originale. Elle retourne également cette liste modifiée. Puisque les listes sont modifiées par référence en Python, nombres et resultat pointent vers la même liste après l'appel. Les deux variables affichent donc [3, 6, 9, 12].",
    hint: "En Python, les listes sont des objets mutables, ce qui signifie qu'une fonction peut modifier directement une liste passée en paramètre."
  },
  {
    id: "python-debutant-41",
    code: `def format_telephone(numero):
    if len(numero) != 10 or not numero.isdigit():
        return "Numéro invalide"
    
    return f"{numero[:2]}.{numero[2:4]}.{numero[4:6]}.{numero[6:8]}.{numero[8:]}"

print(format_telephone("0123456789"))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle vérifie si le numéro est valide et affiche True", isCorrect: false },
      { id: "b", text: "Elle formate un numéro de téléphone et affiche '01.23.45.67.89'", isCorrect: true },
      { id: "c", text: "Elle compte le nombre de chiffres et affiche 10", isCorrect: false },
      { id: "d", text: "Elle supprime les points d'un numéro déjà formaté", isCorrect: false }
    ],
    explanation: "Cette fonction formate un numéro de téléphone en insérant des points tous les deux chiffres. Elle vérifie d'abord que le numéro contient exactement 10 chiffres. Pour l'entrée '0123456789', elle retourne '01.23.45.67.89'.",
    hint: "La méthode isdigit() vérifie si une chaîne ne contient que des chiffres."
  },
  {
    id: "python-debutant-42",
    code: `notes = [15, 12, 18, 10, 8, 16, 14, 13]
seuil = 12

reussite = 0
for note in notes:
    if note >= seuil:
        reussite += 1

pourcentage = (reussite / len(notes)) * 100
print(f"{pourcentage}% des notes sont supérieures ou égales à {seuil}")`,
    language: "python",
    question: "Que fait ce code et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il calcule la moyenne des notes et affiche un message", isCorrect: false },
      { id: "b", text: "Il calcule le pourcentage de notes supérieures ou égales à 12 et affiche '75.0% des notes sont supérieures ou égales à 12'", isCorrect: true },
      { id: "c", text: "Il compte les notes et affiche '8 notes au total'", isCorrect: false },
      { id: "d", text: "Il trouve la note maximale et affiche '18 est la note maximale'", isCorrect: false }
    ],
    explanation: "Ce code compte le nombre de notes supérieures ou égales au seuil (12), puis calcule le pourcentage que cela représente par rapport au nombre total de notes. Sur les 8 notes, 6 sont supérieures ou égales à 12 (15, 12, 18, 16, 14, 13), ce qui représente 75% des notes.",
    hint: "Divisez le nombre de notes réussies par le nombre total de notes, puis multipliez par 100 pour obtenir un pourcentage."
  },
  {
    id: "python-debutant-43",
    code: `def generer_acronyme(phrase):
    mots = phrase.split()
    acronyme = ""
    
    for mot in mots:
        if mot[0].isupper():  # On ne prend que les mots commençant par une majuscule
            acronyme += mot[0]
    
    return acronyme

print(generer_acronyme("Organisation des Nations Unies"))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle génère un acronyme à partir des premières lettres des mots commençant par une majuscule et affiche 'ONU'", isCorrect: true },
      { id: "b", text: "Elle compte le nombre de mots commençant par une majuscule et affiche 3", isCorrect: false },
      { id: "c", text: "Elle génère un acronyme à partir de toutes les premières lettres et affiche 'OdNU'", isCorrect: false },
      { id: "d", text: "Elle met en majuscule la première lettre de chaque mot et affiche 'Organisation Des Nations Unies'", isCorrect: false }
    ],
    explanation: "Cette fonction crée un acronyme en prenant la première lettre de chaque mot qui commence par une majuscule. Pour 'Organisation des Nations Unies', les mots commençant par une majuscule sont 'Organisation', 'Nations' et 'Unies', donc l'acronyme est 'ONU'.",
    hint: "La méthode isupper() vérifie si un caractère est en majuscule."
  },
  {
    id: "python-debutant-44",
    code: `def est_bissextile(annee):
    if (annee % 4 == 0 and annee % 100 != 0) or (annee % 400 == 0):
        return True
    return False

annees = [1900, 2000, 2020, 2023]
for annee in annees:
    if est_bissextile(annee):
        print(f"{annee} est une année bissextile")
    else:
        print(f"{annee} n'est pas une année bissextile")`,
    language: "python",
    question: "Que fait ce code et combien d'années seront identifiées comme bissextiles ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il vérifie si une année est divisible par 4 et identifie 3 années bissextiles", isCorrect: false },
      { id: "b", text: "Il applique les règles du calendrier grégorien et identifie 2 années bissextiles", isCorrect: true },
      { id: "c", text: "Il vérifie si une année est divisible par 400 et identifie 1 année bissextile", isCorrect: false },
      { id: "d", text: "Il identifie les années divisibles par 100 et n'identifie aucune année bissextile", isCorrect: false }
    ],
    explanation: "Cette fonction détermine si une année est bissextile selon les règles du calendrier grégorien: une année est bissextile si elle est divisible par 4 mais pas par 100, ou si elle est divisible par 400. Parmi les années testées, 2000 est bissextile (divisible par 400), 2020 est bissextile (divisible par 4 mais pas par 100), tandis que 1900 (divisible par 100 mais pas par 400) et 2023 (non divisible par 4) ne le sont pas.",
    hint: "Dans le calendrier grégorien, les années divisibles par 100 ne sont pas bissextiles, sauf si elles sont également divisibles par 400."
  },
  {
    id: "python-debutant-45",
    code: `def premier_dernier(sequence):
    if not sequence:
        return []
    return [sequence[0], sequence[-1]]

print(premier_dernier([5, 10, 15, 20, 25]))
print(premier_dernier("Python"))`,
    language: "python",
    question: "Que fait cette fonction et quels sont les résultats affichés ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle retourne le premier et le dernier élément et affiche [5, 25] et ['P', 'n']", isCorrect: true },
      { id: "b", text: "Elle vérifie si le premier élément est égal au dernier et affiche False, False", isCorrect: false },
      { id: "c", text: "Elle supprime tous les éléments sauf le premier et le dernier et affiche [5, 25] et 'Pn'", isCorrect: false },
      { id: "d", text: "Elle compte le nombre d'éléments et affiche 5 et 6", isCorrect: false }
    ],
    explanation: "Cette fonction retourne une liste contenant le premier et le dernier élément d'une séquence (liste, chaîne, etc.). Pour la liste [5, 10, 15, 20, 25], elle retourne [5, 25]. Pour la chaîne 'Python', elle retourne ['P', 'n'].",
    hint: "L'indice 0 accède au premier élément d'une séquence, tandis que l'indice -1 accède au dernier."
  },
  {
    id: "python-debutant-46",
    code: `def compter_occurrences(liste):
    compteur = {}
    for element in liste:
        if element in compteur:
            compteur[element] += 1
        else:
            compteur[element] = 1
    return compteur

fruits = ["pomme", "banane", "orange", "pomme", "kiwi", "banane", "pomme"]
print(compter_occurrences(fruits))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle trie la liste et affiche les éléments uniques", isCorrect: false },
      { id: "b", text: "Elle compte les occurrences de chaque élément et affiche {'pomme': 3, 'banane': 2, 'orange': 1, 'kiwi': 1}", isCorrect: true },
      { id: "c", text: "Elle compte le nombre d'éléments uniques et affiche 4", isCorrect: false },
      { id: "d", text: "Elle compte le nombre total d'éléments et affiche 7", isCorrect: false }
    ],
    explanation: "Cette fonction crée un dictionnaire qui compte combien de fois chaque élément apparaît dans la liste. Pour chaque élément, si celui-ci est déjà dans le dictionnaire, son compteur est incrémenté; sinon, il est ajouté avec un compteur initial de 1. Pour la liste donnée, 'pomme' apparaît 3 fois, 'banane' 2 fois, et 'orange' et 'kiwi' une fois chacun.",
    hint: "En Python, un dictionnaire est parfait pour associer des éléments à des compteurs ou des valeurs."
  },
  {
    id: "python-debutant-47",
    code: `chaine = "Python"
for i, lettre in enumerate(chaine):
    print(f"La lettre à l'indice {i} est {lettre}")`,
    language: "python",
    question: "Que fait ce code et combien de lignes seront affichées ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il affiche l'indice et la lettre pour chaque caractère, soit 6 lignes", isCorrect: true },
      { id: "b", text: "Il compte le nombre de voyelles et affiche 1 ligne", isCorrect: false },
      { id: "c", text: "Il recherche la lettre 'y' et affiche son indice, soit 1 ligne", isCorrect: false },
      { id: "d", text: "Il affiche les lettres en ordre inverse, soit 6 lignes", isCorrect: false }
    ],
    explanation: "Ce code utilise la fonction enumerate() pour parcourir simultanément les indices et les valeurs de la chaîne 'Python'. Pour chaque caractère, il affiche une ligne indiquant son indice et sa valeur. Comme 'Python' contient 6 lettres, 6 lignes seront affichées, de 'La lettre à l'indice 0 est P' jusqu'à 'La lettre à l'indice 5 est n'.",
    hint: "La fonction enumerate() retourne des paires (indice, valeur) pour chaque élément d'un itérable."
  },
  {
    id: "python-debutant-48",
    code: `import random

random.seed(42)  # Fixer la graine pour la reproductibilité
nombres = random.sample(range(1, 51), 6)
print(nombres)`,
    language: "python",
    question: "Que fait ce code et quel type de résultat va-t-il afficher ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Il génère toujours les mêmes 6 nombres aléatoires entre 1 et 50", isCorrect: true },
      { id: "b", text: "Il génère 6 nombres différents à chaque exécution", isCorrect: false },
      { id: "c", text: "Il affiche les 6 premiers nombres pairs", isCorrect: false },
      { id: "d", text: "Il affiche tous les nombres de 1 à 42", isCorrect: false }
    ],
    explanation: "Ce code utilise random.sample() pour sélectionner 6 nombres différents dans l'intervalle de 1 à 50 inclus. La fonction seed(42) fixe la graine du générateur de nombres aléatoires, ce qui garantit que la même séquence de nombres sera générée à chaque exécution. Ainsi, ce code produira toujours exactement les mêmes 6 nombres aléatoires.",
    hint: "Fixer la graine (seed) du générateur aléatoire permet d'obtenir des résultats reproductibles, ce qui est utile pour le débogage et les tests."
  },
  {
    id: "python-debutant-49",
    code: `def convertir_en_liste(nombre):
    return [int(chiffre) for chiffre in str(nombre)]

print(convertir_en_liste(12345))`,
    language: "python",
    question: "Que fait cette fonction et quel est le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle convertit un nombre en liste de ses chiffres et affiche [1, 2, 3, 4, 5]", isCorrect: true },
      { id: "b", text: "Elle convertit un nombre en chaîne de caractères et affiche '12345'", isCorrect: false },
      { id: "c", text: "Elle additionne les chiffres d'un nombre et affiche 15", isCorrect: false },
      { id: "d", text: "Elle divise un nombre en facteurs premiers et affiche [5, 823, 3]", isCorrect: false }
    ],
    explanation: "Cette fonction prend un nombre entier et le convertit en une liste où chaque élément est un chiffre du nombre. Elle convertit d'abord le nombre en chaîne de caractères avec str(), puis parcourt chaque caractère, le convertit en entier avec int(), et ajoute le résultat à une liste grâce à une compréhension de liste. Pour 12345, le résultat est [1, 2, 3, 4, 5].",
    hint: "En Python, les compréhensions de liste permettent de créer de nouvelles listes en appliquant une expression à chaque élément d'un itérable."
  },
  {
    id: "python-debutant-50",
    code: `def remplacer_voyelles(texte, remplacement="*"):
    voyelles = "aeiouAEIOU"
    resultat = ""
    
    for caractere in texte:
        if caractere in voyelles:
            resultat += remplacement
        else:
            resultat += caractere
    
    return resultat

print(remplacer_voyelles("Bonjour tout le monde"))
print(remplacer_voyelles("Python est super", "-"))`,
    language: "python",
    question: "Que fait cette fonction et quels sont les résultats affichés ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle remplace les voyelles par un caractère spécifié et affiche 'B*nj**r t**t l* m*nd*' et 'P-th-n -st s-p-r'", isCorrect: true },
      { id: "b", text: "Elle compte les voyelles et affiche 8 et 5", isCorrect: false },
      { id: "c", text: "Elle supprime les voyelles et affiche 'Bnjr tt l mnd' et 'Pthn st spr'", isCorrect: false },
      { id: "d", text: "Elle met en majuscules les voyelles et affiche 'BOnjOUr tOUt lE mOndE' et 'PythOn Est sUpEr'", isCorrect: false }
    ],
    explanation: "Cette fonction remplace toutes les voyelles d'un texte par un caractère de remplacement spécifié. Si aucun caractère de remplacement n'est fourni, elle utilise '*' par défaut. Pour 'Bonjour tout le monde', elle remplace les voyelles par '*', donnant 'B*nj**r t**t l* m*nd*'. Pour 'Python est super' avec le remplacement '-', elle produit 'P-th-n -st s-p-r'.",
    hint: "Les paramètres avec des valeurs par défaut permettent de spécifier un comportement par défaut si l'argument n'est pas fourni."
  }

];

// Défis Python - Niveau Intermédiaire
export const pythonIntermediaire: CodeChallenge[] = [
  {
    id: "python-intermediaire-1",
    code: `def calculer_moyenne(notes):
    if not notes:
        return 0
    return sum(notes) / len(notes)
    
notes_etudiants = {
    'Alice': [15, 17, 19],
    'Bob': [12, 14, 11],
    'Charlie': [18, 16, 20]
}

moyennes = {etudiant: calculer_moyenne(notes) for etudiant, notes in notes_etudiants.items()}
meilleur_etudiant = max(moyennes, key=moyennes.get)

print(f"Meilleur étudiant: {meilleur_etudiant} avec une moyenne de {moyennes[meilleur_etudiant]}")`,
    language: "python",
    question: "Quel est l'étudiant qui sera affiché comme le meilleur?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Charlie", isCorrect: true },
      { id: "b", text: "Alice", isCorrect: false },
      { id: "c", text: "Bob", isCorrect: false },
      { id: "d", text: "Aucun, le code génère une erreur", isCorrect: false }
    ],
    explanation: "Le code calcule la moyenne des notes pour chaque étudiant en utilisant une compréhension de dictionnaire. Charlie a les notes [18, 16, 20], ce qui donne une moyenne de 18, la plus élevée parmi tous les étudiants.",
    hint: "Calculez manuellement la moyenne pour chaque étudiant et trouvez la plus élevée."
  },
  {
    id: "python-intermediaire-2",
    code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

import time

def mesurer_temps(func, args):
    debut = time.time()
    resultat = func(*args)
    fin = time.time()
    return resultat, fin - debut

# Sans décorateur
def fibonacci_sans_cache(n):
    if n <= 1:
        return n
    return fibonacci_sans_cache(n-1) + fibonacci_sans_cache(n-2)

# Comparer les performances pour n=30
resultat_avec_cache, temps_avec_cache = mesurer_temps(fibonacci, (30,))
resultat_sans_cache, temps_sans_cache = mesurer_temps(fibonacci_sans_cache, (30,))

print(f"Avec cache: {temps_avec_cache:.6f} secondes")
print(f"Sans cache: {temps_sans_cache:.6f} secondes")
print(f"Accélération: {temps_sans_cache / temps_avec_cache:.1f}x")`,
    language: "python",
    question: "Quel est le principal avantage de l'utilisation du décorateur @lru_cache dans ce code ?",
    difficulty: "avancé",
    responses: [
      { id: "a", text: "Il rend la fonction fibonacci thread-safe", isCorrect: false },
      { id: "b", text: "Il limite la profondeur de récursion pour éviter les StackOverflowError", isCorrect: false },
      { id: "c", text: "Il mémorise les résultats précédents pour éviter les calculs redondants", isCorrect: true },
      { id: "d", text: "Il parallélise automatiquement les calculs pour améliorer les performances", isCorrect: false }
    ],
    explanation: "Le décorateur @lru_cache (Least Recently Used Cache) de functools mémorise les résultats des appels précédents à la fonction. Cela permet d'éviter de recalculer plusieurs fois les mêmes valeurs de la suite de Fibonacci, ce qui est particulièrement utile pour cette fonction récursive où les mêmes sous-problèmes sont résolus de nombreuses fois. Sans cette mémorisation, le calcul de fibonacci(n) aurait une complexité exponentielle O(2^n).",
    hint: "Pensez à comment la récursion dans la fonction fibonacci génère de nombreux appels redondants. Que fait un cache dans ce contexte ?"
  },
  {
    id: "python-avance-2",
    code: `class NoeudArbre:
    def __init__(self, valeur):
        self.valeur = valeur
        self.gauche = None
        self.droite = None

def inserer(racine, valeur):
    if racine is None:
        return NoeudArbre(valeur)
    
    if valeur < racine.valeur:
        racine.gauche = inserer(racine.gauche, valeur)
    else:
        racine.droite = inserer(racine.droite, valeur)
    
    return racine

def parcours_inordre(racine, resultat=None):
    if resultat is None:
        resultat = []
    
    if racine:
        parcours_inordre(racine.gauche, resultat)
        resultat.append(racine.valeur)
        parcours_inordre(racine.droite, resultat)
    
    return resultat

# Construction de l'arbre
racine = None
for valeur in [50, 30, 70, 20, 40, 60, 80]:
    racine = inserer(racine, valeur)

print(parcours_inordre(racine))`,
    language: "python",
    question: "Quelle sera la sortie de ce code utilisant un arbre binaire de recherche ?",
    difficulty: "avancé",
    responses: [
      { id: "a", text: "[50, 30, 70, 20, 40, 60, 80]", isCorrect: false },
      { id: "b", text: "[20, 30, 40, 50, 60, 70, 80]", isCorrect: true },
      { id: "c", text: "[20, 40, 30, 60, 80, 70, 50]", isCorrect: false },
      { id: "d", text: "[80, 70, 60, 50, 40, 30, 20]", isCorrect: false }
    ],
    explanation: "Ce code implémente un arbre binaire de recherche où chaque nœud a une valeur, un sous-arbre gauche contenant des valeurs inférieures et un sous-arbre droit contenant des valeurs supérieures. La fonction parcours_inordre effectue un parcours inordre (gauche-racine-droite), ce qui, pour un arbre binaire de recherche, donne les valeurs dans l'ordre croissant. Avec les valeurs [50, 30, 70, 20, 40, 60, 80], le parcours inordre donne [20, 30, 40, 50, 60, 70, 80].",
    hint: "Un parcours inordre d'un arbre binaire de recherche visite d'abord le sous-arbre gauche, puis la racine, puis le sous-arbre droit, ce qui donne les valeurs dans l'ordre croissant."
  }
];

// Défis SQL - Niveau Débutant
export const sqlDebutant: CodeChallenge[] = [
  {
    id: "sql-debutant-1",
    code: `SELECT department_id, COUNT(*) as nombre_employes
FROM employees
WHERE salary > 5000
GROUP BY department_id
HAVING COUNT(*) > 3
ORDER BY nombre_employes DESC;`,
    language: "sql",
    question: "Que fait cette requête SQL ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle compte le nombre total d'employés dans chaque département", isCorrect: false },
      { id: "b", text: "Elle liste les départements où plus de 3 employés gagnent plus de 5000", isCorrect: true },
      { id: "c", text: "Elle trouve les départements ayant exactement 3 employés avec un salaire supérieur à 5000", isCorrect: false },
      { id: "d", text: "Elle calcule le salaire moyen par département pour les employés gagnant plus de 5000", isCorrect: false }
    ],
    explanation: "Cette requête SQL filtre d'abord les employés ayant un salaire supérieur à 5000, puis les groupe par département. Ensuite, elle applique un filtre HAVING pour ne garder que les groupes contenant plus de 3 employés. Enfin, elle trie les résultats par ordre décroissant du nombre d'employés.",
    hint: "Analysez les différentes clauses: WHERE filtre les lignes individuelles, GROUP BY regroupe les résultats, HAVING filtre les groupes, et ORDER BY détermine l'ordre des résultats."
  },
  {
    id: "sql-debutant-2",
    code: `SELECT c.customer_name, 
       SUM(o.total_amount) as montant_total
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY montant_total DESC NULLS LAST;`,
    language: "sql",
    question: "Que fait cette requête et pourquoi utilise-t-elle un LEFT JOIN plutôt qu'un INNER JOIN ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle liste le montant total des commandes par client, et inclut les clients sans commandes", isCorrect: true },
      { id: "b", text: "Elle trouve les clients qui ont dépensé le plus, en excluant ceux sans commandes", isCorrect: false },
      { id: "c", text: "Elle calcule le nombre de commandes par client, y compris pour ceux sans commandes", isCorrect: false },
      { id: "d", text: "Elle joint les tables customers et orders pour trouver les commandes sans clients", isCorrect: false }
    ],
    explanation: "Cette requête utilise un LEFT JOIN pour conserver tous les clients dans les résultats, même ceux qui n'ont pas passé de commandes. Pour ces clients sans commandes, la valeur de montant_total sera NULL. Un INNER JOIN aurait exclu les clients sans commandes des résultats. La clause NULLS LAST place les clients sans commandes à la fin du tri.",
    hint: "Un LEFT JOIN garde toutes les lignes de la table de gauche (customers) même s'il n'y a pas de correspondance dans la table de droite (orders)."
  }
];

// Défis SQL - Niveau Intermédiaire
export const sqlIntermediaire: CodeChallenge[] = [
  {
    id: "sql-intermediaire-1",
    code: `WITH ventes_mensuelles AS (
  SELECT 
    DATE_TRUNC('month', sale_date) as mois,
    product_id,
    SUM(quantity) as quantite_vendue
  FROM sales
  WHERE sale_date >= '2023-01-01' AND sale_date < '2024-01-01'
  GROUP BY DATE_TRUNC('month', sale_date), product_id
),
classement_produits AS (
  SELECT
    mois,
    product_id,
    quantite_vendue,
    RANK() OVER (PARTITION BY mois ORDER BY quantite_vendue DESC) as rang
  FROM ventes_mensuelles
)
SELECT 
  cp.mois,
  p.product_name,
  cp.quantite_vendue
FROM classement_produits cp
JOIN products p ON cp.product_id = p.product_id
WHERE cp.rang <= 3
ORDER BY cp.mois, cp.rang;`,
    language: "sql",
    question: "Que calcule cette requête SQL avec ses Common Table Expressions (CTE) ?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "La quantité totale vendue pour chaque produit en 2023", isCorrect: false },
      { id: "b", text: "Les 3 produits les plus vendus de tous les temps", isCorrect: false },
      { id: "c", text: "Les 3 produits les plus vendus pour chaque mois de 2023", isCorrect: true },
      { id: "d", text: "La progression mensuelle des ventes pour chaque produit en 2023", isCorrect: false }
    ],
    explanation: "Cette requête utilise deux CTEs pour trouver les trois produits les plus vendus pour chaque mois de 2023. La première CTE (ventes_mensuelles) agrège les ventes par mois et par produit. La seconde CTE (classement_produits) utilise la fonction de fenêtrage RANK() pour attribuer un rang à chaque produit en fonction de sa quantité vendue au sein de chaque mois. La requête principale sélectionne ensuite uniquement les produits ayant un rang inférieur ou égal à 3.",
    hint: "Examinez la fonction de fenêtrage RANK() OVER (PARTITION BY...) et comment elle est utilisée avec la clause WHERE dans la requête principale."
  }
];

// Défis SQL - Niveau Avancé
export const sqlAvance: CodeChallenge[] = [
  {
    id: "sql-avance-1",
    code: `WITH RECURSIVE employee_hierarchy AS (
  -- Cas de base: employés de niveau supérieur (sans manager)
  SELECT 
    employee_id, 
    first_name, 
    last_name, 
    manager_id, 
    1 as depth,
    ARRAY[employee_id] as path,
    first_name || ' ' || last_name as full_path_names
  FROM employees
  WHERE manager_id IS NULL
  
  UNION ALL
  
  -- Cas récursif: tous les subordonnés directs
  SELECT 
    e.employee_id, 
    e.first_name, 
    e.last_name, 
    e.manager_id, 
    eh.depth + 1,
    eh.path || e.employee_id,
    eh.full_path_names || ' > ' || e.first_name || ' ' || e.last_name
  FROM employees e
  JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
  WHERE NOT e.employee_id = ANY(eh.path)  -- Évite les cycles
)
SELECT 
  eh.employee_id,
  eh.first_name,
  eh.last_name,
  eh.depth,
  eh.full_path_names,
  (SELECT COUNT(*) FROM employees WHERE manager_id = eh.employee_id) as direct_reports
FROM employee_hierarchy eh
ORDER BY eh.path;`,
    language: "sql",
    question: "Quel problème potentiel cette requête SQL cherche-t-elle à éviter avec la condition 'WHERE NOT e.employee_id = ANY(eh.path)' ?",
    difficulty: "avancé",
    responses: [
      { id: "a", text: "Les erreurs de performance dues à des jointures trop volumineuses", isCorrect: false },
      { id: "b", text: "L'inclusion d'employés qui ne font pas partie de la hiérarchie", isCorrect: false },
      { id: "c", text: "Les boucles infinies dues à des références circulaires dans la hiérarchie", isCorrect: true },
      { id: "d", text: "La duplication d'employés dans les résultats finaux", isCorrect: false }
    ],
    explanation: "Cette requête utilise une CTE récursive pour construire une hiérarchie complète des employés. La condition 'WHERE NOT e.employee_id = ANY(eh.path)' vérifie qu'un employé n'apparaît pas déjà dans le chemin hiérarchique actuel, ce qui pourrait arriver si les données contiennent une référence circulaire (par exemple, A est manager de B, B est manager de C, et C est manager de A). Sans cette vérification, la requête récursive pourrait entrer dans une boucle infinie et ne jamais se terminer.",
    hint: "Pensez à ce qui pourrait se passer dans une structure hiérarchique si un subordonné était enregistré comme le manager de son propre manager. Comment la récursion se comporterait-elle sans cette protection ?"
  }
];

// Fonction pour obtenir des défis aléatoires
// Défis Python - Niveau Avancé
export const pythonAvance: CodeChallenge[] = [
  {
    id: "python-avance-1",
    code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(35))`,
    language: "python",
    question: "Que fait ce code et quelle est sa particularité?",
    difficulty: "avancé",
    responses: [
      { id: "a", text: "Il calcule le 35e nombre de Fibonacci en utilisant la récursivité avec mémoïsation", isCorrect: true },
      { id: "b", text: "Il calcule le 35e nombre de Fibonacci avec une complexité O(2^n)", isCorrect: false },
      { id: "c", text: "Il utilise une boucle for cachée pour calculer la suite de Fibonacci", isCorrect: false },
      { id: "d", text: "Il crée un générateur de nombres de Fibonacci", isCorrect: false }
    ],
    explanation: "Ce code utilise le décorateur @lru_cache pour mémoriser les résultats précédents des appels à la fonction fibonacci(), évitant ainsi les calculs redondants. Sans cette optimisation, le calcul récursif aurait une complexité exponentielle O(2^n).",
    hint: "Regardez attentivement le décorateur utilisé avant la définition de la fonction."
  },
  {
    id: "python-avance-2",
    code: `class MaClasse:
    compteur = 0
    
    def __init__(self):
        MaClasse.compteur += 1
        self.id = MaClasse.compteur
        
    @classmethod
    def get_compteur(cls):
        return cls.compteur
        
a = MaClasse()
b = MaClasse()
c = MaClasse()
print(c.id)
print(MaClasse.get_compteur())`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "avancé",
    responses: [
      { id: "a", text: "3 et 3", isCorrect: true },
      { id: "b", text: "3 et 0", isCorrect: false },
      { id: "c", text: "2 et 3", isCorrect: false },
      { id: "d", text: "3 et 1", isCorrect: false }
    ],
    explanation: "Le code utilise une variable de classe 'compteur' qui est partagée entre toutes les instances. Chaque fois qu'une nouvelle instance est créée, le compteur est incrémenté. L'instance 'c' est la troisième créée, donc son 'id' est 3. La méthode de classe get_compteur() renvoie la valeur actuelle du compteur, qui est aussi 3.",
    hint: "Faites attention à la différence entre les variables de classe et les variables d'instance."
  }
];

// Défis SQL - Niveau Avancé
export const sqlAvance: CodeChallenge[] = [
  {
    id: "sql-avance-1",
    code: `WITH RECURSIVE EmployeeHierarchy AS (
  -- Cas de base: le CEO (sans manager)
  SELECT 
    employee_id, 
    first_name, 
    last_name, 
    manager_id, 
    1 as depth,
    ARRAY[employee_id] as path,
    first_name || ' ' || last_name as full_path_names
  FROM employees
  WHERE manager_id IS NULL
  
  UNION ALL
  
  -- Cas récursif: tous les subordonnés directs
  SELECT 
    e.employee_id, 
    e.first_name, 
    e.last_name, 
    e.manager_id, 
    eh.depth + 1,
    eh.path || e.employee_id,
    eh.full_path_names || ' > ' || e.first_name || ' ' || e.last_name
  FROM employees e
  JOIN EmployeeHierarchy eh ON e.manager_id = eh.employee_id
)

SELECT 
  employee_id,
  first_name,
  last_name,
  depth,
  full_path_names
FROM EmployeeHierarchy
ORDER BY path;`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "avancé",
    responses: [
      { id: "a", text: "Elle affiche la hiérarchie complète des employés sous forme d'arborescence avec le chemin depuis le CEO", isCorrect: true },
      { id: "b", text: "Elle compte le nombre d'employés par niveau hiérarchique", isCorrect: false },
      { id: "c", text: "Elle identifie les employés qui n'ont pas de manager", isCorrect: false },
      { id: "d", text: "Elle calcule le salaire total par niveau hiérarchique", isCorrect: false }
    ],
    explanation: "Cette requête utilise une expression CTE (Common Table Expression) récursive pour construire l'arborescence hiérarchique complète des employés. Elle commence par le CEO (employé sans manager), puis ajoute récursivement tous les subordonnés directs à chaque niveau. Pour chaque employé, elle conserve le chemin complet depuis le CEO, la profondeur dans la hiérarchie, et construit une représentation textuelle du chemin hiérarchique.",
    hint: "Les requêtes récursives en SQL commencent par un cas de base, puis appliquent récursivement une opération pour construire un résultat complet."
  },
  {
    id: "sql-avance-2",
    code: `WITH monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', order_date) AS month,
    product_id,
    SUM(quantity) AS total_quantity
  FROM orders
  WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', order_date), product_id
),
ranked_products AS (
  SELECT
    month,
    product_id,
    total_quantity,
    RANK() OVER (PARTITION BY month ORDER BY total_quantity DESC) as rank
  FROM monthly_sales
)
SELECT
  rp.month,
  p.product_name,
  rp.total_quantity
FROM ranked_products rp
JOIN products p ON rp.product_id = p.product_id
WHERE rp.rank <= 3
ORDER BY rp.month DESC, rp.rank;`,
    language: "sql",
    question: "Quel est l'objectif de cette requête SQL?",
    difficulty: "avancé",
    responses: [
      { id: "a", text: "Trouver les 3 produits les plus vendus pour chaque mois des 12 derniers mois", isCorrect: true },
      { id: "b", text: "Calculer les ventes totales par produit sur les 12 derniers mois", isCorrect: false },
      { id: "c", text: "Identifier les mois avec les ventes les plus élevées pour chaque produit", isCorrect: false },
      { id: "d", text: "Comparer les ventes mensuelles de chaque produit avec la moyenne", isCorrect: false }
    ],
    explanation: "Cette requête utilise des CTEs (Common Table Expressions) et des fonctions de fenêtrage (window functions) pour analyser les ventes. D'abord, elle calcule les ventes mensuelles par produit sur les 12 derniers mois. Ensuite, elle attribue un rang à chaque produit au sein de chaque mois en fonction des quantités vendues. Enfin, elle ne conserve que les 3 produits les mieux classés pour chaque mois.",
    hint: "La fonction RANK() OVER (PARTITION BY ... ORDER BY ...) est utilisée pour classer des éléments au sein de groupes spécifiques."
  }
];

export function getRandomChallenges(
  language: 'python' | 'sql',
  difficulty: 'débutant' | 'intermédiaire' | 'avancé',
  count: number = 3
): CodeChallenge[] {
  let challenges: CodeChallenge[] = [];
  
  if (language === 'python') {
    if (difficulty === 'débutant') {
      challenges = pythonDebutant;
    } else if (difficulty === 'intermédiaire') {
      challenges = pythonIntermediaire;
    } else {
      challenges = pythonAvance;
    }
  } else {
    if (difficulty === 'débutant') {
      challenges = sqlDebutant;
    } else if (difficulty === 'intermédiaire') {
      challenges = sqlIntermediaire;
    } else {
      challenges = sqlAvance;
    }
  }
  
  // Si pas assez de défis disponibles, retourner tous ceux disponibles
  if (challenges.length <= count) {
    return [...challenges];
  }
  
  // Sinon, sélectionner aléatoirement 'count' défis
  const shuffled = [...challenges].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Fonction pour générer un ID unique basé sur un timestamp
export function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}