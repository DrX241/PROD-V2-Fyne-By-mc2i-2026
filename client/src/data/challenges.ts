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
    code: `fruits = ["pomme", "banane", "orange", "kiwi", "mangue"]
print(fruits[2])`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "pomme", isCorrect: false },
      { id: "b", text: "banane", isCorrect: false },
      { id: "c", text: "orange", isCorrect: true },
      { id: "d", text: "kiwi", isCorrect: false }
    ],
    explanation: "En Python, l'indexation commence à 0. Le premier élément est à l'indice 0, le deuxième à l'indice 1, etc. Donc fruits[2] correspond au troisième élément, qui est 'orange'.",
    hint: "Pensez à compter à partir de 0, pas de 1."
  },
  {
    id: "python-debutant-2",
    code: `x = 5
y = 2
print(x // y)`,
    language: "python",
    question: "Quel sera le résultat affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "2.5", isCorrect: false },
      { id: "b", text: "2", isCorrect: true },
      { id: "c", text: "2,5", isCorrect: false },
      { id: "d", text: "1", isCorrect: false }
    ],
    explanation: "L'opérateur // en Python est l'opérateur de division entière. Il renvoie le quotient entier de la division en tronquant la partie décimale. 5 divisé par 2 donne 2.5, mais la division entière donne 2.",
    hint: "L'opérateur // renvoie la partie entière de la division."
  },
  {
    id: "python-debutant-3",
    code: `chaine = "Python est un langage puissant"
print(chaine[7:10])`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "est", isCorrect: true },
      { id: "b", text: "est ", isCorrect: false },
      { id: "c", text: " est", isCorrect: false },
      { id: "d", text: "Pytho", isCorrect: false }
    ],
    explanation: "Le slicing en Python s'écrit sous la forme [début:fin]. L'indice de début est inclus, mais l'indice de fin est exclu. Ici, chaine[7:10] commence à l'indice 7 (le caractère 'e') et s'arrête avant l'indice 10, ce qui donne 'est'.",
    hint: "Attention aux espaces dans la chaîne, et n'oubliez pas que l'indexation commence à 0."
  },
  {
    id: "python-debutant-4",
    code: `def multiplier(a, b=2):
    return a * b

print(multiplier(5))`,
    language: "python",
    question: "Que va afficher ce programme ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "5", isCorrect: false },
      { id: "b", text: "10", isCorrect: true },
      { id: "c", text: "7", isCorrect: false },
      { id: "d", text: "Une erreur, car le deuxième argument est manquant", isCorrect: false }
    ],
    explanation: "La fonction multiplier a un paramètre b avec une valeur par défaut de 2. Si aucune valeur n'est fournie pour b lors de l'appel, cette valeur par défaut est utilisée. Donc multiplier(5) est équivalent à multiplier(5, 2), ce qui renvoie 5 * 2 = 10.",
    hint: "Regardez attentivement la définition de la fonction et la valeur par défaut du paramètre b."
  },
  {
    id: "python-debutant-5",
    code: `nombres = [1, 2, 3, 4, 5]
total = 0
for nombre in nombres:
    if nombre % 2 == 0:
        total += nombre
print(total)`,
    language: "python",
    question: "Quelle est la valeur de total à la fin de l'exécution ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "15", isCorrect: false },
      { id: "b", text: "6", isCorrect: true },
      { id: "c", text: "9", isCorrect: false },
      { id: "d", text: "0", isCorrect: false }
    ],
    explanation: "Le code parcourt la liste nombres et ajoute à total uniquement les nombres pairs (ceux divisibles par 2). Dans la liste [1, 2, 3, 4, 5], les nombres pairs sont 2 et 4, donc total = 0 + 2 + 4 = 6.",
    hint: "L'expression nombre % 2 == 0 vérifie si un nombre est pair."
  },
  {
    id: "python-debutant-6",
    code: `mots = ["python", "est", "un", "langage", "de", "programmation"]
resultat = " ".join(mots)
print(resultat)`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "['python', 'est', 'un', 'langage', 'de', 'programmation']", isCorrect: false },
      { id: "b", text: "python est un langage de programmation", isCorrect: true },
      { id: "c", text: "pythonestunlangagedeprogrammation", isCorrect: false },
      { id: "d", text: "python-est-un-langage-de-programmation", isCorrect: false }
    ],
    explanation: "La méthode join() prend une séquence (comme une liste) et joint ses éléments en une seule chaîne, en utilisant la chaîne sur laquelle elle est appelée comme séparateur. Ici, le séparateur est un espace, donc les mots sont joints avec des espaces entre eux.",
    hint: "La syntaxe de join est 'séparateur'.join(liste)."
  },
  {
    id: "python-debutant-7",
    code: `def fonction(x):
    if x < 0:
        return "Négatif"
    elif x == 0:
        return "Zéro"
    else:
        return "Positif"

print(fonction(0))`,
    language: "python",
    question: "Quel sera le résultat de l'exécution de ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Négatif", isCorrect: false },
      { id: "b", text: "Zéro", isCorrect: true },
      { id: "c", text: "Positif", isCorrect: false },
      { id: "d", text: "Aucun résultat n'est affiché", isCorrect: false }
    ],
    explanation: "La fonction vérifie si x est négatif, égal à zéro, ou positif, et renvoie la chaîne correspondante. Comme x = 0, la condition x == 0 est vraie, donc la fonction renvoie 'Zéro'.",
    hint: "Suivez le flux d'exécution de la fonction et vérifiez quelle condition est satisfaite pour x = 0."
  },
  {
    id: "python-debutant-8",
    code: `liste1 = [1, 2, 3]
liste2 = liste1
liste2.append(4)
print(liste1)`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "[1, 2, 3]", isCorrect: false },
      { id: "b", text: "[1, 2, 3, 4]", isCorrect: true },
      { id: "c", text: "[4, 1, 2, 3]", isCorrect: false },
      { id: "d", text: "Une erreur se produira", isCorrect: false }
    ],
    explanation: "En Python, lorsqu'on assigne une liste à une autre variable (liste2 = liste1), les deux variables font référence au même objet en mémoire. Donc, toute modification de liste2 affecte également liste1. Après avoir ajouté 4 à liste2, liste1 contient aussi [1, 2, 3, 4].",
    hint: "En Python, l'assignation de listes crée une référence, pas une copie."
  },
  {
    id: "python-debutant-9",
    code: `texte = "Python est génial"
print(texte.upper())`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "python est génial", isCorrect: false },
      { id: "b", text: "Python Est Génial", isCorrect: false },
      { id: "c", text: "PYTHON EST GÉNIAL", isCorrect: true },
      { id: "d", text: "Python est génial", isCorrect: false }
    ],
    explanation: "La méthode upper() en Python convertit tous les caractères d'une chaîne en majuscules. Donc 'Python est génial' devient 'PYTHON EST GÉNIAL'.",
    hint: "La méthode upper() transforme tous les caractères en majuscules."
  },
  {
    id: "python-debutant-10",
    code: `for i in range(5):
    if i == 3:
        continue
    print(i, end=' ')`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "0 1 2 3 4", isCorrect: false },
      { id: "b", text: "0 1 2 4", isCorrect: true },
      { id: "c", text: "1 2 4", isCorrect: false },
      { id: "d", text: "0 1 2", isCorrect: false }
    ],
    explanation: "La boucle parcourt les nombres de 0 à 4. L'instruction continue fait sauter le reste du corps de la boucle pour l'itération courante. Donc, quand i == 3, l'instruction print est ignorée. Les nombres 0, 1, 2 et 4 sont affichés.",
    hint: "L'instruction continue passe directement à l'itération suivante de la boucle."
  },
  {
    id: "python-debutant-11",
    code: `a = 10
b = 3
print(a % b)`,
    language: "python",
    question: "Quel sera le résultat de ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "3", isCorrect: false },
      { id: "b", text: "1", isCorrect: true },
      { id: "c", text: "0", isCorrect: false },
      { id: "d", text: "3.33", isCorrect: false }
    ],
    explanation: "L'opérateur % en Python donne le reste de la division du premier opérande par le second. 10 divisé par 3 donne 3 avec un reste de 1. Donc, a % b = 10 % 3 = 1.",
    hint: "L'opérateur modulo (%) donne le reste de la division."
  },
  {
    id: "python-debutant-12",
    code: `d = {'a': 1, 'b': 2, 'c': 3}
print('b' in d)`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "True", isCorrect: true },
      { id: "b", text: "False", isCorrect: false },
      { id: "c", text: "b", isCorrect: false },
      { id: "d", text: "2", isCorrect: false }
    ],
    explanation: "L'opérateur in, lorsqu'il est utilisé avec un dictionnaire, vérifie si la clé spécifiée existe dans le dictionnaire. Comme la clé 'b' existe dans le dictionnaire d, l'expression 'b' in d renvoie True.",
    hint: "L'opérateur in vérifie l'existence d'une clé dans un dictionnaire."
  },
  {
    id: "python-debutant-13",
    code: `def addition(a, b):
    return a + b

resultat = addition(3, 4)
print(resultat * 2)`,
    language: "python",
    question: "Quel nombre sera affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "7", isCorrect: false },
      { id: "b", text: "14", isCorrect: true },
      { id: "c", text: "10", isCorrect: false },
      { id: "d", text: "Une erreur se produira", isCorrect: false }
    ],
    explanation: "La fonction addition renvoie la somme de a et b, donc addition(3, 4) = 3 + 4 = 7. Ensuite, ce résultat est multiplié par 2, ce qui donne 7 * 2 = 14.",
    hint: "Suivez l'exécution pas à pas : d'abord calculez le résultat de la fonction, puis appliquez la multiplication."
  },
  {
    id: "python-debutant-14",
    code: `chaine = "abcdef"
print(chaine[::-1])`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "abcdef", isCorrect: false },
      { id: "b", text: "fedcba", isCorrect: true },
      { id: "c", text: "a", isCorrect: false },
      { id: "d", text: "f", isCorrect: false }
    ],
    explanation: "En Python, le slicing avec [::-1] inverse l'ordre des éléments de la séquence. Donc, la chaîne 'abcdef' devient 'fedcba'.",
    hint: "Le paramètre -1 dans le slicing indique qu'on parcourt la chaîne à l'envers."
  },
  {
    id: "python-debutant-15",
    code: `x = 5
y = 3
z = 2
print(x > y > z)`,
    language: "python",
    question: "Quel sera le résultat ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "True", isCorrect: true },
      { id: "b", text: "False", isCorrect: false },
      { id: "c", text: "5 > 3 > 2", isCorrect: false },
      { id: "d", text: "Une erreur se produira", isCorrect: false }
    ],
    explanation: "En Python, on peut chaîner les opérateurs de comparaison. L'expression x > y > z est équivalente à (x > y) and (y > z). Comme 5 > 3 et 3 > 2 sont tous deux vrais, le résultat final est True.",
    hint: "Python permet de chaîner les comparaisons de manière intuitive."
  },
  {
    id: "python-debutant-16",
    code: `nombres = [1, 2, 3, 4, 5]
resultat = [x * 2 for x in nombres if x % 2 == 0]
print(resultat)`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "[2, 4, 6, 8, 10]", isCorrect: false },
      { id: "b", text: "[4, 8]", isCorrect: true },
      { id: "c", text: "[2, 6, 10]", isCorrect: false },
      { id: "d", text: "[4]", isCorrect: false }
    ],
    explanation: "Cette ligne utilise une compréhension de liste avec un filtre. Elle prend chaque nombre x dans la liste nombres, filtre pour ne garder que les nombres pairs (x % 2 == 0), puis multiplie ces nombres par 2. Dans la liste [1, 2, 3, 4, 5], les nombres pairs sont 2 et 4, et après multiplication par 2, on obtient [4, 8].",
    hint: "La compréhension de liste applique d'abord le filtre (if x % 2 == 0), puis la transformation (x * 2)."
  },
  {
    id: "python-debutant-17",
    code: `a = [1, 2, 3]
b = [4, 5, 6]
c = a + b
print(len(c))`,
    language: "python",
    question: "Quel nombre sera affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "2", isCorrect: false },
      { id: "b", text: "6", isCorrect: false },
      { id: "c", text: "21", isCorrect: false },
      { id: "d", text: "6", isCorrect: true }
    ],
    explanation: "En Python, l'opérateur + entre deux listes concatène ces listes. a + b donne donc [1, 2, 3, 4, 5, 6]. La fonction len() renvoie le nombre d'éléments dans une séquence, donc len(c) = 6.",
    hint: "L'opérateur + concatène deux listes, et len() compte le nombre d'éléments."
  },
  {
    id: "python-debutant-18",
    code: `print(bool(0), bool(1), bool(""), bool("hello"))`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "False True False True", isCorrect: true },
      { id: "b", text: "False True True True", isCorrect: false },
      { id: "c", text: "True True False True", isCorrect: false },
      { id: "d", text: "False False False True", isCorrect: false }
    ],
    explanation: "En Python, bool() convertit une valeur en booléen. Les valeurs considérées comme fausses incluent 0, None, les chaînes vides, les listes vides, etc. Toutes les autres valeurs sont considérées comme vraies. Donc, bool(0) = False, bool(1) = True, bool(\"\") = False et bool(\"hello\") = True.",
    hint: "En Python, certaines valeurs sont naturellement évaluées à False (0, chaînes vides, etc.)."
  },
  {
    id: "python-debutant-19",
    code: `liste = [1, 2, 3, 4, 5]
print(liste[-2])`,
    language: "python",
    question: "Qu'affichera ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "5", isCorrect: false },
      { id: "b", text: "4", isCorrect: true },
      { id: "c", text: "2", isCorrect: false },
      { id: "d", text: "Une erreur se produira", isCorrect: false }
    ],
    explanation: "En Python, les indices négatifs permettent d'accéder aux éléments d'une séquence en partant de la fin. L'indice -1 correspond au dernier élément, -2 à l'avant-dernier, etc. Donc, liste[-2] désigne l'avant-dernier élément de la liste, qui est 4.",
    hint: "Les indices négatifs comptent à partir de la fin de la liste."
  },
  {
    id: "python-debutant-20",
    code: `a = 10
b = "10"
print(str(a) == b)`,
    language: "python",
    question: "Quel sera le résultat ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "True", isCorrect: true },
      { id: "b", text: "False", isCorrect: false },
      { id: "c", text: "10 == 10", isCorrect: false },
      { id: "d", text: "Une erreur se produira", isCorrect: false }
    ],
    explanation: "La fonction str() convertit son argument en chaîne de caractères. Donc, str(a) donne la chaîne '10'. La comparaison str(a) == b compare deux chaînes : '10' et '10', qui sont égales. Le résultat est donc True.",
    hint: "La fonction str() convertit un nombre en sa représentation sous forme de chaîne."
  },
  {
    id: "python-debutant-21",
    code: `nombres = [10, 20, 30, 40, 50]
print(sum(nombres) / len(nombres))`,
    language: "python",
    question: "Que calcule ce code ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "La somme des nombres", isCorrect: false },
      { id: "b", text: "La moyenne des nombres", isCorrect: true },
      { id: "c", text: "Le nombre d'éléments dans la liste", isCorrect: false },
      { id: "d", text: "Le dernier élément de la liste", isCorrect: false }
    ],
    explanation: "Ce code calcule la moyenne des nombres dans la liste. sum(nombres) donne la somme de tous les éléments (10 + 20 + 30 + 40 + 50 = 150), et len(nombres) donne le nombre d'éléments (5). Donc, sum(nombres) / len(nombres) = 150 / 5 = 30.",
    hint: "Pour calculer une moyenne, on divise la somme des valeurs par le nombre de valeurs."
  },
  {
    id: "python-debutant-22",
    code: `texte = "Python est un langage de programmation"
mots = texte.split()
print(len(mots))`,
    language: "python",
    question: "Quel nombre sera affiché ?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "6", isCorrect: true },
      { id: "b", text: "5", isCorrect: false },
      { id: "c", text: "7", isCorrect: false },
      { id: "d", text: "39", isCorrect: false }
    ],
    explanation: "La méthode split() sans argument divise une chaîne en mots, en utilisant les espaces comme séparateurs. La chaîne 'Python est un langage de programmation' contient 6 mots : 'Python', 'est', 'un', 'langage', 'de', 'programmation'. Donc, len(mots) = 6.",
    hint: "Comptez le nombre de mots dans la phrase originale."
  },
  {
    id: "python-debutant-23",
    code: `liste = [1, 2, 3, 4, 5]
element = liste.pop(2)
print(liste, element)`,
    language: "python",
    question: "Qu'affichera ce code ?",
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
      { id: "b", text: "4, '', 'vide'", isCorrect: false },
      { id: "c", text: "[1, 2, 3, 4], '', []", isCorrect: false },
      { id: "d", text: "4, '', []", isCorrect: false }
    ],
    explanation: "La fonction dernier_element renvoie le dernier élément d'une séquence ou une valeur par défaut si la séquence est vide. Pour [1, 2, 3, 4], elle renvoie 4. Pour la chaîne vide '', elle renvoie None (la valeur par défaut). Pour la liste vide [] avec 'vide' comme valeur par défaut, elle renvoie 'vide'.",
    hint: "Analysez comment la fonction gère les séquences vides et non vides."
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
    code: `from collections import Counter

texte = "Python est un langage de programmation polyvalent et puissant"
compteur = Counter(texte.lower())
lettres_frequentes = compteur.most_common(3)
print(lettres_frequentes)`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "[('p', 5), ('a', 5), ('n', 5)]", isCorrect: false },
      { id: "b", text: "[(' ', 8), ('a', 5), ('n', 5)]", isCorrect: false },
      { id: "c", text: "[(' ', 8), ('n', 5), ('a', 4)]", isCorrect: false },
      { id: "d", text: "[(' ', 8), ('a', 4), ('n', 4)]", isCorrect: true }
    ],
    explanation: "Ce code utilise la classe Counter pour compter les occurrences de chaque caractère dans la chaîne convertie en minuscules. Ensuite, most_common(3) renvoie les 3 caractères les plus fréquents avec leur nombre d'occurrences. L'espace est le plus fréquent (8 fois), suivi de 'a' et 'n' (4 fois chacun).",
    hint: "N'oubliez pas que les espaces sont aussi des caractères comptés par Counter."
  },
  {
    id: "python-intermediaire-3",
    code: `class Personne:
    def __init__(self, nom, age):
        self.nom = nom
        self.age = age
    
    def __lt__(self, autre):
        return self.age < autre.age

personnes = [
    Personne("Alice", 30),
    Personne("Bob", 25),
    Personne("Charlie", 35)
]

personnes_triees = sorted(personnes)
for p in personnes_triees:
    print(p.nom)`,
    language: "python",
    question: "Dans quel ordre les noms seront-ils affichés?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Alice, Bob, Charlie", isCorrect: false },
      { id: "b", text: "Bob, Alice, Charlie", isCorrect: true },
      { id: "c", text: "Charlie, Alice, Bob", isCorrect: false },
      { id: "d", text: "Alice, Charlie, Bob", isCorrect: false }
    ],
    explanation: "La méthode __lt__ (less than) définit comment comparer deux objets Personne. Ici, elle compare les âges. La fonction sorted() utilise cette méthode pour trier les personnes par âge croissant. Bob a 25 ans, Alice 30 ans, et Charlie 35 ans, donc ils seront triés dans cet ordre.",
    hint: "La méthode __lt__ est utilisée par sorted() pour déterminer l'ordre de tri."
  },
  {
    id: "python-intermediaire-4",
    code: `def decorator(func):
    def wrapper(*args, **kwargs):
        print("Avant l'appel")
        result = func(*args, **kwargs)
        print("Après l'appel")
        return result
    return wrapper

@decorator
def saluer(nom):
    print(f"Bonjour, {nom}!")

saluer("Alice")`,
    language: "python",
    question: "Quelle sera la sortie de ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Bonjour, Alice!", isCorrect: false },
      { id: "b", text: "Avant l'appel\nBonjour, Alice!\nAprès l'appel", isCorrect: true },
      { id: "c", text: "Avant l'appel\nAprès l'appel\nBonjour, Alice!", isCorrect: false },
      { id: "d", text: "Avant l'appel\nAprès l'appel", isCorrect: false }
    ],
    explanation: "Ce code utilise un décorateur, qui est une fonction qui prend une autre fonction en entrée et étend son comportement sans la modifier explicitement. La fonction saluer est décorée avec @decorator, ce qui signifie qu'elle est enveloppée par la fonction wrapper. Lorsque saluer est appelée, c'est en fait wrapper qui est exécutée, affichant 'Avant l'appel', puis exécutant la fonction d'origine (qui affiche 'Bonjour, Alice!'), puis affichant 'Après l'appel'.",
    hint: "Les décorateurs en Python permettent d'envelopper une fonction pour ajouter des fonctionnalités avant et après son exécution."
  },
  {
    id: "python-intermediaire-5",
    code: `import re

texte = "Contactez-nous à support@example.com ou info@company.org"
pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
emails = re.findall(pattern, texte)
print(emails)`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "['support@example.com', 'info@company.org']", isCorrect: true },
      { id: "b", text: "['support', 'info']", isCorrect: false },
      { id: "c", text: "['example.com', 'company.org']", isCorrect: false },
      { id: "d", text: "[]", isCorrect: false }
    ],
    explanation: "Ce code utilise une expression régulière pour trouver toutes les adresses e-mail dans une chaîne. Le pattern correspond à une séquence de caractères autorisés, suivie d'un @, suivie d'un nom de domaine, suivi d'un point, suivi d'une extension de domaine d'au moins 2 lettres. La fonction re.findall() renvoie toutes les correspondances trouvées dans le texte, qui sont les deux adresses e-mail.",
    hint: "L'expression régulière est conçue pour correspondre au format standard des adresses e-mail."
  },
  {
    id: "python-intermediaire-6",
    code: `nombres = [1, 2, 3, 4, 5]

carre = lambda x: x ** 2
impair = lambda x: x % 2 != 0

resultat = list(map(carre, filter(impair, nombres)))
print(resultat)`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "[1, 9, 25]", isCorrect: true },
      { id: "b", text: "[1, 3, 5]", isCorrect: false },
      { id: "c", text: "[1, 4, 9, 16, 25]", isCorrect: false },
      { id: "d", text: "[2, 4]", isCorrect: false }
    ],
    explanation: "Ce code utilise filter() pour ne garder que les nombres impairs (1, 3, 5) de la liste, puis map() pour calculer le carré de chacun de ces nombres. Le résultat est donc [1² = 1, 3² = 9, 5² = 25].",
    hint: "filter() crée un itérateur qui filtre les éléments pour lesquels la fonction renvoie True, et map() applique une fonction à chaque élément d'un itérable."
  },
  {
    id: "python-intermediaire-7",
    code: `class MaClasse:
    __compteur = 0
    
    def __init__(self):
        MaClasse.__compteur += 1
        self.__id = MaClasse.__compteur
    
    def get_id(self):
        return self.__id
    
    @classmethod
    def get_compteur(cls):
        return cls.__compteur

a = MaClasse()
b = MaClasse()
print(a.get_id())
print(b.get_id())
print(MaClasse.get_compteur())`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "1\n2\n2", isCorrect: true },
      { id: "b", text: "0\n1\n2", isCorrect: false },
      { id: "c", text: "1\n1\n2", isCorrect: false },
      { id: "d", text: "Une erreur sera générée", isCorrect: false }
    ],
    explanation: "Cette classe utilise des attributs privés (préfixés par __). __compteur est un attribut de classe qui est incrémenté chaque fois qu'une nouvelle instance est créée. Chaque instance reçoit un __id égal à la valeur actuelle de __compteur. Après avoir créé deux instances, __compteur vaut 2, a.__id vaut 1 et b.__id vaut 2.",
    hint: "Les attributs préfixés par __ sont privés en Python, mais peuvent être accédés via des méthodes comme get_id() et get_compteur()."
  },
  {
    id: "python-intermediaire-8",
    code: `from functools import reduce

nombres = [1, 2, 3, 4, 5]
resultat = reduce(lambda x, y: x * y, nombres)
print(resultat)`,
    language: "python",
    question: "Quel sera le résultat affiché?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "15", isCorrect: false },
      { id: "b", text: "120", isCorrect: true },
      { id: "c", text: "5", isCorrect: false },
      { id: "d", text: "[1, 2, 3, 4, 5]", isCorrect: false }
    ],
    explanation: "La fonction reduce() applique la fonction fournie de façon cumulative aux éléments de l'itérable, de gauche à droite, pour réduire l'itérable à une seule valeur. Ici, elle calcule ((((1 * 2) * 3) * 4) * 5) = 120, qui est le produit (factorielle) de tous les nombres de 1 à 5.",
    hint: "reduce() accumule les résultats en appliquant la fonction fournie à chaque élément et au résultat accumulé."
  },
  {
    id: "python-intermediaire-9",
    code: `def generateur():
    yield 1
    yield 2
    yield 3

g = generateur()
print(next(g))
print(next(g))
print(next(g))
try:
    print(next(g))
except StopIteration:
    print("Fin du générateur")`,
    language: "python",
    question: "Quelle sera la sortie de ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "1\n2\n3\nFin du générateur", isCorrect: true },
      { id: "b", text: "1\n2\n3\nNone", isCorrect: false },
      { id: "c", text: "1\n2\n3\nUne exception non capturée sera levée", isCorrect: false },
      { id: "d", text: "1\n2\n3\n1", isCorrect: false }
    ],
    explanation: "Un générateur est une fonction qui produit une séquence de résultats au lieu de renvoyer une seule valeur. Chaque fois que next() est appelé sur un générateur, l'exécution se poursuit jusqu'au prochain yield, qui renvoie une valeur. Après avoir généré toutes les valeurs (1, 2, 3), l'appel suivant à next() lève une exception StopIteration, qui est capturée par le bloc try-except, affichant 'Fin du générateur'.",
    hint: "Les générateurs en Python sont des fonctions spéciales qui peuvent être pausées et reprises, renvoyant une valeur à chaque yield."
  },
  {
    id: "python-intermediaire-10",
    code: `class Calculatrice:
    def __call__(self, x, y):
        return x + y

calc = Calculatrice()
resultat = calc(5, 3)
print(resultat)`,
    language: "python",
    question: "Quel nombre sera affiché?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "8", isCorrect: true },
      { id: "b", text: "5", isCorrect: false },
      { id: "c", text: "3", isCorrect: false },
      { id: "d", text: "Une erreur sera générée", isCorrect: false }
    ],
    explanation: "La méthode __call__ permet de rendre un objet 'appelable' comme une fonction. Ici, l'instance calc de la classe Calculatrice peut être appelée avec des arguments, et calc(5, 3) exécute la méthode __call__ avec x=5 et y=3, renvoyant 5 + 3 = 8.",
    hint: "Lorsqu'on 'appelle' un objet comme une fonction, c'est sa méthode __call__ qui est exécutée."
  },
  {
    id: "python-intermediaire-11",
    code: `import json

donnees = {
    "nom": "Alice",
    "age": 30,
    "langages": ["Python", "JavaScript", "C++"],
    "actif": True,
    "adresse": None
}

json_str = json.dumps(donnees, indent=2)
print(type(json_str))
print(json_str)`,
    language: "python",
    question: "Quel sera le type de json_str et quelle est la particularité de son contenu?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "<class 'str'>, et True est écrit en majuscule", isCorrect: false },
      { id: "b", text: "<class 'str'>, et True est écrit en minuscule (true)", isCorrect: true },
      { id: "c", text: "<class 'dict'>, et None devient null", isCorrect: false },
      { id: "d", text: "<class 'json'>, et les guillemets sont échappés", isCorrect: false }
    ],
    explanation: "La fonction json.dumps() convertit un objet Python en une chaîne formatée en JSON. Le type de json_str est donc 'str'. Dans JSON, les valeurs booléennes sont en minuscules (true/false), contrairement à Python où elles sont en majuscules (True/False). De même, None en Python devient null en JSON.",
    hint: "JSON et Python ont des conventions différentes pour les booléens et les valeurs nulles."
  },
  {
    id: "python-intermediaire-12",
    code: `import datetime

date1 = datetime.datetime(2023, 1, 1, 12, 0)
date2 = datetime.datetime(2023, 1, 3, 18, 30)

difference = date2 - date1
print(difference)
print(type(difference))
print(difference.total_seconds() / 3600)`,
    language: "python",
    question: "Qu'affichera la dernière ligne du code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "54.5", isCorrect: true },
      { id: "b", text: "2.25", isCorrect: false },
      { id: "c", text: "30.5", isCorrect: false },
      { id: "d", text: "3270", isCorrect: false }
    ],
    explanation: "Ce code calcule la différence entre deux dates, qui est un objet timedelta. La différence entre le 3 janvier 18h30 et le 1er janvier 12h00 est de 2 jours et 6.5 heures. La méthode total_seconds() renvoie le nombre total de secondes, et en divisant par 3600 (nombre de secondes dans une heure), on obtient le nombre d'heures : (2*24 + 6.5) = 54.5 heures.",
    hint: "Pour convertir des secondes en heures, divisez par 3600."
  },
  {
    id: "python-intermediaire-13",
    code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

print(insertion_sort([5, 2, 9, 1, 5, 6]))`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "[1, 2, 5, 5, 6, 9]", isCorrect: true },
      { id: "b", text: "[9, 6, 5, 5, 2, 1]", isCorrect: false },
      { id: "c", text: "[5, 2, 9, 1, 5, 6]", isCorrect: false },
      { id: "d", text: "[1, 5, 9, 2, 5, 6]", isCorrect: false }
    ],
    explanation: "Cette fonction implémente l'algorithme de tri par insertion. Elle parcourt la liste élément par élément, et à chaque étape, insère l'élément courant à sa position correcte dans la partie déjà triée. Le résultat est la liste triée par ordre croissant.",
    hint: "Le tri par insertion maintient une sous-liste triée et y insère chaque nouvel élément à la bonne position."
  },
  {
    id: "python-intermediaire-14",
    code: `class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)
    
    def __str__(self):
        return f"({self.x}, {self.y})"

p1 = Point(1, 2)
p2 = Point(3, 4)
p3 = p1 + p2
print(p3)`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "(4, 6)", isCorrect: true },
      { id: "b", text: "Point(4, 6)", isCorrect: false },
      { id: "c", text: "[4, 6]", isCorrect: false },
      { id: "d", text: "Une erreur sera générée", isCorrect: false }
    ],
    explanation: "Ce code définit une classe Point avec une surcharge de l'opérateur + via la méthode __add__. Lorsqu'on écrit p1 + p2, Python appelle p1.__add__(p2), qui crée un nouveau Point avec les coordonnées x et y additionnées. La méthode __str__ définit comment l'objet est converti en chaîne, donc print(p3) affiche '(4, 6)'.",
    hint: "La surcharge d'opérateurs en Python permet de définir le comportement des opérateurs standards pour nos propres classes."
  },
  {
    id: "python-intermediaire-15",
    code: `class ParentA:
    def methode(self):
        return "ParentA"

class ParentB:
    def methode(self):
        return "ParentB"

class Enfant(ParentB, ParentA):
    pass

e = Enfant()
print(e.methode())`,
    language: "python",
    question: "Qu'affichera ce code?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "ParentA", isCorrect: false },
      { id: "b", text: "ParentB", isCorrect: true },
      { id: "c", text: "ParentAParentB", isCorrect: false },
      { id: "d", text: "Une erreur sera générée", isCorrect: false }
    ],
    explanation: "Ce code illustre l'héritage multiple en Python. Lorsqu'une méthode est appelée sur un objet, Python recherche cette méthode en suivant l'ordre de résolution des méthodes (Method Resolution Order, MRO). Dans cet exemple, la classe Enfant hérite de ParentB puis de ParentA, donc la méthode de ParentB est trouvée en premier.",
    hint: "L'ordre dans lequel les classes parentes sont listées dans la définition de la classe Enfant détermine l'ordre de recherche des méthodes."
  }
];

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

// Défis SQL - Niveau Débutant
export const sqlDebutant: CodeChallenge[] = [
  {
    id: "sql-debutant-1",
    code: `SELECT name, age
FROM users
WHERE age > 30
ORDER BY age DESC;`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle affiche le nom et l'âge des utilisateurs de plus de 30 ans, classés du plus âgé au plus jeune", isCorrect: true },
      { id: "b", text: "Elle affiche le nom et l'âge de tous les utilisateurs, classés du plus jeune au plus âgé", isCorrect: false },
      { id: "c", text: "Elle affiche le nom et l'âge des utilisateurs de plus de 30 ans, classés par ordre alphabétique", isCorrect: false },
      { id: "d", text: "Elle affiche le nom et l'âge des utilisateurs de moins de 30 ans", isCorrect: false }
    ],
    explanation: "Cette requête sélectionne les colonnes name et age de la table users, filtre pour ne garder que les utilisateurs dont l'âge est supérieur à 30, et trie les résultats par âge en ordre décroissant (du plus grand au plus petit, donc du plus âgé au plus jeune).",
    hint: "ORDER BY ... DESC trie les résultats dans l'ordre décroissant."
  },
  {
    id: "sql-debutant-2",
    code: `SELECT COUNT(*) AS total_products,
       AVG(price) AS average_price
FROM products
WHERE category = 'Electronics';`,
    language: "sql",
    question: "Que calcule cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Le nombre total de produits et le prix moyen de tous les produits", isCorrect: false },
      { id: "b", text: "Le nombre total de produits électroniques et leur prix moyen", isCorrect: true },
      { id: "c", text: "Le nombre de catégories et le prix moyen par catégorie", isCorrect: false },
      { id: "d", text: "Le prix total et le prix moyen des produits électroniques", isCorrect: false }
    ],
    explanation: "Cette requête utilise des fonctions d'agrégation pour calculer: 1) le nombre total de produits (COUNT(*)) et 2) le prix moyen (AVG(price)) des produits dans la catégorie 'Electronics'.",
    hint: "COUNT(*) compte le nombre de lignes, et AVG(price) calcule la moyenne des valeurs de la colonne price."
  },
  {
    id: "sql-debutant-3",
    code: `SELECT customers.name, orders.order_date
FROM customers
JOIN orders ON customers.id = orders.customer_id
WHERE orders.total > 1000
ORDER BY orders.order_date DESC
LIMIT 5;`,
    language: "sql",
    question: "Que renvoie cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Les 5 clients qui ont passé les commandes les plus récentes de plus de 1000€", isCorrect: true },
      { id: "b", text: "Les 5 clients qui ont passé le plus de commandes", isCorrect: false },
      { id: "c", text: "Les 5 clients qui ont dépensé le plus d'argent", isCorrect: false },
      { id: "d", text: "Les 5 commandes les plus anciennes de plus de 1000€", isCorrect: false }
    ],
    explanation: "Cette requête joint les tables customers et orders pour associer chaque commande à son client. Elle filtre pour ne garder que les commandes dont le total dépasse 1000, trie les résultats par date de commande décroissante (du plus récent au plus ancien), et limite le résultat aux 5 premières lignes.",
    hint: "La clause LIMIT 5 restreint le résultat aux 5 premières lignes après le tri."
  },
  {
    id: "sql-debutant-4",
    code: `INSERT INTO employees (first_name, last_name, email, hire_date, department_id)
VALUES ('John', 'Doe', 'john.doe@example.com', '2023-01-15', 3);`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle met à jour les informations de l'employé John Doe", isCorrect: false },
      { id: "b", text: "Elle ajoute un nouvel employé dans la table employees", isCorrect: true },
      { id: "c", text: "Elle supprime l'employé John Doe de la table employees", isCorrect: false },
      { id: "d", text: "Elle vérifie si John Doe existe dans la table employees", isCorrect: false }
    ],
    explanation: "Cette requête utilise l'instruction INSERT INTO pour ajouter une nouvelle ligne dans la table employees. Elle spécifie les colonnes à remplir et les valeurs correspondantes pour créer un nouvel enregistrement d'employé.",
    hint: "INSERT INTO est utilisé pour ajouter de nouvelles données dans une table."
  },
  {
    id: "sql-debutant-5",
    code: `UPDATE products
SET price = price * 1.1
WHERE category = 'Books' AND price < 20;`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle augmente de 10% le prix de tous les livres", isCorrect: false },
      { id: "b", text: "Elle augmente de 10% le prix des livres coûtant moins de 20€", isCorrect: true },
      { id: "c", text: "Elle fixe le prix de tous les livres à 1.1 fois leur catégorie", isCorrect: false },
      { id: "d", text: "Elle vérifie quels livres ont un prix inférieur à 20€", isCorrect: false }
    ],
    explanation: "Cette requête utilise l'instruction UPDATE pour modifier les données existantes. Elle augmente le prix de 10% (en le multipliant par 1.1) pour tous les produits de la catégorie 'Books' dont le prix actuel est inférieur à 20.",
    hint: "price * 1.1 correspond à une augmentation de 10% du prix actuel."
  },
  {
    id: "sql-debutant-6",
    code: `SELECT department_name, COUNT(employees.id) AS employee_count
FROM departments
LEFT JOIN employees ON departments.id = employees.department_id
GROUP BY department_name
ORDER BY employee_count DESC;`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle compte le nombre d'employés dans chaque département, y compris les départements sans employés", isCorrect: true },
      { id: "b", text: "Elle liste tous les départements qui ont au moins un employé", isCorrect: false },
      { id: "c", text: "Elle compte le nombre de départements pour chaque employé", isCorrect: false },
      { id: "d", text: "Elle affiche uniquement les départements qui ont le plus d'employés", isCorrect: false }
    ],
    explanation: "Cette requête utilise un LEFT JOIN pour combiner les tables departments et employees, ce qui garantit que tous les départements sont inclus même s'ils n'ont pas d'employés. Elle groupe ensuite les résultats par nom de département et compte le nombre d'employés dans chaque groupe. Enfin, elle trie les résultats par nombre d'employés décroissant.",
    hint: "LEFT JOIN permet d'inclure tous les enregistrements de la table de gauche (departments), même ceux qui n'ont pas de correspondance dans la table de droite (employees)."
  },
  {
    id: "sql-debutant-7",
    code: `DELETE FROM orders
WHERE order_date < '2020-01-01';`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Elle supprime toutes les commandes", isCorrect: false },
      { id: "b", text: "Elle supprime les commandes passées avant 2020", isCorrect: true },
      { id: "c", text: "Elle archive les commandes antérieures à 2020", isCorrect: false },
      { id: "d", text: "Elle masque les commandes passées avant 2020 dans les résultats", isCorrect: false }
    ],
    explanation: "Cette requête utilise l'instruction DELETE FROM pour supprimer des données de la table orders. Elle supprime toutes les lignes où la date de commande (order_date) est antérieure au 1er janvier 2020.",
    hint: "DELETE FROM supprime définitivement les lignes qui correspondent à la condition WHERE."
  },
  {
    id: "sql-debutant-8",
    code: `SELECT category, SUM(price * quantity) AS total_sales
FROM order_items
JOIN products ON order_items.product_id = products.id
GROUP BY category
HAVING SUM(price * quantity) > 10000;`,
    language: "sql",
    question: "Que calcule cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Le montant total des ventes pour chaque catégorie, mais n'affiche que celles dépassant 10000€", isCorrect: true },
      { id: "b", text: "Le nombre de produits vendus dans chaque catégorie", isCorrect: false },
      { id: "c", text: "Les catégories qui ont plus de 10000 produits", isCorrect: false },
      { id: "d", text: "Le prix moyen des produits par catégorie", isCorrect: false }
    ],
    explanation: "Cette requête calcule le montant total des ventes (prix × quantité) pour chaque catégorie de produits. Elle utilise GROUP BY pour regrouper les résultats par catégorie, et HAVING pour filtrer les groupes après l'agrégation, ne gardant que ceux où le total des ventes dépasse 10000.",
    hint: "HAVING filtre les groupes après l'agrégation, contrairement à WHERE qui filtre les lignes avant l'agrégation."
  },
  {
    id: "sql-debutant-9",
    code: `SELECT DISTINCT city
FROM customers
WHERE country = 'France'
ORDER BY city;`,
    language: "sql",
    question: "Que renvoie cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "La liste des villes françaises où habitent des clients, sans doublons et par ordre alphabétique", isCorrect: true },
      { id: "b", text: "Le nombre de clients par ville en France", isCorrect: false },
      { id: "c", text: "La liste de tous les clients français avec leur ville", isCorrect: false },
      { id: "d", text: "La ville française qui compte le plus de clients", isCorrect: false }
    ],
    explanation: "Cette requête sélectionne la colonne city de la table customers, mais avec le mot-clé DISTINCT qui élimine les doublons. Elle filtre pour ne garder que les lignes où le pays est 'France' et trie les résultats par ordre alphabétique des villes.",
    hint: "DISTINCT supprime les valeurs en double dans les résultats de la requête."
  },
  {
    id: "sql-debutant-10",
    code: `SELECT customers.name, 
       COALESCE(SUM(orders.total), 0) AS total_spent
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
GROUP BY customers.name
ORDER BY total_spent DESC;`,
    language: "sql",
    question: "Quel est le but de cette requête SQL?",
    difficulty: "débutant",
    responses: [
      { id: "a", text: "Calculer combien chaque client a dépensé au total, y compris ceux qui n'ont jamais commandé (affichés avec 0)", isCorrect: true },
      { id: "b", text: "Trouver le client qui a dépensé le plus d'argent", isCorrect: false },
      { id: "c", text: "Calculer le montant moyen dépensé par chaque client", isCorrect: false },
      { id: "d", text: "Compter le nombre de commandes passées par chaque client", isCorrect: false }
    ],
    explanation: "Cette requête calcule le montant total dépensé par chaque client en additionnant les montants de leurs commandes. Elle utilise LEFT JOIN pour inclure tous les clients, même ceux qui n'ont pas de commandes, et COALESCE pour remplacer les valeurs NULL (pour les clients sans commandes) par 0. Les résultats sont triés par montant total décroissant.",
    hint: "COALESCE(x, y) renvoie y si x est NULL, sinon il renvoie x."
  }
];

// Défis SQL - Niveau Intermédiaire
export const sqlIntermediaire: CodeChallenge[] = [
  {
    id: "sql-intermediaire-1",
    code: `WITH monthly_sales AS (
  SELECT 
    DATE_TRUNC('month', order_date) AS month,
    SUM(total) AS total_sales
  FROM orders
  WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', order_date)
)
SELECT 
  month,
  total_sales,
  LAG(total_sales, 1) OVER (ORDER BY month) AS previous_month_sales,
  (total_sales - LAG(total_sales, 1) OVER (ORDER BY month)) / LAG(total_sales, 1) OVER (ORDER BY month) * 100 AS growth_percentage
FROM monthly_sales
ORDER BY month;`,
    language: "sql",
    question: "Que calcule cette requête SQL?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Les ventes mensuelles totales et le pourcentage de croissance par rapport au mois précédent", isCorrect: true },
      { id: "b", text: "Les ventes totales de l'année et leur répartition mensuelle", isCorrect: false },
      { id: "c", text: "Le nombre de commandes par mois et leur valeur moyenne", isCorrect: false },
      { id: "d", text: "Les mois où les ventes ont dépassé un certain seuil", isCorrect: false }
    ],
    explanation: "Cette requête utilise une CTE (Common Table Expression) pour calculer d'abord les ventes mensuelles totales sur les 12 derniers mois. Ensuite, elle utilise la fonction de fenêtrage LAG() pour accéder aux ventes du mois précédent pour chaque mois. Enfin, elle calcule le pourcentage de croissance en comparant les ventes actuelles avec celles du mois précédent.",
    hint: "La fonction LAG() permet d'accéder aux valeurs des lignes précédentes dans un ensemble de résultats ordonné."
  },
  {
    id: "sql-intermediaire-2",
    code: `SELECT 
  product_name,
  price,
  category,
  RANK() OVER (PARTITION BY category ORDER BY price DESC) AS price_rank
FROM products
WHERE is_active = TRUE
HAVING price_rank <= 3
ORDER BY category, price_rank;`,
    language: "sql",
    question: "Quel est l'objectif de cette requête SQL?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Trouver les 3 produits les plus chers dans chaque catégorie", isCorrect: true },
      { id: "b", text: "Classer tous les produits par prix décroissant au sein de leur catégorie", isCorrect: false },
      { id: "c", text: "Calculer le prix moyen des produits par catégorie", isCorrect: false },
      { id: "d", text: "Identifier les catégories qui ont moins de 3 produits", isCorrect: false }
    ],
    explanation: "Cette requête utilise la fonction de fenêtrage RANK() pour attribuer un rang à chaque produit au sein de sa catégorie, en fonction de son prix (du plus élevé au plus bas). La clause HAVING filtre les résultats pour ne garder que les produits ayant un rang inférieur ou égal à 3, c'est-à-dire les 3 produits les plus chers de chaque catégorie.",
    hint: "PARTITION BY divise les données en partitions sur lesquelles les fonctions de fenêtrage sont appliquées séparément."
  },
  {
    id: "sql-intermediaire-3",
    code: `SELECT 
  user_id,
  AVG(time_spent) AS avg_time,
  CASE 
    WHEN AVG(time_spent) < 60 THEN 'Visiteur rapide'
    WHEN AVG(time_spent) BETWEEN 60 AND 300 THEN 'Visiteur standard'
    ELSE 'Visiteur engagé'
  END AS user_category
FROM page_visits
GROUP BY user_id
ORDER BY avg_time DESC;`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Elle classe les utilisateurs en trois catégories selon leur temps moyen passé sur le site", isCorrect: true },
      { id: "b", text: "Elle calcule le temps total passé par chaque utilisateur sur le site", isCorrect: false },
      { id: "c", text: "Elle identifie les pages sur lesquelles les utilisateurs passent le plus de temps", isCorrect: false },
      { id: "d", text: "Elle compte le nombre de visites par utilisateur", isCorrect: false }
    ],
    explanation: "Cette requête calcule le temps moyen passé sur le site pour chaque utilisateur, puis utilise une expression CASE pour classer les utilisateurs en trois catégories: 'Visiteur rapide' (moins de 60 secondes en moyenne), 'Visiteur standard' (entre 60 et 300 secondes) ou 'Visiteur engagé' (plus de 300 secondes).",
    hint: "L'expression CASE permet de créer une logique conditionnelle dans une requête SQL, similaire à if-else en programmation."
  },
  {
    id: "sql-intermediaire-4",
    code: `SELECT 
  departments.name AS department,
  ROUND(AVG(employees.salary), 2) AS avg_salary,
  ROUND(AVG(CASE WHEN employees.gender = 'F' THEN employees.salary END), 2) AS avg_female_salary,
  ROUND(AVG(CASE WHEN employees.gender = 'M' THEN employees.salary END), 2) AS avg_male_salary,
  ROUND(COUNT(CASE WHEN employees.gender = 'F' THEN 1 END) * 100.0 / COUNT(*), 2) AS female_percentage
FROM employees
JOIN departments ON employees.department_id = departments.id
GROUP BY departments.name
ORDER BY department;`,
    language: "sql",
    question: "Quelles informations cette requête SQL analyse-t-elle?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Les disparités salariales et la représentation par genre dans chaque département", isCorrect: true },
      { id: "b", text: "L'ancienneté moyenne des employés par département et par genre", isCorrect: false },
      { id: "c", text: "Le nombre total d'employés et leur répartition dans les départements", isCorrect: false },
      { id: "d", text: "Les départements ayant le plus grand écart de salaire entre les employés", isCorrect: false }
    ],
    explanation: "Cette requête analyse les données salariales par département et par genre. Pour chaque département, elle calcule: le salaire moyen global, le salaire moyen des femmes, le salaire moyen des hommes, et le pourcentage de femmes. Elle utilise CASE WHEN dans des fonctions d'agrégation pour calculer des statistiques conditionnelles.",
    hint: "L'expression CASE WHEN employees.gender = 'F' THEN ... END ne prend en compte que les employées féminines dans le calcul."
  },
  {
    id: "sql-intermediaire-5",
    code: `WITH RECURSIVE subordinates AS (
  -- Manager initial
  SELECT id, name, manager_id, 1 AS level
  FROM employees
  WHERE id = 42
  
  UNION ALL
  
  -- Récursion pour trouver tous les subordonnés
  SELECT e.id, e.name, e.manager_id, s.level + 1
  FROM employees e
  JOIN subordinates s ON e.manager_id = s.id
)
SELECT id, name, level
FROM subordinates
ORDER BY level, name;`,
    language: "sql",
    question: "Que fait cette requête SQL?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Elle affiche tous les subordonnés directs et indirects de l'employé 42, avec leur niveau hiérarchique", isCorrect: true },
      { id: "b", text: "Elle trouve tous les managers au-dessus de l'employé 42", isCorrect: false },
      { id: "c", text: "Elle calcule le nombre de niveaux hiérarchiques dans l'entreprise", isCorrect: false },
      { id: "d", text: "Elle identifie les employés qui n'ont pas de manager", isCorrect: false }
    ],
    explanation: "Cette requête utilise une CTE (Common Table Expression) récursive pour explorer la hiérarchie des employés. Elle commence par l'employé dont l'ID est 42, puis trouve récursivement tous les employés qui ont cet employé (ou ses subordonnés) comme manager. Le résultat est une liste de tous les subordonnés directs et indirects, avec leur niveau dans la hiérarchie.",
    hint: "Les CTEs récursives ont une partie initiale (avant UNION ALL) qui définit le point de départ, et une partie récursive qui définit comment explorer davantage."
  },
  {
    id: "sql-intermediaire-6",
    code: `SELECT
  DATE_TRUNC('month', order_date) AS month,
  region,
  SUM(total) AS total_sales,
  SUM(SUM(total)) OVER (PARTITION BY region ORDER BY DATE_TRUNC('month', order_date)) AS cumulative_sales,
  ROUND(SUM(total) * 100.0 / SUM(SUM(total)) OVER (PARTITION BY region), 2) AS percentage_of_total
FROM orders
JOIN customers ON orders.customer_id = customers.id
WHERE order_date >= '2022-01-01' AND order_date < '2023-01-01'
GROUP BY DATE_TRUNC('month', order_date), region
ORDER BY region, month;`,
    language: "sql",
    question: "Quelles métriques cette requête SQL calcule-t-elle?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Les ventes mensuelles, les ventes cumulatives et le pourcentage du total par région", isCorrect: true },
      { id: "b", text: "Le nombre de commandes par mois et par région", isCorrect: false },
      { id: "c", text: "La valeur moyenne des commandes par région et par mois", isCorrect: false },
      { id: "d", text: "Les régions avec les meilleures ventes pour chaque mois", isCorrect: false }
    ],
    explanation: "Cette requête analyse les ventes de 2022 par mois et par région. Pour chaque combinaison mois/région, elle calcule: le total des ventes du mois, le total cumulatif des ventes jusqu'à ce mois (pour cette région), et le pourcentage que représente ce mois dans le total annuel de la région. Elle utilise des fonctions de fenêtrage (OVER) pour effectuer ces calculs sans avoir besoin de sous-requêtes multiples.",
    hint: "La clause OVER (PARTITION BY ... ORDER BY ...) définit le 'cadre' sur lequel les fonctions de fenêtrage sont appliquées."
  },
  {
    id: "sql-intermediaire-7",
    code: `SELECT 
  customer_id,
  order_id,
  order_date,
  total,
  ROUND(AVG(total) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS moving_avg_3_orders
FROM orders
ORDER BY customer_id, order_date;`,
    language: "sql",
    question: "Que calcule cette requête SQL?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "La moyenne mobile sur les 3 dernières commandes de chaque client", isCorrect: true },
      { id: "b", text: "Le total des 3 dernières commandes pour chaque client", isCorrect: false },
      { id: "c", text: "La moyenne des montants de commande pour chaque client", isCorrect: false },
      { id: "d", text: "Les 3 commandes les plus récentes de chaque client", isCorrect: false }
    ],
    explanation: "Cette requête calcule une moyenne mobile sur les commandes de chaque client. Pour chaque commande, elle calcule la moyenne du montant de cette commande et des 2 commandes précédentes du même client (ou moins s'il y a moins de 2 commandes précédentes). C'est un exemple d'analyse de séries temporelles en SQL.",
    hint: "La clause ROWS BETWEEN 2 PRECEDING AND CURRENT ROW définit une fenêtre glissante qui inclut la ligne actuelle et les 2 lignes précédentes."
  },
  {
    id: "sql-intermediaire-8",
    code: `SELECT 
  product_id,
  order_date,
  quantity,
  SUM(quantity) OVER (PARTITION BY product_id ORDER BY order_date) AS running_total,
  CASE
    WHEN LAG(order_date) OVER (PARTITION BY product_id ORDER BY order_date) IS NULL THEN NULL
    ELSE order_date - LAG(order_date) OVER (PARTITION BY product_id ORDER BY order_date)
  END AS days_since_last_order
FROM order_items
JOIN orders ON order_items.order_id = orders.id
WHERE product_id IN (
  SELECT product_id
  FROM order_items
  GROUP BY product_id
  ORDER BY COUNT(*) DESC
  LIMIT 5
)
ORDER BY product_id, order_date;`,
    language: "sql",
    question: "Quelles informations cette requête SQL analyse-t-elle?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Les tendances de vente et la fréquence d'achat pour les 5 produits les plus commandés", isCorrect: true },
      { id: "b", text: "Les 5 commandes les plus importantes en termes de quantité", isCorrect: false },
      { id: "c", text: "Les produits qui n'ont pas été commandés depuis longtemps", isCorrect: false },
      { id: "d", text: "Le délai moyen entre les commandes pour chaque produit", isCorrect: false }
    ],
    explanation: "Cette requête analyse l'historique des commandes pour les 5 produits les plus populaires (ceux qui apparaissent dans le plus grand nombre de commandes). Pour chaque commande de ces produits, elle calcule: le total cumulatif des quantités vendues jusqu'à cette date, et le nombre de jours écoulés depuis la commande précédente du même produit.",
    hint: "La sous-requête dans la clause WHERE sélectionne les 5 produits les plus fréquemment commandés, puis la requête principale analyse leur historique de vente."
  },
  {
    id: "sql-intermediaire-9",
    code: `SELECT 
  u.name,
  COUNT(o.id) AS order_count,
  ROUND(AVG(o.total), 2) AS avg_order_value,
  ROUND(SUM(o.total), 2) AS total_spent,
  MAX(o.order_date) AS last_order_date,
  CASE
    WHEN MAX(o.order_date) >= CURRENT_DATE - INTERVAL '3 months' THEN 'Actif'
    WHEN MAX(o.order_date) >= CURRENT_DATE - INTERVAL '6 months' THEN 'En risque'
    ELSE 'Inactif'
  END AS customer_status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;`,
    language: "sql",
    question: "Quel est l'objectif de cette requête SQL?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Créer un tableau de bord d'analyse de clientèle avec segmentation par statut d'activité", isCorrect: true },
      { id: "b", text: "Identifier les clients inactifs pour une campagne de relance", isCorrect: false },
      { id: "c", text: "Calculer la valeur totale des commandes par utilisateur", isCorrect: false },
      { id: "d", text: "Trouver les clients qui ont commandé au cours des 3 derniers mois", isCorrect: false }
    ],
    explanation: "Cette requête crée un tableau de bord complet d'analyse client. Pour chaque client ayant passé au moins une commande, elle calcule: le nombre total de commandes, la valeur moyenne des commandes, le montant total dépensé, la date de la dernière commande, et attribue un statut ('Actif', 'En risque' ou 'Inactif') en fonction de la date de la dernière commande.",
    hint: "La requête segmente les clients en trois catégories selon la récence de leur dernière commande, une technique courante en analyse RFM (Récence, Fréquence, Montant)."
  },
  {
    id: "sql-intermediaire-10",
    code: `WITH month_stats AS (
  SELECT
    DATE_TRUNC('month', order_date) AS month,
    COUNT(DISTINCT user_id) AS monthly_active_users,
    COUNT(id) AS total_orders,
    SUM(total) AS total_revenue,
    SUM(total) / COUNT(id) AS avg_order_value
  FROM orders
  WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', order_date)
),
prev_month_stats AS (
  SELECT
    month,
    monthly_active_users,
    LAG(monthly_active_users) OVER (ORDER BY month) AS prev_month_users,
    total_orders,
    LAG(total_orders) OVER (ORDER BY month) AS prev_month_orders,
    total_revenue,
    LAG(total_revenue) OVER (ORDER BY month) AS prev_month_revenue,
    avg_order_value
  FROM month_stats
)
SELECT
  month,
  monthly_active_users,
  ROUND((monthly_active_users - prev_month_users) * 100.0 / prev_month_users, 2) AS user_growth,
  total_orders,
  ROUND((total_orders - prev_month_orders) * 100.0 / prev_month_orders, 2) AS order_growth,
  total_revenue,
  ROUND((total_revenue - prev_month_revenue) * 100.0 / prev_month_revenue, 2) AS revenue_growth,
  avg_order_value
FROM prev_month_stats
WHERE prev_month_users IS NOT NULL
ORDER BY month;`,
    language: "sql",
    question: "Que produit cette requête SQL?",
    difficulty: "intermédiaire",
    responses: [
      { id: "a", text: "Un rapport mensuel de performance avec calculs de croissance pour les utilisateurs, commandes et revenus", isCorrect: true },
      { id: "b", text: "Une prévision des ventes futures basée sur les tendances historiques", isCorrect: false },
      { id: "c", text: "Une comparaison des performances entre différentes catégories de produits", isCorrect: false },
      { id: "d", text: "Une analyse de la saisonnalité des ventes au cours de l'année", isCorrect: false }
    ],
    explanation: "Cette requête génère un rapport mensuel complet qui analyse les performances commerciales sur les 12 derniers mois. Pour chaque mois, elle calcule: le nombre d'utilisateurs actifs, le nombre total de commandes, le revenu total et la valeur moyenne des commandes. De plus, elle calcule le pourcentage de croissance pour les utilisateurs, les commandes et les revenus par rapport au mois précédent.",
    hint: "La requête utilise deux CTEs (Common Table Expressions): la première pour calculer les métriques mensuelles, et la seconde pour accéder aux valeurs du mois précédent afin de calculer les taux de croissance."
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
  
  // Sinon, sélectionner aléatoirement le nombre demandé
  const shuffled = [...challenges].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}