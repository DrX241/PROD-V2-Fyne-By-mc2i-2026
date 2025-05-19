import bcryptjs from 'bcryptjs';

// Nouveau mot de passe
const newPassword = "Hey!Bienvenuechezmc2i,enfin,sur,fyne:)2025@2025";

// Générer le hash
const saltRounds = 10;
const hash = bcryptjs.hashSync(newPassword, saltRounds);

console.log("Nouveau hash de mot de passe:");
console.log(hash);