import React from 'react';
import LightVersionGame from './index-light';

// Nous utilisons la version légère implémentée en React pur
// car la version Phaser posait des problèmes de performance
export default function CyberDefenseTower() {
  return <LightVersionGame />;
}